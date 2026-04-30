const Anthropic = require("@anthropic-ai/sdk");
const AppError = require("../utils/app-error");

const client = () => {
  if (!process.env.CLAUDE_API_KEY) {
    throw new AppError(
      "Claude API key is not configured",
      500,
      "CLAUDE_NOT_CONFIGURED",
    );
  }
  return new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
};

// ─── Static lookup tables ───────────────────────────────────────────────────

const ARCHETYPE_SUBTITLES = {
  Storyteller: "Narrative Maker",
  Framer: "Structure Seeker",
  Archivist: "Context Builder",
  Artist: "Emotional Explorer",
  Integrator: "Reflective Synthesiser",
};

const ARCHETYPE_DESCRIPTIONS = {
  Storyteller: `You hold the image as a living scene. Personal memories, emotions, and idiosyncratic associations arrive before analysis — you notice what is present and what is absent, what belongs and what doesn't, and you animate the particulars with your own interior world. Your thinking is associative and grounded in the specific: a color, a shape, an object becomes a portal to something personally meaningful. You don't separate yourself from what you see. You enter it.

What you do: You narrate. You build scenes from fragments. You give objects roles and figures intentions. Where others describe, you tell. Your observations are never neutral — they carry feeling, preference, and personal logic. You are drawn to the particular rather than the general, and you resist interpretation that flattens the image into something abstract.

Where this might show up? In conversations where you bring context no one else thought to provide. In meetings where you humanize the data. In creative work where you find the story hiding inside the structure.

Your growing edge: The risk is that the story you bring is so vivid it becomes the only story. Staying a little longer with what is actually there — before meaning arrives — can open the image further.

Expanding Your Range: You hold the whole image as a scene. What would happen if you stayed with just one formal element — a line, a shape, a relationship between two areas — and followed only that?

Moving toward the Framer: The Framer slows down before explaining. «What is this object actually doing? Where is it positioned, and in relation to what?»

Moving toward the Artist: The Artist enters the image through feeling rather than story. «What does this image make you feel — not what does it remind you of, but what emotional state does it produce?»`,

  Framer: `You hold the image with structure. You notice what is happening to specific objects and forms, describe placement and direction concretely, and reason from what you see rather than what you feel. Your observations are grounded in common sense and a clear concept of how things work. You ask about technique, about function, about what the artist did and why. You compare formal properties. Your thinking is organized, sequential, and anchored in the visible.

What you do: You build an account. You describe what is there with precision — what is adjacent to what, what direction things face, how something is made. You use cause-and-effect logic: «it makes sense that this is here because...». You evaluate skill and craftsmanship. You distinguish between what you see and what you conclude.

Why this matters: This is how rigorous seeing works — not racing to meaning, but accounting for what is actually present. In a professional context, the Framer is the person who slows the group down and says: «What are we actually looking at?» before interpretation begins.

Your growing edge: The risk is that precision becomes a ceiling. The image can hold more than what is formally there. Allowing meaning to arrive — even speculatively — can take your observations further.

Expanding Your Range: You hold the image through structure. What would happen if you let the image affect you before you explained it — just sat with the feeling it produces?

Moving toward the Storyteller: The Storyteller doesn't wait for reasons. «What does this remind you of — not logically, but personally?»

Moving toward the Archivist: The Archivist asks what this object or image is part of. «Does this belong to a tradition, a period, a conversation across time?»`,

  Archivist: `You hold the image in context. Art-historical references, artist names, periods, and styles arrive naturally as you look — you place what you see within a larger aesthetic conversation. You recall facts, identify precedents, and ask about authorship and medium. You classify, categorize, and situate. Your thinking connects the specific work to the broader field of which it is a part.

What you do: You locate. You bring what you know — about movements, techniques, influences — and use it to deepen what you see. You ask where this came from and who made it and under what conditions. You find the niche a thing belongs to. You treat the artwork as a document within a larger history.

Why this matters: Context is not decoration — it is a dimension of meaning. Knowing that a work belongs to a particular moment or conversation changes what the image says. The Archivist gives everyone else in the room the frame.

Your growing edge: The risk is that knowing becomes a distance. The frame can sit between you and the image. What would you find if you set aside what you know and let the image address you directly?

Expanding Your Range: You hold the image through what you know. What single detail — unconnected to anything historical — catches your attention right now?

Moving toward the Framer: The Framer stays with the formal before the contextual. «What is this object actually doing — independent of what period it's from?»

Moving toward the Artist: The Artist lets the image produce a feeling before producing a fact. «What emotional state does this work put you in — before you name what it is?»`,

  Artist: `You hold the image through feeling. Emotional responses, empathic entry into the scene, and sensitivity to mood and atmosphere shape how you see. You wonder about meaning. You notice paradoxes and tensions — things that feel contradictory or unresolved. Your observations carry emotional weight. You enter the image by imagining what figures feel, what the scene suggests, what the work is doing beyond its surface.

What you do: You sense. You attune. You describe the emotional register of what you see — the tone, the atmosphere, the feeling the work produces. You imagine yourself inside the image. You hold contradictions without resolving them. You make meaning through feeling rather than explanation.

Why this matters: Feeling is not the absence of thinking — it is a form of intelligence. The Artist picks up what formal analysis misses: the tension between two figures, the weight of a color, the ambivalence in a gesture. These are real and significant features of how works operate.

Your growing edge: The risk is that emotional response can become subjective closure — a feeling that forecloses further looking. What would you find if you stayed with the image after the feeling arrived?

Expanding Your Range: You hold the image through emotional attunement. What would happen if you stepped back and described what you see before saying what you feel?

Moving toward the Archivist: The Archivist asks what this image is part of. «Does this feeling connect to a tradition — other works that produce the same state?»

Moving toward the Integrator: The Integrator holds emotion alongside observation and logic at once. «How does what you feel connect to what you see and what you know?»`,

  Integrator: `You hold the whole thing at once. Personal and universal, emotional and analytical, what is seen and what is sensed: these are not separate tracks for you, they move together. Your thinking doesn't simplify, it expands, finding the larger pattern without losing the detail that makes it real. You synthesise. You take what a room has built, what an image has offered, what multiple perspectives have surfaced, and you find the shape underneath it all. Your observations carry the trace of everything that came before them. You see relationships across ideas that others experience as separate and you can hold that complexity without needing to resolve it prematurely.

What you do: You synthesise. You take what a room has built, what an image has offered, what multiple perspectives have surfaced, and you find the shape underneath it all. Your observations carry the trace of everything that came before them. You see relationships across ideas that others experience as separate and you can hold that complexity without needing to resolve it prematurely.

Why this matters: This is how wisdom works: not as a single insight but as the capacity to integrate many kinds of knowing at once. In a professional context, the Integrator is the person on whom a conversation has actually arrived, even when the group hasn't named it yet. They bring synthesis, not summary. They make the invisible architecture of thinking visible.

Your growing edge: The risk is that synthesis becomes a way of hovering above: seeing the whole so clearly that the messy, specific, human detail gets lost.

Expanding Your Range: You held the whole image at once, moving between the emotional and the analytical, finding the pattern underneath everything you saw. What single detail did you leave behind in order to see the whole?

Moving toward the Artist: The Artist stays inside one moment rather than synthesising across many. What would change if you stayed with just one feeling instead of the whole?

Moving toward the Storyteller: The Storyteller enters before they understand. «Forget everything you have built. What is the first thing you see?»`,
};

