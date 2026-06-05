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

// ─── Global Language Rules (Artful Method Section 3) ─────────────────────────
//
// Prepended to EVERY participant-facing generation prompt. These rules apply
// universally across all report types. Internal scoring/classification prompts
// (which return a single archetype word) do not need them.

const GLOBAL_LANGUAGE_RULES = `ARTFUL METHOD GLOBAL LANGUAGE RULES, these apply to every word you generate, without exception:

1. NEVER use em dashes (the "—" character) and NEVER use a double hyphen ("--") as a substitute. Replace with commas, colons, periods, or restructure the sentence. This applies everywhere.
2. CONDITIONAL OVER ABSOLUTE LANGUAGE. Use "you may", "it might", "could", "appears to", "seems to", "perhaps". Avoid absolute declarations like "you are", "your language indicates", "you show", "this proves", "this definitively means".
3. FOCUS ON COGNITIVE PROCESS, not identity. Map noticing, interpreting, reasoning, associating, synthesizing, ambiguity tolerance, and meaning-making. Do not psychoanalyze, diagnose, infer trauma, assess personality, or define identity.
4. PRIORITIZE METACOGNITIVE REFLECTION. Prefer "Your language naturally returned to...", "You appeared to build meaning through...", "Your attention moved toward...". Avoid identity-heavy framing or declarative sorting.
5. NO THERAPEUTIC OR COACHING LANGUAGE. Never use: healing, transformation, breakthrough, authentic self, growth mindset, empowerment, self-discovery.
6. NO EVALUATIVE PRAISE. Never use: insightful, brilliant, perceptive, sophisticated, nuanced, impressive, advanced, powerful, rare, important, clever, deep, meaningful, great, well said.
7. PSYCHOLOGICAL SAFETY. Stay open, non-definitive, non-hierarchical, non-pathologizing. Never imply one archetype is better, that a wider range equals greater worth, or that absent modes indicate deficiency. Range reflects perceptual accessibility, not human value.
8. KEEP THE ARTWORK SECONDARY TO THE COGNITIVE MOVE. Focus on how the participant made meaning, not whether their interpretation of the artwork is correct. Prefer "You're constructing a narrative from the gesture...". Avoid "This artwork is clearly about...".
9. PRESERVE OPENNESS AND REVISABILITY. Prefer "What appears to emerge...", "This may reflect...", "The transcript suggests...". Avoid "This reveals your true nature.", "This definitively means...".
10. INTELLECTUALLY ELEGANT BUT OPERATIONALLY CLEAR. Thoughtful, restrained, psychologically safe, reflective, precise. Avoid corporate language, academic jargon, self-help tones, motivational language, and overly poetic abstraction.
11. NEVER label a reflection block with the strings "VTS Commentary:" or "Commentary:". Use neutral prose, blockquotes, or section divisions instead.

`;

// Prefix the global rules onto a report-generation system prompt.
const withGlobalRules = (systemPrompt) => GLOBAL_LANGUAGE_RULES + systemPrompt;

// ─── Input Safeguards (Artful Method Section 5) ──────────────────────────────
//
// Rule A: missing / unrecorded / extremely limited data (< 10 words).
// Rule B: out-of-scope, non-art, or disruptive dialogue (AI-classified).
//
// When triggered, the standard report protocol is suspended and the exact
// required notice is returned. Callers must surface notice_title + notice_message
// verbatim and must NOT generate a report.

const INPUT_NOTICES = {
  CAPTURE: {
    code: "TRANSCRIPT_CAPTURE",
    notice_title: "Transcript Capture Notice",
    notice_message:
      "Unfortunately, we did not capture your transcript here. Please try again.",
  },
  REFRESH: {
    code: "SESSION_REFRESH",
    notice_title: "Session Refresh",
    notice_message:
      "It looks like our conversation went in a different direction. Would you like to try again?",
  },
};

// Counts meaningful words across one or more transcript strings.
const wordCount = (text) =>
  (text || "").trim().split(/\s+/).filter(Boolean).length;

// Rule B classifier — returns "OK" or "OUT_OF_SCOPE".
const SCOPE_CHECK_SYSTEM = `You are a gatekeeper for an art-viewing reflection tool. You decide whether a transcript shows a participant genuinely engaging with a work of art (describing, interpreting, feeling, questioning, or reasoning about what they see).

Return exactly one word:
- OK, the participant is engaging with the artwork in some form, even briefly or tentatively.
- OUT_OF_SCOPE, the participant is not engaging with the artwork at all, is talking about completely unrelated tasks, or is being intentionally hostile, rude, or inappropriate.

When uncertain, return OK. Return only the single word. No punctuation. No explanation.`;

// Runs Rule A then Rule B. Returns { ok: true } or { ok: false, notice }.
// `combinedText` is the full transcript used for the word-count check; Rule B
// uses the same text for classification.
const checkInput = async (anthropic, combinedText) => {
  // Rule A — blank or fewer than 10 words
  if (wordCount(combinedText) < 10) {
    return { ok: false, notice: INPUT_NOTICES.CAPTURE };
  }

  // Rule B — out-of-scope / disruptive (AI classification)
  const verdict = await callClaude(
    anthropic,
    SCOPE_CHECK_SYSTEM,
    `Transcript:\n---\n${combinedText}\n---\n\nReturn OK or OUT_OF_SCOPE.`,
    10,
  );
  if (/OUT_OF_SCOPE/i.test(verdict)) {
    return { ok: false, notice: INPUT_NOTICES.REFRESH };
  }

  return { ok: true };
};

