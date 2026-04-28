const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");
const AppError = require("../utils/app-error");

// ─── Load prompt files at startup ────────────────────────────────────────────

const promptsDir = path.join(__dirname, "../prompts");

const DETECTION_SYSTEM = fs.readFileSync(
  path.join(promptsDir, "archetype-detection.txt"),
  "utf-8",
);

const TEASER_SYSTEM = fs.readFileSync(
  path.join(promptsDir, "archetype-teaser.txt"),
  "utf-8",
);

const QUOTES_SYSTEM = fs.readFileSync(
  path.join(promptsDir, "archetype-quotes.txt"),
  "utf-8",
);

const REPORT_SYSTEM = fs.readFileSync(
  path.join(promptsDir, "archetype-report.txt"),
  "utf-8",
);

const {
  fixedIntro: FIXED_INTRO,
  subtitles: ARCHETYPE_SUBTITLES,
  descriptions: ARCHETYPE_DESCRIPTIONS,
} = JSON.parse(
  fs.readFileSync(path.join(promptsDir, "archetype-descriptions.json"), "utf-8"),
);

// ─── Anthropic client factory ─────────────────────────────────────────────────

const client = () => {
  if (!process.env.CLAUDE_API_KEY) {
    throw new AppError("Claude API key is not configured", 500, "CLAUDE_NOT_CONFIGURED");
  }
  return new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
};

// ─── Claude call helper ───────────────────────────────────────────────────────

const callClaude = async (anthropic, systemPrompt, userMessage, maxTokens) => {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });
    return message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
  } catch (error) {
    const status = error.status;
    if (status === 401) throw new AppError("Claude API key is invalid or expired", 500, "CLAUDE_NOT_CONFIGURED");
    if (status === 429) throw new AppError("Claude API rate limit exceeded, please try again later", 429, "RATE_LIMITED");
    throw new AppError(error.message || "Claude analysis failed", 500, "CLAUDE_ERROR");
  }
};

// ─── Main service function ────────────────────────────────────────────────────

const analyzeArchetype = async ({ transcript }) => {
  const anthropic = client();

  // ── Step 1: Detect archetype (sequential — all other prompts depend on this)
  const rawArchetype = await callClaude(
    anthropic,
    DETECTION_SYSTEM,
    `Analyze this session transcript and return the dominant archetype name:\n\n---TRANSCRIPT START---\n${transcript}\n---TRANSCRIPT END---`,
    20,
  );

  const archetypeName = rawArchetype.trim();
  const validArchetypes = ["Storyteller", "Framer", "Archivist", "Artist", "Integrator"];

  if (!validArchetypes.includes(archetypeName)) {
    throw new AppError(`Unexpected archetype returned by AI: "${archetypeName}"`, 500, "CLAUDE_ERROR");
  }

  const archetypeSubtitle = ARCHETYPE_SUBTITLES[archetypeName];
  const archetypeDescription = ARCHETYPE_DESCRIPTIONS[archetypeName];
  const isShortTranscript = transcript.trim().split(/\s+/).length < 50;

  // ── Step 2, 3 & 4: Run in parallel once archetype is known
  const [teaserRaw, quotesRaw, reportRaw] = await Promise.all([
    // Prompt 2 — teaser lines
    callClaude(
      anthropic,
      TEASER_SYSTEM,
      `The person's dominant archetype is: ${archetypeName}\n\nArchetype description for reference:\n${archetypeDescription}\n\nWrite 4 short teaser lines that reveal this person's thinking style across 4 dimensions.\nReturn exactly 4 lines, one per line, no labels or numbers.`,
      200,
    ),
    // Prompt 3 — quotes + meanings
    callClaude(
      anthropic,
      QUOTES_SYSTEM,
      `Dominant archetype: ${archetypeName}\n\nSession transcript:\n---TRANSCRIPT START---\n${transcript}\n---TRANSCRIPT END---\n\nSelect the 4 quotes that best demonstrate the ${archetypeName} thinking pattern.\nFollow the output format exactly.`,
      1200,
    ),
    // Prompt 4 — full report
    callClaude(
      anthropic,
      REPORT_SYSTEM,
      `Generate the full Aesthetic Archetype Portrait Report.\n\nArchetype detected: ${archetypeName}\nArchetype subtitle: ${archetypeSubtitle}\n\nUSE THIS INTRO PARAGRAPH VERBATIM — DO NOT CHANGE ANY WORD:\n---\n${FIXED_INTRO}\n---\n\nARCHETYPE DESCRIPTION TO USE FOR ALL SECTIONS:\n${archetypeDescription}`,
      1500,
    ),
  ]);

  // ── Parse teaser lines
  const teaserLines = teaserRaw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, 4);

  // ── Parse report sections
  const reportSections = parseReportSections(reportRaw);

  // ── Parse quotes
  const quotes = parseQuotes(quotesRaw);

  return {
    archetype: {
      name: archetypeName,
      subtitle: archetypeSubtitle,
      isShortTranscript,
    },
    // Screens 3-6: one line per reveal card
    teaserCards: teaserLines,
    // Screen 8: "What You Said and What It Reveals"
    quotesAndMeanings: quotes,
    // Screen 9: full scrollable report
    report: {
      intro: FIXED_INTRO,
      sections: reportSections,
      raw: reportRaw,
    },
  };
};

// ─── Parse report into structured sections ───────────────────────────────────

const SECTION_HEADINGS = [
  "Your Primary Aesthetic Archetype",
  "What shapes this thinking",
  "What you do",
  "Why this matters",
  "Where this might show up?",
  "Your growing edge",
  "Expanding Your Range",
];

const parseReportSections = (reportText) => {
  const sections = [];

  const headingPattern = new RegExp(
    `(${SECTION_HEADINGS.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")}|Moving toward the \\w+)`,
    "g",
  );

  const parts = reportText.split(headingPattern).filter((p) => p.trim());

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    const isHeading =
      SECTION_HEADINGS.includes(part) || /^Moving toward the \w+$/.test(part);

    if (isHeading && i + 1 < parts.length) {
      sections.push({
        heading: part,
        body: parts[i + 1].trim(),
      });
      i++;
    }
  }

  return sections;
};

// ─── Parse quotes from Prompt 3 output ───────────────────────────────────────

const parseQuotes = (quotesText) => {
  return quotesText
    .split(/QUOTE \d+:/i)
    .slice(1)
    .map((block) => {
      const lines = block.trim().split("\n").filter((l) => l.trim());
      const quoteLine = lines[0]?.replace(/^["""«»]+|["""«»]+$/g, "").trim() ?? "";
      const meaningIdx = lines.findIndex((l) => /^Meaning:/i.test(l.trim()));
      const meaning =
        meaningIdx !== -1
          ? lines
              .slice(meaningIdx)
              .join(" ")
              .replace(/^Meaning:\s*/i, "")
              .trim()
          : "";
      return { quote: quoteLine, meaning };
    })
    .filter((q) => q.quote.length > 0)
    .slice(0, 4);
};

module.exports = { analyzeArchetype };