const FIXED_INTRO = `This portrait emerges from your own words.

During our session, we recorded and transcribed how you thought out loud in front of a work of art: the observations you made, the questions you asked, the meanings you built. From that, we identified the recurring cognitive patterns that shape how you see.

This isn't a personality type. It's a map of your perceptual intelligence: how you notice, interpret, and make sense of what's in front of you.

We didn't assign this. We found it in your own words.

You're welcome to share this portrait, along with the artwork you explored and your own reflections on which Aesthetic Archetypes surfaced most strongly for you.`;

// ─── Claude call helper ──────────────────────────────────────────────────────

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
    if (status === 401)
      throw new AppError(
        "Claude API key is invalid or expired",
        500,
        "CLAUDE_NOT_CONFIGURED",
      );
    if (status === 429)
      throw new AppError(
        "Claude API rate limit exceeded, please try again later",
        429,
        "RATE_LIMITED",
      );
    throw new AppError(
      error.message || "Claude analysis failed",
      500,
      "CLAUDE_ERROR",
    );
  }
};

// ─── Prompt 1: Archetype Detection ──────────────────────────────────────────

const DETECTION_SYSTEM = `You are an expert in Visual Thinking Strategies (VTS) and aesthetic cognition analysis.
You classify how people think when looking at art using a scoring matrix.

Score the transcript against these archetype signals:

STORYTELLER
- Random single observations of objects, colors, shapes noted individually
- Personal idiosyncratic "looks like" associations from memory
- Wondering about presence, absence, or placement of elements
- Emotional personal history or memories triggered by the image
- Preference linked to specific objects or particulars within the artwork
- Qualitative judgments based on personal internalized criteria

FRAMER
- Logic-based descriptions: what is happening to a particular object/form
- Descriptions based on viewer's concept of reality or common sense
- Placement, direction, formal issues taken concretely
- Technique, craftsmanship, skill, proficiency observations
- Cause-and-effect reasoning: "it makes sense that..."
- Comparisons of single formal properties
- Wondering about technique, function, or the artist

ARCHIVIST
- Art-historical references, artist names, periods, styles, schools
- Aesthetic classification: groupings to place things in a niche
- Recalls aesthetic or art-historical facts
- Personal aesthetic history: "this reminds me of [artwork/artist]"
- Rhetorical questions about authorship or medium
- What an object signifies in art-historical terms

ARTIST
- Emotional effect statements: "it feels like...", "the mood seems..."
- Empathic entry into scene: imagining what figures feel
- Feeling-based judgments and emotional responses
- Wondering about meaning
- Dichotomies, paradoxes, contrasting feelings
- Emotional/expressive observations

INTEGRATOR
- Synthesis statements: "taking all of this into account..."
- "A theme that seems to be emerging is..."
- "Putting together what everyone said..."
- Summation of metaphoric suppositions
- Integrating observation + logic + emotion simultaneously
- Universal states or conditions

Count the signals for each archetype. Return ONLY the name of the archetype with the highest count.
Return a single word. One of exactly: Storyteller, Framer, Archivist, Artist, Integrator.
No explanation. No punctuation. Just the word.`;