// ─── Static lookup tables ───────────────────────────────────────────────────

const ARCHETYPE_SUBTITLES = {
  Storyteller: "Narrative Maker",
  Framer: "Structure Seeker",
  Archivist: "Context Builder",
  Artist: "Emotional Explorer",
  Integrator: "Reflective Synthesiser",
};

// Core Cognitive Title (Artful Method Section 4) — used in the Session Read
// dominant statement: "[Archetype Name and Core Cognitive Title]".
const ARCHETYPE_CORE_TITLES = {
  Storyteller: "Narrative Maker",
  Framer: "Structure Seeker",
  Archivist: "Context Builder",
  Artist: "Emotional Explorer",
  Integrator: "Reflective Synthesiser",
};

// Orientation phrasing (Artful Method Section 4) — fills the Session Read
// "your language naturally returned to [orientation] framing" slot.
const ARCHETYPE_ORIENTATIONS = {
  Storyteller: "associative and relational",
  Framer: "structural and evidential",
  Archivist: "historical and referential",
  Artist: "affective and intuitive",
  Integrator: "meta-reflective and synthetic",
};

// Fixed teaser/reveal cards shown on screens 3-6 of the onboarding report.
// These are static per archetype (no longer AI-generated), exactly 4 per archetype.
const ARCHETYPE_TEASER_CARDS = {
  Storyteller: [
    "You make meaning by exploring what is felt before what is fully understood.",
    "You naturally notice and make personal leaps to memory, association, and private experience.",
    "Where others seek quick answers, you enter the work and narrate it as a living story.",
    "Your gift lies in bringing what you see to life through your senses, memory, and making it come alive through story.",
  ],
  Framer: [
    "You make meaning by understanding how things are built and why they work.",
    "You naturally notice structure, balance, and the logic holding everything together.",
    "Where others react instinctively, you first assess how the pieces fit and function.",
    "Your gift lies in bringing clarity to complexity and learning when to pause before organizing it.",
  ],
  Archivist: [
    "You make meaning by reaching for context; where things come from and how they connect.",
    "You naturally gather knowledge and context from everything you know to understand where this fits in the bigger picture.",
    "Where others react instinctively, you first ask how this fits into the bigger picture.",
    "Your gift lies in recognizing deeper patterns and learning when to pause before categorizing too quickly.",
  ],
  Artist: [
    "You make meaning through emotion, memory, and human connection.",
    "You instinctively immerse yourself in what you encounter before stepping back to understand it.",
    "Where others look for answers, you naturally hold paradox and embrace contrasting feelings without forcing resolution or closure.",
    "Your gift lies in noticing people, relationships, and emotional nuance before formal structure.",
  ],
  Integrator: [
    "You make meaning by seeing connections between things and bringing different ideas together.",
    "You naturally notice how the personal interacts within a bigger whole.",
    "Where others may separate ideas, you instinctively look for how they fit together.",
    "Your gift lies in seeing complexity clearly and learning when to simplify it for others.",
  ],
};

const ARCHETYPE_DESCRIPTIONS = {
  Storyteller: `You hold the image as a living scene. Personal memories, emotions, and idiosyncratic associations arrive before analysis, you notice what is present and what is absent, what belongs and what doesn't, and you animate the particulars with your own interior world. Your thinking is associative and grounded in the specific: a color, a shape, an object becomes a portal to something personally meaningful. You don't separate yourself from what you see. You enter it.

What you do: You narrate. You build scenes from fragments. You give objects roles and figures intentions. Where others describe, you tell. Your observations are never neutral, they carry feeling, preference, and personal logic. You are drawn to the particular rather than the general, and you resist interpretation that flattens the image into something abstract.

Where this might show up? In conversations where you bring context no one else thought to provide. In meetings where you humanize the data. In creative work where you find the story hiding inside the structure.

Your growing edge: The risk is that the story you bring is so vivid it becomes the only story. Staying a little longer with what is actually there, before meaning arrives, can open the image further.

Expanding Your Range: You hold the whole image as a scene. What would happen if you stayed with just one formal element, a line, a shape, a relationship between two areas, and followed only that?

Moving toward the Framer: The Framer slows down before explaining. «What is this object actually doing? Where is it positioned, and in relation to what?»

Moving toward the Artist: The Artist enters the image through feeling rather than story. «What does this image make you feel, not what does it remind you of, but what emotional state does it produce?»`,

  Framer: `You hold the image with structure. You notice what is happening to specific objects and forms, describe placement and direction concretely, and reason from what you see rather than what you feel. Your observations are grounded in common sense and a clear concept of how things work. You ask about technique, about function, about what the artist did and why. You compare formal properties. Your thinking is organized, sequential, and anchored in the visible.

What you do: You build an account. You describe what is there with precision, what is adjacent to what, what direction things face, how something is made. You use cause-and-effect logic: «it makes sense that this is here because...». You evaluate skill and craftsmanship. You distinguish between what you see and what you conclude.

Why this matters: This is how rigorous seeing works, not racing to meaning, but accounting for what is actually present. In a professional context, the Framer is the person who slows the group down and says: «What are we actually looking at?» before interpretation begins.

Your growing edge: The risk is that precision becomes a ceiling. The image can hold more than what is formally there. Allowing meaning to arrive, even speculatively, can take your observations further.

Expanding Your Range: You hold the image through structure. What would happen if you let the image affect you before you explained it, just sat with the feeling it produces?

Moving toward the Storyteller: The Storyteller doesn't wait for reasons. «What does this remind you of, not logically, but personally?»

Moving toward the Archivist: The Archivist asks what this object or image is part of. «Does this belong to a tradition, a period, a conversation across time?»`,

  Archivist: `You hold the image in context. Art-historical references, artist names, periods, and styles arrive naturally as you look, you place what you see within a larger aesthetic conversation. You recall facts, identify precedents, and ask about authorship and medium. You classify, categorize, and situate. Your thinking connects the specific work to the broader field of which it is a part.

What you do: You locate. You bring what you know, about movements, techniques, influences, and use it to deepen what you see. You ask where this came from and who made it and under what conditions. You find the niche a thing belongs to. You treat the artwork as a document within a larger history.

Why this matters: Context is not decoration, it is a dimension of meaning. Knowing that a work belongs to a particular moment or conversation changes what the image says. The Archivist gives everyone else in the room the frame.

Your growing edge: The risk is that knowing becomes a distance. The frame can sit between you and the image. What would you find if you set aside what you know and let the image address you directly?

Expanding Your Range: You hold the image through what you know. What single detail, unconnected to anything historical, catches your attention right now?

Moving toward the Framer: The Framer stays with the formal before the contextual. «What is this object actually doing, independent of what period it's from?»

Moving toward the Artist: The Artist lets the image produce a feeling before producing a fact. «What emotional state does this work put you in, before you name what it is?»`,

  Artist: `You hold the image through feeling. Emotional responses, empathic entry into the scene, and sensitivity to mood and atmosphere shape how you see. You wonder about meaning. You notice paradoxes and tensions, things that feel contradictory or unresolved. Your observations carry emotional weight. You enter the image by imagining what figures feel, what the scene suggests, what the work is doing beyond its surface.

What you do: You sense. You attune. You describe the emotional register of what you see, the tone, the atmosphere, the feeling the work produces. You imagine yourself inside the image. You hold contradictions without resolving them. You make meaning through feeling rather than explanation.

Why this matters: Feeling is not the absence of thinking, it is a form of intelligence. The Artist picks up what formal analysis misses: the tension between two figures, the weight of a color, the ambivalence in a gesture. These are real and significant features of how works operate.

Your growing edge: The risk is that emotional response can become subjective closure, a feeling that forecloses further looking. What would you find if you stayed with the image after the feeling arrived?

Expanding Your Range: You hold the image through emotional attunement. What would happen if you stepped back and described what you see before saying what you feel?

Moving toward the Archivist: The Archivist asks what this image is part of. «Does this feeling connect to a tradition, other works that produce the same state?»

Moving toward the Integrator: The Integrator holds emotion alongside observation and logic at once. «How does what you feel connect to what you see and what you know?»`,

  Integrator: `You hold the whole thing at once. Personal and universal, emotional and analytical, what is seen and what is sensed: these are not separate tracks for you, they move together. Your thinking doesn't simplify, it expands, finding the larger pattern without losing the detail that makes it real. You synthesise. You take what a room has built, what an image has offered, what multiple perspectives have surfaced, and you find the shape underneath it all. Your observations carry the trace of everything that came before them. You see relationships across ideas that others experience as separate and you can hold that complexity without needing to resolve it prematurely.

What you do: You synthesise. You take what a room has built, what an image has offered, what multiple perspectives have surfaced, and you find the shape underneath it all. Your observations carry the trace of everything that came before them. You see relationships across ideas that others experience as separate and you can hold that complexity without needing to resolve it prematurely.

Why this matters: This is how wisdom works: not as a single insight but as the capacity to integrate many kinds of knowing at once. In a professional context, the Integrator is the person on whom a conversation has actually arrived, even when the group hasn't named it yet. They bring synthesis, not summary. They make the invisible architecture of thinking visible.

Your growing edge: The risk is that synthesis becomes a way of hovering above: seeing the whole so clearly that the messy, specific, human detail gets lost.

Expanding Your Range: You held the whole image at once, moving between the emotional and the analytical, finding the pattern underneath everything you saw. What single detail did you leave behind in order to see the whole?

Moving toward the Artist: The Artist stays inside one moment rather than synthesising across many. What would change if you stayed with just one feeling instead of the whole?

Moving toward the Storyteller: The Storyteller enters before they understand. «Forget everything you have built. What is the first thing you see?»`,
};

const FIXED_INTRO = `This portrait emerges from your own words. During our session, we recorded and transcribed how you thought out loud in front of a work of art: the observations you made, the questions you asked, the meanings you built. From that, we identified the recurring cognitive patterns that shape how you see. This isn't a personality type. It's a map of your perceptual intelligence: how you notice, interpret, and make sense of what's in front of you. We didn't assign this. We found it in your own words. You're welcome to share this portrait, along with the artwork you explored and your own reflections on which Aesthetic Archetypes surfaced most strongly for you.`;

// ─── Claude call helper ──────────────────────────────────────────────────────