// ─── Prompt 2: Teaser Card Lines ─────────────────────────────────────────────

const TEASER_SYSTEM = `You write short, evocative descriptor lines for an aesthetic intelligence app.
Each line reveals one dimension of the person's thinking style.

Rules:
- Second person ("You..."), present tense
- 12–22 words maximum per line
- No bullet points, no headers, no numbers
- Do NOT use the archetype name itself in any line
- Do NOT use clinical or diagnostic language
- Each line should feel like a gentle revelation, not a label
- Lines should cover different dimensions: how they perceive, how they process, what they naturally do, what gift this gives them
- Return exactly 4 lines, each on its own line, nothing else`;

// ─── Prompt 3: Quotes + Meanings ─────────────────────────────────────────────

const QUOTES_SYSTEM = `You are an expert in Visual Thinking Strategies (VTS) and aesthetic cognition.
You analyse what a person's words reveal about how they think when looking at art.

VTS PARAPHRASING RULES — follow exactly:

1. NEVER praise or evaluate. Forbidden phrases: "great observation", "interesting point",
   "insightful", "well said", any form of compliment.

2. NAME THE THINKING MOVE using metacognitive language:
   Observing:     "You're noticing..." / "You're attending to..." / "You're pointing out..."
   Interpreting:  "You're constructing a narrative..." / "You're imagining this as..."
   Reasoning:     "You're grounding your idea in what you see..." / "You're working backward..."
   Feeling:       "You're sensing an emotional tone..." / "You're entering the image through empathy..."
   Connecting:    "You're linking this to..." / "You're integrating several ideas..."
   Wondering:     "You're raising the question..." / "You're exploring unknowns..."

3. USE CONDITIONAL LANGUAGE where appropriate:
   "might suggest", "seems to", "could indicate", "appears to"

4. THE MEANING BLOCK must identify:
   - What cognitive stage this represents (Stage I observation / Stage II interpretation / etc.)
   - What specific thinking move the person made
   - How it connects to their dominant archetype pattern

5. SELECT QUOTES that best demonstrate the dominant archetype. Prioritise quotes that show
   the thinking pattern most clearly — not just the most dramatic or memorable lines.

6. QUOTE SELECTION PRIORITY for each archetype:
   Storyteller:  personal associations, narrative moves, character animation
   Framer:       logic/cause-effect, technique observations, reality-grounding
   Archivist:    art-historical references, pattern recognition, classification
   Artist:       emotional responses, empathic entry, mood/feeling statements
   Integrator:   synthesis statements, multi-thread observations, theme emergence

OUTPUT FORMAT — follow exactly, no deviations:

QUOTE 1:
"[exact quote from transcript — do not paraphrase the quote itself]"
Meaning: [2-4 sentences. First sentence names the thinking move using metacognitive language. Remaining sentences explain the cognitive stage and archetype connection.]

QUOTE 2:
"[exact quote]"
Meaning: [explanation]

QUOTE 3:
"[exact quote]"
Meaning: [explanation]

QUOTE 4:
"[exact quote]"
Meaning: [explanation]`;