// Em-dash ban (Global Rule 1). Models sometimes substitute a literal "--" when
// told not to use "—", so strip both forms from every AI response. Replace with
// a comma so sentences stay grammatical. Collapses spaced and unspaced variants.
const sanitizeDashes = (text) =>
  (text || "")
    // a dash (em/en or "--") right after sentence-ending punctuation is just a
    // separator: drop it and keep a single space.
    .replace(/([.!?])\s*(?:[—–]|-{2,})\s*/g, "$1 ")
    // remaining em/en dashes, spaced or not, become commas
    .replace(/\s*[—–]\s*/g, ", ")
    // remaining double-hyphen substitutes become commas
    .replace(/\s*-{2,}\s*/g, ", ")
    // tidy any accidental doubled commas created above
    .replace(/,\s*,/g, ",");

const callClaude = async (anthropic, systemPrompt, userMessage, maxTokens) => {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });
    const raw = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    return sanitizeDashes(raw);
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

// ─── Prompt 3: Quotes + Meanings ─────────────────────────────────────────────

const QUOTES_SYSTEM = `You are an expert in Visual Thinking Strategies (VTS) and aesthetic cognition.
You analyse what a person's words reveal about how they think when looking at art.

VTS PARAPHRASING RULES, follow exactly:

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
   the thinking pattern most clearly, not just the most dramatic or memorable lines.

6. QUOTE SELECTION PRIORITY for each archetype:
   Storyteller:  personal associations, narrative moves, character animation
   Framer:       logic/cause-effect, technique observations, reality-grounding
   Archivist:    art-historical references, pattern recognition, classification
   Artist:       emotional responses, empathic entry, mood/feeling statements
   Integrator:   synthesis statements, multi-thread observations, theme emergence

OUTPUT FORMAT, follow exactly, no deviations:

QUOTE 1:
"[exact quote from transcript, do not paraphrase the quote itself]"
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
6. Do not summarise, shorten, or rewrite the archetype description, use it as given.
7. Second person throughout ("You hold...", "You synthesise...").
8. Tone: warm, precise, non-clinical, non-diagnostic.`;

// ─── Main service function ────────────────────────────────────────────────────