// ─── Prompt 4: Full Portrait Report ──────────────────────────────────────────

const REPORT_SYSTEM = `You generate personalised Aesthetic Archetype portrait reports for an art-viewing intelligence app.

Strict rules:
1. Always begin with the EXACT intro paragraph provided. Do not change a single word.
2. After the intro, output the sections in this exact order with these exact headings:
   - Your Primary Aesthetic Archetype
   - What shapes this thinking
   - What you do
   - Why this matters  (use "Where this might show up?" for Storyteller archetype only)
   - Your growing edge
   - Expanding Your Range
   - Moving toward the [Archetype A]
   - Moving toward the [Archetype B]
3. Under "Your Primary Aesthetic Archetype" include the badge label: [Name] · [Subtitle]
4. Write each section as clean prose. No bullet points. No markdown symbols.
5. Do not add any sections not listed above.
6. Do not summarise, shorten, or rewrite the archetype description — use it as given.
7. Second person throughout ("You hold...", "You synthesise...").
8. Tone: warm, precise, non-clinical, non-diagnostic.`;

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
  const validArchetypes = [
    "Storyteller",
    "Framer",
    "Archivist",
    "Artist",
    "Integrator",
  ];

  if (!validArchetypes.includes(archetypeName)) {
    throw new AppError(
      `Unexpected archetype returned by AI: "${archetypeName}"`,
      500,
      "CLAUDE_ERROR",
    );
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

  // Split on known headings + dynamic "Moving toward the X" headings
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
      const rawBody = parts[i + 1].trim();
      // "Your Primary Aesthetic Archetype" body should only contain the badge line
      // (e.g. "Framer · Structure Seeker"), not the full description paragraph.
      const body =
        part === "Your Primary Aesthetic Archetype"
          ? rawBody.split("\n")[0].trim()
          : rawBody;
      sections.push({ heading: part, body });
      i++;
    }
  }

  return sections;
};

// ─── Parse quotes from Prompt 4 output ───────────────────────────────────────

const parseQuotes = (quotesText) => {
  return quotesText
    .split(/QUOTE \d+:/i)
    .slice(1) // drop empty string before first "QUOTE 1:"
    .map((block) => {
      const lines = block
        .trim()
        .split("\n")
        .filter((l) => l.trim());
      // First non-empty line is the quoted text (may be wrapped in quotes)
      const quoteLine = lines[0]?.replace(/^[""]|[""]$/g, "").trim() ?? "";
      // Find the Meaning: line
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