const analyzeArchetype = async ({ transcript }) => {
  const anthropic = client();

  // ── Input Safeguards (Section 5) — Rule A then Rule B
  const guard = await checkInput(anthropic, transcript);
  if (!guard.ok) {
    return { rejected: true, notice: guard.notice };
  }

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

  // ── Teaser cards are static per archetype (no longer AI-generated)
  const teaserLines = ARCHETYPE_TEASER_CARDS[archetypeName] || [];

  // ── Step 3 & 4: Run in parallel once archetype is known
  const [quotesRaw, reportRaw] = await Promise.all([
    // Prompt 3 — quotes + meanings
    callClaude(
      anthropic,
      withGlobalRules(QUOTES_SYSTEM),
      `Dominant archetype: ${archetypeName}\n\nSession transcript:\n---TRANSCRIPT START---\n${transcript}\n---TRANSCRIPT END---\n\nSelect the 4 quotes that best demonstrate the ${archetypeName} thinking pattern.\nFollow the output format exactly.`,
      1200,
    ),
    // Prompt 4 — full report
    callClaude(
      anthropic,
      withGlobalRules(REPORT_SYSTEM),
      `Generate the full Aesthetic Archetype Portrait Report.\n\nArchetype detected: ${archetypeName}\nArchetype subtitle: ${archetypeSubtitle}\n\nUSE THIS INTRO PARAGRAPH VERBATIM. DO NOT CHANGE ANY WORD:\n---\n${FIXED_INTRO}\n---\n\nARCHETYPE DESCRIPTION TO USE FOR ALL SECTIONS:\n${archetypeDescription}`,
      1500,
    ),
  ]);

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

// ─── Lesson Report — Session Read (Artful Method Report Type 2) ──────────────
//
// A concise, observational snapshot of the single perceptual mode that surfaced
// most strongly across the lesson's three prompts. Per the framework, the
// Session Read deliberately EXCLUDES verbatim quotes, deep analysis, expansion
// prompts, and cognitive commentary sections. It is built from a fixed template
// with AI-filled summary fragments and ends with the exact required sign-off.

const SESSION_READ_SIGNOFF =
  "We can't wait to see what you find next. Try the next session.";

// AI fills only two short fragments. The surrounding template is fixed so the
// structure cannot drift. The orientation phrase is supplied from the framework
// (ARCHETYPE_ORIENTATIONS); the model only writes a single conditional clause
// describing the cognitive logic the participant appeared to use.
const SESSION_READ_SYSTEM = `You write one short fragment for a "Session Read" snapshot in an art-viewing reflection tool.

You will be given the participant's dominant perceptual mode and their transcript across three prompts. Write a SINGLE clause (no leading capital, no trailing period) that completes this sentence:

"You appeared to build meaning by ___"

The clause should name, in conditional and observational language, the cognitive logic the participant appeared to use (for example: "noticing what was happening to specific forms before naming what they meant", or "entering the scene and giving the figures intentions and histories"). Ground it in what the transcript actually shows.

Hard rules:
- Return ONLY the clause. No quotes, no labels, no extra sentences.
- 8 to 30 words.
- Conditional, observational tone. No praise. No diagnosis. No identity claims.
- Describe the thinking move, not the artwork's meaning.
- Never use an em dash.`;

// ─── Session Read function (replaces the former rich lesson report) ──────────
//
// Returns { rejected: true, notice } when an input safeguard fires (Section 5),
// otherwise the Session Read payload. Callers must surface the notice verbatim
// and must NOT generate a report when rejected.

const analyzeLessonArchetype = async ({ transcripts }) => {
  // transcripts = array of 3 strings, one per prompt
  if (!Array.isArray(transcripts) || transcripts.length !== 3) {
    throw new AppError("Exactly 3 transcripts are required", 400, "VALIDATION_ERROR");
  }

  const anthropic = client();
  const combinedTranscript = transcripts
    .map((t, i) => `PROMPT ${i + 1}:\n${t}`)
    .join("\n\n---\n\n");

  // ── Input Safeguards (Section 5) — Rule A then Rule B
  const guard = await checkInput(anthropic, transcripts.join(" "));
  if (!guard.ok) {
    return { rejected: true, notice: guard.notice };
  }

  // ── Step 1: Detect the single dominant archetype
  const rawArchetype = await callClaude(
    anthropic,
    DETECTION_SYSTEM,
    `Analyze this lesson transcript (3 prompts) and return the dominant archetype name:\n\n---TRANSCRIPT START---\n${combinedTranscript}\n---TRANSCRIPT END---`,
    20,
  );

  const archetypeName = rawArchetype.trim();
  const validArchetypes = ["Storyteller", "Framer", "Archivist", "Artist", "Integrator"];
  if (!validArchetypes.includes(archetypeName)) {
    throw new AppError(`Unexpected archetype returned by AI: "${archetypeName}"`, 500, "CLAUDE_ERROR");
  }

  const archetypeSubtitle = ARCHETYPE_SUBTITLES[archetypeName];
  const coreTitle = ARCHETYPE_CORE_TITLES[archetypeName];
  const orientation = ARCHETYPE_ORIENTATIONS[archetypeName];

  // ── Step 2: AI fills the single "build meaning by ___" clause
  const rawClause = await callClaude(
    anthropic,
    withGlobalRules(SESSION_READ_SYSTEM),
    `Dominant mode: ${archetypeName} (${coreTitle})\n\nTranscript across three prompts:\n---\n${combinedTranscript}\n---\n\nWrite the single clause completing "You appeared to build meaning by ___".`,
    120,
  );

  // Normalise the clause: strip wrapping quotes, a trailing period, and any
  // accidental leading "You appeared to build meaning by".
  let clause = rawClause
    .trim()
    .replace(/^["'“”]|["'“”]$/g, "")
    .replace(/^you appeared to build meaning by\s*/i, "")
    .replace(/\.$/, "")
    .trim();
  // Safety net for the em-dash ban inside the AI fragment.
  clause = clause.replace(/\s*—\s*/g, ", ");

  // ── Assemble the fixed-template Session Read body (Report Type 2)
  const dominantStatement = `The perceptual mode that appeared to surface most strongly in this session was the ${archetypeName}: ${coreTitle}.`;
  const orientationLine = `Across this conversation, your language naturally returned to ${orientation} framing. You appeared to build meaning by ${clause}.`;

  const sessionInsight = `${dominantStatement}\n\n${orientationLine}`;

  return {
    reportType: "session_read",
    archetype: {
      name: archetypeName,
      subtitle: archetypeSubtitle,
      coreTitle,
    },
    // The "Your session insight" block — dominant statement + orientation lines.
    sessionInsight,
    dominantStatement,
    orientationLine,
    // Exact required closing sign-off (must not be altered).
    signoff: SESSION_READ_SIGNOFF,
  };
};

// ─── Growth in Range (GiR) Pipeline ──────────────────────────────────────────
//
// Implements the 6-step GiR methodology from docs/courses.md (Pipeline B).
// Input: array of 10 objects [{ lesson_number, transcript_text }]
// Output: structured GiR report JSON (cached to S3 by caller)

const GIR_FIXED_INTRO = `This portrait emerges from your own words. Over the course of our sessions, we recorded and transcribed how you thought out loud in front of ten works of art. Each image came with its own set of thinking prompts, designed to draw out different ways of looking and making meaning. What stayed the same was you. This is your Growth in Range portrait. What follows is not a fixed identity and it is not a score. It is a map of how many of the five perceptual modes you drew on across ten encounters with progressively more challenging images: which modes appear to be home for you, which others became available, and which did not appear in this sequence. We did not assign this. We found it in your own words, across ten separate encounters, over time.`;

// Step 1 — Score each transcript (batched single call, structured output)
const GIR_SCORING_SYSTEM = `You are an expert in Visual Thinking Strategies (VTS) and aesthetic cognition.
You will receive multiple transcripts labelled LESSON 1, LESSON 2 ... LESSON 10.
For each lesson return ONLY the dominant mode, one of exactly:
Storyteller, Framer, Archivist, Artist, Integrator

OUTPUT FORMAT, one line per lesson, nothing else:
LESSON 1: <mode>
LESSON 2: <mode>
...
LESSON 10: <mode>

No explanation. No punctuation beyond the colon. No extra text.`;

// Section IV (Evidence Deep-Dive) — one verbatim quote PER SESSION, each block
// opening with an explicit tracking line naming that session's dominant
// archetype (matching the Report Type 2 assignment rule), paired with its
// reflective commentary in conditional language.
const GIR_QUOTES_SYSTEM = `You build the Evidence Deep-Dive for a Growth in Range report.

You will receive ten labelled transcripts, each already scored with its dominant mode. For EACH session that contains usable language, produce one block: an explicit tracking line naming that session's dominant archetype, then one verbatim quote drawn from that session, then a short reflective commentary.

Rules:
- VERBATIM ONLY. Copy the exact words from that session's transcript. Do not paraphrase or reconstruct.
- The quote must demonstrate that session's dominant mode.
- The tracking line states the single dominant archetype that surfaced in that session.
- The commentary is 2 to 3 sentences. It names the thinking move using stems such as "You're noticing", "You're constructing a narrative", "You're sensing", "You're raising the question", "You're integrating several ideas". It uses conditional language ("might suggest", "seems to", "could indicate", "appears to"). It mirrors cognition only, never the artwork's meaning, and never praises.
- Do not label any block with the strings "VTS Commentary" or "Commentary".
- If a session has no usable language, skip it.

OUTPUT FORMAT, EXACTLY as below. Use these literal marker tokens. Put each marker on its own line. Never write the marker tokens anywhere inside the quote or reflection text. Output nothing before the first marker or after the last block.

[[SESSION]] <session number>
[[DOMINANT]] <archetype name>
[[QUOTE]] <exact verbatim text from that session, no surrounding quotation marks>
[[REFLECTION]] <2 to 3 sentence reflective commentary>
[[END]]

Repeat the five lines above for each session. The [[END]] line closes each block.`;

// Section V — "Your Range" paragraphs + Emerging Perceptual Capacities, with
// each described conceptual move paired to its parent archetype in parentheses.
const GIR_RANGE_SYSTEM = `You write the Range Mapping section for a Growth in Range report.

First write one paragraph per mode that appeared, describing what that mode looked like in this person's responses. Then write an "Emerging Perceptual Capacities" paragraph. Then one plain sentence naming absent modes without judgment.

Rules:
- Second person ("you"), present or past tense as appropriate.
- Conditional observational language: "it seems", "appears to", "might suggest".
- One paragraph per appeared mode.
- In the Emerging Perceptual Capacities paragraph, every conceptual move you describe MUST be immediately followed by its parent archetype in parentheses, in this exact standardized form: (The Storyteller: Narrative Maker), (The Framer: Structure Seeker), (The Archivist: Context Builder), (The Artist: Emotional Explorer), (The Integrator: Reflective Synthesiser).
- Do NOT rank the range. Two modes is not less developed than five. Range reflects perceptual accessibility, not human value.
- One final sentence naming absent modes plainly: "The [X], [Y] and [Z] modes did not appear in this sequence."
- No bullet points, no markdown, no praise, no em dashes.

OUTPUT FORMAT, EXACTLY as below using these literal marker tokens, each on its own line. Never write the marker tokens inside any paragraph text.

For the [[MODE]] line, use the bare archetype name ONLY, one of exactly: Storyteller, Framer, Archivist, Artist, Integrator. Do not add "The" and do not add the subtitle on the [[MODE]] line.

[[MODE]] <one of: Storyteller, Framer, Archivist, Artist, Integrator>
[[PARAGRAPH]] <paragraph text for that mode>
[[ENDMODE]]

Repeat the three lines above for each appeared mode. Then:

[[CAPACITIES]] <Emerging Perceptual Capacities paragraph with parenthetical archetype mapping>
[[ABSENT]] <one sentence naming all absent modes>`;

// Section VI — "How Might This Show Up?"
const GIR_HOW_SYSTEM = `You write the "How might this show up?" section for a Growth in Range report.
One paragraph. Conditional voice. References the home base mode and at least one range mode.
Describes how this cognitive pattern might manifest beyond the art room, in work, relationships, or daily life.

Rules:
- Second person ("you"), present or future tense.
- Conditional language throughout: "might", "could", "it seems", "appears to".
- Reference home base and at least one range mode by name.
- No bullet points, no markdown, no em dashes, no praise or evaluation.
- Output only the paragraph body, no heading.`;

const analyzeGrowthInRange = async ({ lessons }) => {
  // lessons = [{ lesson_number: 1, transcript_text: "..." }, ...]
  if (!Array.isArray(lessons) || lessons.length === 0) {
    const AppError = require("../utils/app-error");
    throw new AppError("No session transcripts found for the Growth in Range report", 400, "VALIDATION_ERROR");
  }

  const anthropic = client();
  const validArchetypes = ["Storyteller", "Framer", "Archivist", "Artist", "Integrator"];

  // ── Input Safeguards (Section 5) — Rule A then Rule B across all transcripts
  const guard = await checkInput(
    anthropic,
    lessons.map((l) => l.transcript_text || "").join(" "),
  );
  if (!guard.ok) {
    return { rejected: true, notice: guard.notice };
  }

  // ── Step 1: Determine the dominant mode per lesson ─────────────────────────
  // Prefer the archetype already assigned by each lesson's own Session Read
  // (passed in as precomputed_mode). This keeps the course report consistent
  // with the per-lesson reports. Only lessons missing a precomputed mode (e.g.
  // legacy data) are scored via a single AI call.
  const ordered = [...lessons].sort((a, b) => a.lesson_number - b.lesson_number);
  const modePerLesson = new Array(ordered.length).fill(null);

  ordered.forEach((l, i) => {
    if (validArchetypes.includes(l.precomputed_mode)) {
      modePerLesson[i] = l.precomputed_mode;
    }
  });

  const unscored = ordered.filter((l, i) => modePerLesson[i] === null);
  if (unscored.length > 0) {
    const scoringInput = unscored
      .map((l) => `LESSON ${l.lesson_number}:\n${l.transcript_text}`)
      .join("\n\n---\n\n");

    const rawScores = await callClaude(
      anthropic,
      GIR_SCORING_SYSTEM,
      `Score each transcript and return the dominant mode for each lesson:\n\n${scoringInput}`,
      200,
    );

    // Map "LESSON N: Mode" back to the correct position by lesson_number.
    const scoredByNumber = {};
    for (const line of rawScores.split("\n")) {
      const match = line.match(/LESSON\s+(\d+):\s*(\w+)/i);
      if (match) {
        const num = Number(match[1]);
        const mode = match[2].trim();
        scoredByNumber[num] = validArchetypes.includes(mode) ? mode : "Framer";
      }
    }
    ordered.forEach((l, i) => {
      if (modePerLesson[i] === null) {
        modePerLesson[i] = scoredByNumber[l.lesson_number] || "Framer";
      }
    });
  }

  // ── Step 2: Compute range in JS ────────────────────────────────────────────
  const modeCounts = { Storyteller: 0, Framer: 0, Archivist: 0, Artist: 0, Integrator: 0 };
  for (const mode of modePerLesson) {
    if (modeCounts[mode] !== undefined) modeCounts[mode]++;
  }

  const homeBase = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0][0];
  const rangeModes = validArchetypes.filter((m) => m !== homeBase && modeCounts[m] > 0);
  const absentModes = validArchetypes.filter((m) => modeCounts[m] === 0);
  const appearedModes = [homeBase, ...rangeModes]; // home base first, then range

  // Build combined transcript reference for Claude calls.
  // modePerLesson is indexed by position in `ordered`, so use the same index.
  const allTranscripts = ordered
    .map((l, i) => `LESSON ${l.lesson_number} [Mode: ${modePerLesson[i]}]:\n${l.transcript_text}`)
    .join("\n\n---\n\n");

  // ── Steps 3–6: Run in parallel once home_base + modes are known ────────────
  const [quotesRaw, rangeParagraphsRaw, howShowUpRaw] = await Promise.all([
    // Section IV: Evidence Deep-Dive — one quote per session with a tracking line
    callClaude(
      anthropic,
      withGlobalRules(GIR_QUOTES_SYSTEM),
      `Modes that appeared: ${appearedModes.join(", ")}\nHome base: ${homeBase}\n\nAll 10 lesson transcripts with mode scores:\n---\n${allTranscripts}\n---\n\nProduce one block per session that contains usable language. Follow the output format exactly.`,
      1400,
    ),
    // Section V: Range Mapping — paragraphs + Emerging Perceptual Capacities
    callClaude(
      anthropic,
      withGlobalRules(GIR_RANGE_SYSTEM),
      `Home base: ${homeBase}\nRange modes: ${rangeModes.join(", ") || "none"}\nAbsent modes: ${absentModes.join(", ") || "none"}\n\nAll 10 lesson transcripts:\n---\n${allTranscripts}\n---\n\nWrite one paragraph per appeared mode (${appearedModes.join(", ")}), then the Emerging Perceptual Capacities paragraph with parenthetical archetype mapping, then the absent sentence.`,
      1400,
    ),
    // Section VI: How might this show up?
    callClaude(
      anthropic,
      withGlobalRules(GIR_HOW_SYSTEM),
      `Home base: ${homeBase}\nRange modes: ${rangeModes.join(", ") || "none"}\n\nAll 10 lesson transcripts:\n---\n${allTranscripts}\n---\n\nWrite the "How might this show up?" paragraph.`,
      400,
    ),
  ]);

  // Parse Section IV evidence using the unambiguous [[MARKER]] tokens the prompt
  // enforces. Each field is captured between its marker and the NEXT marker (or
  // [[END]]), so a reflection that contains the word "session" can never be
  // mistaken for a new block. Markers are stripped from the captured text.
  const evidence = [];
  // One block per [[SESSION]] ... up to [[END]] (or the next [[SESSION]]).
  const blockRe = /\[\[SESSION\]\]([\s\S]*?)(?:\[\[END\]\]|(?=\[\[SESSION\]\])|$)/gi;
  const field = (block, tag) => {
    // Capture from [[TAG]] up to the next [[ marker.
    const m = block.match(new RegExp(`\\[\\[${tag}\\]\\]\\s*([\\s\\S]*?)\\s*(?=\\[\\[|$)`, "i"));
    return m ? m[1].trim() : "";
  };
  let bm;
  while ((bm = blockRe.exec(quotesRaw)) !== null) {
    const block = bm[1];
    const sessionNum = (block.match(/^\s*(\d+)/) || [])[1];
    const dominant = field(block, "DOMINANT").match(/[A-Za-z]+/)?.[0] || null;
    const quote = field(block, "QUOTE").replace(/^["'“”]+|["'“”]+$/g, "").trim();
    const reflection = field(block, "REFLECTION");
    if (quote) {
      evidence.push({
        session_number: sessionNum ? Number(sessionNum) : null,
        dominant_archetype: dominant,
        quote,
        reflection,
      });
    }
  }

  // Backward-compatible flat list of quote + meaning (one per appeared mode,
  // de-duplicated by dominant archetype) for the PDF builder and older clients.
  const seenModes = new Set();
  const quotesAndMeanings = [];
  for (const e of evidence) {
    const mode = e.dominant_archetype || "";
    if (mode && !seenModes.has(mode)) {
      seenModes.add(mode);
      quotesAndMeanings.push({ mode, quote: e.quote, vts_commentary: e.reflection });
    }
  }

  // Parse Section V range: MODE/PARAGRAPH blocks, plus CAPACITIES and ABSENT.
  const yourRange = [];
  let absentSentence = absentModes.length > 0
    ? `The ${absentModes.join(", ")} ${absentModes.length === 1 ? "mode" : "modes"} did not appear in this sequence.`
    : "All five modes appeared across these ten transcripts.";
  let emergingCapacities = "";

  // Normalise any model phrasing ("The Artist", "Artist:", "the artist mode")
  // to the canonical archetype name, or null if none matches.
  const normalizeMode = (raw) => {
    if (!raw) return null;
    const lower = raw.toLowerCase();
    return validArchetypes.find((m) => lower.includes(m.toLowerCase())) || null;
  };

  // Parse Section V using [[MODE]] / [[PARAGRAPH]] / [[ENDMODE]] markers, plus
  // [[CAPACITIES]] and [[ABSENT]]. Field text is captured up to the next [[ marker.
  const rangeField = (block, tag) => {
    const m = block.match(new RegExp(`\\[\\[${tag}\\]\\]\\s*([\\s\\S]*?)\\s*(?=\\[\\[|$)`, "i"));
    return m ? m[1].trim() : "";
  };
  const modeBlockRe = /\[\[MODE\]\]([\s\S]*?)(?:\[\[ENDMODE\]\]|(?=\[\[MODE\]\])|(?=\[\[CAPACITIES\]\])|(?=\[\[ABSENT\]\])|$)/gi;
  let mb;
  while ((mb = modeBlockRe.exec(rangeParagraphsRaw)) !== null) {
    const block = mb[1];
    const modeName = normalizeMode((block.match(/^\s*(.+)/) || [])[1]);
    const paragraph = rangeField(block, "PARAGRAPH");
    if (modeName && paragraph) {
      yourRange.push({ mode: modeName, paragraph });
    }
  }

  const capMatch = rangeParagraphsRaw.match(/\[\[CAPACITIES\]\]\s*([\s\S]*?)\s*(?=\[\[|$)/i);
  if (capMatch) emergingCapacities = capMatch[1].trim();
  const absMatch = rangeParagraphsRaw.match(/\[\[ABSENT\]\]\s*([\s\S]*?)\s*(?=\[\[|$)/i);
  if (absMatch && absMatch[1].trim()) absentSentence = absMatch[1].trim();

  // Section III overview ("How You See") — a computed summary narrative naming
  // which modes appeared, the home base, and which did not appear.
  const appearedCount = appearedModes.length;
  const numberWords = ["zero", "one", "two", "three", "four", "five"];
  const rangeList =
    rangeModes.length > 0
      ? `Alongside it, the ${rangeModes.join(", the ")} each appeared at least once across the sequence, showing up in response to specific images and prompts that seemed to call them forward. `
      : "";
  const absentNarrative =
    absentModes.length > 0
      ? `The ${absentModes.join(", the ")} did not appear across these ten transcripts.`
      : "All five perceptual modes appeared at least once across the sequence.";
  const overview = `Across ten encounters with progressively more challenging images, ${numberWords[appearedCount] || appearedCount} of the five perceptual modes appeared in your language. Your home base appears to be the ${homeBase}: this is the mode you returned to most consistently, and the one that seems to anchor how you first enter an image. ${rangeList}${absentNarrative}`;

  return {
    home_base: homeBase,
    range_modes: rangeModes,
    absent_modes: absentModes,
    mode_counts: modeCounts,
    report: {
      fixed_intro: GIR_FIXED_INTRO,
      // Section III: summary narrative of which modes appeared.
      overview,
      how_you_see: ARCHETYPE_DESCRIPTIONS[homeBase], // full description of the home base archetype
      // Section IV: per-session evidence, each with a dominant-archetype tracking line.
      evidence,
      quotes_and_meanings: quotesAndMeanings,
      // Section V: range mapping.
      your_range: yourRange,
      emerging_perceptual_capacities: emergingCapacities,
      absent_modes_sentence: absentSentence,
      // Section VI.
      how_might_this_show_up: howShowUpRaw.trim(),
      home_base_archetype_description: ARCHETYPE_DESCRIPTIONS[homeBase],
    },
  };
};

module.exports = {
  analyzeArchetype,
  analyzeLessonArchetype,
  analyzeGrowthInRange,
  ARCHETYPE_SUBTITLES,
  ARCHETYPE_DESCRIPTIONS,
  FIXED_INTRO,
};
