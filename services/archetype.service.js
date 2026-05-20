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

// ─── Lesson Report — Prompts & Meanings system ───────────────────────────────
//
// Structure (matches Figma images 9-16):
//   intro (fixed)
//   archetype badge
//   per-prompt: "What You Said · What It Reveals · Prompt N"
//     quote(s) from that prompt + VTS meaning
//   The Perception Framework (all 5 archetypes)
//   Moving Across Your Range
//   How might this growth show up?

const LESSON_FIXED_INTRO = `You spent time with three paintings, thinking out loud. The way you moved through each one, what you named first, what pulled you in, what made you pause, is not random. Taken together, these three encounters reveal something consistent about how your mind makes meaning, and they also show a range that opened up as you kept looking.

This is your Aesthetic Archetype portrait.

What follows is a current cognitive pattern, not a fixed identity. It describes how you made meaning across these three encounters, right now. Development is not linear, and your range is not defined by three transcripts. What these three images show is where you tend to begin, and what becomes available when the image gives you permission to move differently.`;

const LESSON_PERCEPTION_FRAMEWORK_INTRO = `You use all five of these. What varies is which feels most like home, and which one showed up most when you looked at these images.`;

const LESSON_PERCEPTION_FRAMEWORK_ARCHETYPES = [
  {
    name: "Storyteller",
    subtitle: "Narrative Maker",
    description: "You enter an image before you analyse it. You bring your senses, your memories, your instincts and you weave what you see into something alive. The Storyteller makes meaning fast and makes it personal.",
  },
  {
    name: "Framer",
    subtitle: "Structure Seeker",
    description: "You want to know how something works. You look for the logic, the craft, the intention. You measure what you see against what you know and you trust that standard. The Framer brings order to complexity.",
  },
  {
    name: "Archivist",
    subtitle: "Context Builder",
    description: "You reach for context immediately. Who made this. When. Why. How it connects to everything else you know. Your thinking is layered and historically fluent. The Archivist sees not just what something is, but where it belongs.",
  },
  {
    name: "Artist",
    subtitle: "Emotional Explorer",
    description: "You let meaning unfold rather than rushing toward it. You hold complexity without needing to resolve it. You follow intuition as closely as knowledge. The Artist asks the question nobody else was willing to ask.",
  },
  {
    name: "Integrator",
    subtitle: "Reflective Synthesiser",
    description: "You hold all of it at once, the personal and the universal, the emotional and the analytical. These aren't separate modes for you, they move together. The Integrator sees the whole picture, and knows it will keep revealing itself.",
  },
];

// Secondary archetype detection — returns the 2nd highest scoring archetype
const SECONDARY_DETECTION_SYSTEM = `You are an expert in Visual Thinking Strategies (VTS) and aesthetic cognition analysis.
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

The primary archetype has already been identified. Return ONLY the name of the archetype with the SECOND highest count — not the primary.
Return a single word. One of exactly: Storyteller, Framer, Archivist, Artist, Integrator.
No explanation. No punctuation. Just the word.`;

// Per-prompt VTS quote + meaning extraction
const LESSON_PROMPT_QUOTES_SYSTEM = `You are an expert in Visual Thinking Strategies (VTS) and aesthetic cognition.
You analyse what a person said during one specific prompt in front of an artwork.

VTS PARAPHRASING RULES — follow exactly:

1. NEVER praise or evaluate. Forbidden phrases: "great observation", "interesting point", "insightful", "well said", any form of compliment.

2. Select 1–2 of the most revealing moments from the transcript for this prompt.
   - If the transcript is long, quote a specific phrase or sentence verbatim.
   - If the transcript is short (1–3 sentences), you may quote the entire response verbatim as QUOTE 1.
   - Never fabricate, rephrase, or reconstruct — only use words actually present in the transcript.
   - You MUST always produce at least QUOTE 1. Even a single sentence transcript has a quote.

3. For each quote, write a Meaning block that:
   - Names the thinking move (Observing / Interpreting / Reasoning / Feeling / Connecting / Wondering)
   - Uses stems: "You're noticing..." / "You're constructing..." / "You're sensing..." / "You're raising the question..."
   - Uses conditional language where appropriate: "might suggest", "seems to", "could indicate"
   - Identifies what cognitive stage this represents and how it connects to the dominant archetype

OUTPUT FORMAT — follow exactly, no deviations:

QUOTE 1:
"[verbatim text from transcript]"
Meaning: [2-3 sentences using VTS metacognitive language]

QUOTE 2:
"[verbatim text from transcript]"
Meaning: [2-3 sentences using VTS metacognitive language]

Always output at least QUOTE 1. Only output QUOTE 2 if the transcript contains a second distinct moment worth highlighting.`;

// Archetype narrative — appears under "Your Primary Aesthetic Archetypes" (Figma image 10)
// Walks through each prompt describing how both archetypes surfaced
const ARCHETYPE_NARRATIVE_SYSTEM = `You write the narrative body under "Your Primary Aesthetic Archetypes" for an Aesthetic Archetype lesson report.

This section walks through each of the three prompts in sequence, describing exactly how the primary and secondary archetypes showed up in the person's responses. It is written as vivid, precise prose that names what the person actually did in each prompt — not what the archetypes mean in general.

REQUIRED STRUCTURE — exactly 4 paragraphs:

Paragraph 1 — "In the first prompt..."
  Begin with "In the first prompt" and describe what the person did in prompt 1. Name the thinking mode visible (primary archetype). Be specific: what did they notice first, how did they enter the image, what was their move? Use language that reflects what is actually in the transcript.

Paragraph 2 — "The second prompt..." or "In the second prompt..."
  Begin with "The second prompt" or "In the second prompt" and describe what happened in prompt 2. Did the same mode continue? Did something shift? Name the moment where the secondary archetype began to surface, if it did. Be precise about what changed.

Paragraph 3 — "By the third prompt..." or "In the third prompt..."
  Begin with "By the third prompt" or "In the third prompt" and describe prompt 3. Was a different mode dominant? Did the secondary archetype take over? Name what changed and what stayed the same.

Paragraph 4 — synthesis (no fixed opening phrase)
  Bring it together: what do these three encounters show together? What does the combination of the primary and secondary archetype reveal about this person's perceptual intelligence? Write this as a warm, forward-looking conclusion that connects both archetypes.

Rules:
- Second person ("you"), past tense for describing each prompt, present tense in the synthesis
- Exactly 4 paragraphs — no more, no fewer
- No bullet points, no markdown, no section headings
- No praise or evaluation. Forbidden: "great", "insightful", "interesting", "well said", "impressive"
- Tone: warm, precise, non-clinical — like a perceptive observer describing what they witnessed
- Name the archetype modes explicitly (Storyteller, Framer, Archivist, Artist, Integrator) where relevant
- Ground every claim in what is actually in the transcripts — do not invent or generalise
- Output only the 4 body paragraphs`;

// Moving Across Your Range narrative — thematic synthesis (Figma images 13-14)
const LESSON_RANGE_SYSTEM = `You write the "Moving Across Your Range" section for an Aesthetic Archetype lesson report.

This section is a thematic synthesis — not a prompt-by-prompt walkthrough (that appears earlier in the report). It describes what the movement across all three encounters reveals about the person's cognitive range as a whole: what their home base archetype gives them, which other archetype(s) became available, and what the shift between them means for how they think.

REQUIRED STRUCTURE — exactly 3–4 paragraphs:

Paragraph 1: Name what the home base archetype gives this person as a foundation. What strength or default does it provide? Be concrete about the cognitive move it represents.

Paragraph 2: Describe when and how the range archetype (secondary) became available during the session. What condition invited it? Was it a particular image, a question the artwork posed, an emotional opening? Describe the mechanism of the shift.

Paragraph 3: Describe what this range reveals — the difference between arriving at the secondary archetype from this home base versus arriving there from a different starting point. What is the particular quality of this person's range?

Optional Paragraph 4 (only if needed): A forward-looking synthesis — what becomes possible when both modes are available to this person.

Rules:
- Second person ("you"), present/past tense as appropriate
- 3–4 paragraphs, no bullet points, no markdown, no headings
- Do NOT restate what happened in each individual prompt (that is covered in the archetype narrative)
- Warm, precise, non-clinical tone
- Name specific archetypes where relevant
- Do not name the section heading — output only the body paragraphs
- Forbidden: "great", "insightful", "interesting", any form of praise`;

// "How might this growth show up?" section
const LESSON_GROWTH_SYSTEM = `You write the "How might this growth show up?" section for an Aesthetic Archetype lesson report.

This section describes how the cognitive range shown across the three prompts might manifest beyond the art room — in work, relationships, creative practice, and daily life.

Rules:
- Second person ("you"), present/future tense
- 2–3 paragraphs
- No bullet points, no markdown
- Grounded in the specific archetypes detected, not generic
- Reference both the home base and the range archetypes
- Do not name the section heading — output only the body text`;

// Parse per-prompt quotes from Claude output
// fallbackTranscript is used if Claude returns no parseable quotes (e.g. very short text)
const parseLessonPromptQuotes = (text, fallbackTranscript = "") => {
  const parsed = text
    .split(/QUOTE \d+:/i)
    .slice(1)
    .map((block) => {
      const lines = block.trim().split("\n").filter((l) => l.trim());
      const quoteLine = lines[0]?.replace(/^[""\u201c\u201d]|[""\u201c\u201d]$/g, "").trim() ?? "";
      const meaningIdx = lines.findIndex((l) => /^Meaning:/i.test(l.trim()));
      const meaning =
        meaningIdx !== -1
          ? lines.slice(meaningIdx).join(" ").replace(/^Meaning:\s*/i, "").trim()
          : "";
      return { quote: quoteLine, meaning };
    })
    .filter((q) => q.quote.length > 0)
    .slice(0, 2);

  // Fallback: if Claude returned nothing parseable, use the raw transcript as the quote
  // with a generic VTS meaning so the report is never empty
  if (parsed.length === 0 && fallbackTranscript.trim().length > 0) {
    return [
      {
        quote: fallbackTranscript.trim(),
        meaning:
          "You're sharing your full response to this prompt. The observation connects directly to how you engage with what you see, reflecting your dominant perceptual pattern.",
      },
    ];
  }

  return parsed;
};

// ─── Main lesson report function ─────────────────────────────────────────────

const analyzeLessonArchetype = async ({ transcripts }) => {
  // transcripts = array of 3 strings, one per prompt
  if (!Array.isArray(transcripts) || transcripts.length !== 3) {
    throw new AppError("Exactly 3 transcripts are required", 400, "VALIDATION_ERROR");
  }

  const anthropic = client();
  const combinedTranscript = transcripts
    .map((t, i) => `PROMPT ${i + 1}:\n${t}`)
    .join("\n\n---\n\n");

  // Step 1: Detect dominant archetype from combined transcript
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

  // Step 2: Detect secondary archetype + all per-prompt + range + growth in parallel
  // archetypeNarrative requires the validated secondary name, so it runs in step 3
  const [
    rawSecondary,
    promptQuotesRaw1,
    promptQuotesRaw2,
    promptQuotesRaw3,
    _unused,
    rangeRaw,
    growthRaw,
  ] = await Promise.all([
    // Secondary archetype (2nd highest scorer)
    callClaude(
      anthropic,
      SECONDARY_DETECTION_SYSTEM,
      `Primary archetype already identified: ${archetypeName}\n\nAnalyze this lesson transcript and return the SECOND dominant archetype:\n\n---TRANSCRIPT START---\n${combinedTranscript}\n---TRANSCRIPT END---`,
      20,
    ),
    // Per-prompt quote extraction
    callClaude(
      anthropic,
      LESSON_PROMPT_QUOTES_SYSTEM,
      `Dominant archetype: ${archetypeName}\n\nPrompt 1 transcript:\n${transcripts[0]}\n\nExtract the 1–2 most revealing quotes from this prompt. Follow the output format exactly.`,
      600,
    ),
    callClaude(
      anthropic,
      LESSON_PROMPT_QUOTES_SYSTEM,
      `Dominant archetype: ${archetypeName}\n\nPrompt 2 transcript:\n${transcripts[1]}\n\nExtract the 1–2 most revealing quotes from this prompt. Follow the output format exactly.`,
      600,
    ),
    callClaude(
      anthropic,
      LESSON_PROMPT_QUOTES_SYSTEM,
      `Dominant archetype: ${archetypeName}\n\nPrompt 3 transcript:\n${transcripts[2]}\n\nExtract the 1–2 most revealing quotes from this prompt. Follow the output format exactly.`,
      600,
    ),
    // Archetype narrative — appears under "Your Primary Aesthetic Archetypes" heading (Figma image 10)
    // Written AFTER secondary is detected — but since we run in parallel, we pass secondary placeholder.
    // We resolve this after Promise.all using the validated secondaryName.
    // For now pass "secondary archetype" as placeholder — overridden below after validation.
    null, // placeholder, replaced below
    // Range narrative — thematic synthesis (Figma images 13-14)
    callClaude(
      anthropic,
      LESSON_RANGE_SYSTEM,
      `Primary archetype: ${archetypeName} (${archetypeSubtitle})\n\nAll 3 prompt transcripts:\n---\n${combinedTranscript}\n---\n\nWrite the "Moving Across Your Range" thematic synthesis.`,
      800,
    ),
    // Growth section
    callClaude(
      anthropic,
      LESSON_GROWTH_SYSTEM,
      `Dominant archetype: ${archetypeName}\nArchetype subtitle: ${archetypeSubtitle}\n\nAll 3 prompt transcripts:\n---\n${combinedTranscript}\n---\n\nWrite the "How might this growth show up?" body text.`,
      600,
    ),
  ]);

  // Validate secondary — fall back to a different archetype if Claude returns the same one
  const secondaryName = validArchetypes.includes(rawSecondary.trim()) && rawSecondary.trim() !== archetypeName
    ? rawSecondary.trim()
    : validArchetypes.find((a) => a !== archetypeName) ?? archetypeName;

  const secondarySubtitle = ARCHETYPE_SUBTITLES[secondaryName];

  // Step 3: Now generate archetype narrative with validated secondary name
  const archetypeNarrativeRawFinal = await callClaude(
    anthropic,
    ARCHETYPE_NARRATIVE_SYSTEM,
    `Primary archetype: ${archetypeName} (${archetypeSubtitle})\nSecondary archetype: ${secondaryName} (${ARCHETYPE_SUBTITLES[secondaryName]})\n\nPROMPT 1 transcript:\n${transcripts[0]}\n\nPROMPT 2 transcript:\n${transcripts[1]}\n\nPROMPT 3 transcript:\n${transcripts[2]}\n\nWrite the 4-paragraph archetype narrative. Start paragraph 1 with "In the first prompt", paragraph 2 with "The second prompt" or "In the second prompt", paragraph 3 with "By the third prompt" or "In the third prompt", then a synthesising paragraph 4.`,
    1000,
  );

  return {
    // ── Screen: Intro (Figma image 9)
    intro: LESSON_FIXED_INTRO,

    // ── Screen: Your Primary Aesthetic Archetypes (Figma image 10)
    // Badge: "The Framer & The Artist" + subtitles
    archetype: {
      name: archetypeName,
      subtitle: archetypeSubtitle,
    },
    secondaryArchetype: {
      name: secondaryName,
      subtitle: secondarySubtitle,
    },
    // Claude-generated narrative under the badge — prompt-by-prompt account of how both
    // archetypes surfaced across the three encounters (Figma image 10 body text)
    archetypeNarrative: archetypeNarrativeRawFinal.trim(),

    // ── Screen: What You Said · What It Reveals (Figma images 11-12)
    // Per-prompt quote+meaning blocks, one section per prompt
    promptInsights: [
      { prompt_number: 1, quotes: parseLessonPromptQuotes(promptQuotesRaw1, transcripts[0]) },
      { prompt_number: 2, quotes: parseLessonPromptQuotes(promptQuotesRaw2, transcripts[1]) },
      { prompt_number: 3, quotes: parseLessonPromptQuotes(promptQuotesRaw3, transcripts[2]) },
    ],

    // ── Screen: The Perception Framework (Figma images 12-13) — fully static
    perceptionFramework: {
      intro: LESSON_PERCEPTION_FRAMEWORK_INTRO,
      archetypes: LESSON_PERCEPTION_FRAMEWORK_ARCHETYPES,
    },

    // ── Screen: Moving Across Your Range (Figma images 13-14)
    // Thematic synthesis — NOT a prompt-by-prompt walkthrough (that is archetypeNarrative)
    movingAcrossYourRange: rangeRaw.trim(),

    // ── Screen: How might this growth show up? (Figma image 16)
    howMightThisGrowthShowUp: growthRaw.trim(),
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
For each lesson return ONLY the dominant mode — one of exactly:
Storyteller, Framer, Archivist, Artist, Integrator

OUTPUT FORMAT — one line per lesson, nothing else:
LESSON 1: <mode>
LESSON 2: <mode>
...
LESSON 10: <mode>

No explanation. No punctuation beyond the colon. No extra text.`;

// Steps 3+4 — Verbatim quote extraction
const GIR_QUOTES_SYSTEM = `You are an expert in Visual Thinking Strategies (VTS).
Given a set of labelled transcripts and their mode scores, select ONE verbatim quote per mode that appeared.

Rules:
- VERBATIM ONLY — copy the exact words from the transcript, do not paraphrase or reconstruct
- No em dashes (use commas or full stops instead)
- Quote must demonstrate the named mode clearly
- If a mode did not appear, do not include it

OUTPUT FORMAT — one block per mode, nothing else:
MODE: <mode name>
QUOTE: "<exact verbatim text from transcript>"`;

// Step 4 — VTS commentary per quote
const GIR_COMMENTARY_SYSTEM = `You are an expert in Visual Thinking Strategies (VTS).
Write one short VTS commentary (2-3 sentences) for each quote provided.

VTS PARAPHRASING RULES:
1. NEVER praise or evaluate. Forbidden: "rare", "insightful", "brilliant", "impressive", "great observation", any compliment.
2. NAME THE THINKING MOVE using metacognitive language:
   Observing:    "You're noticing..." / "You're attending to..." / "You're pointing out..."
   Interpreting: "You're constructing a narrative..." / "You're imagining this as..."
   Reasoning:    "You're grounding your idea in what you see..." / "You're working backward..."
   Feeling:      "You're sensing an emotional tone..." / "You're entering the image through empathy..."
   Connecting:   "You're linking this to..." / "You're integrating several ideas..."
   Wondering:    "You're raising the question..." / "You're exploring unknowns..."
3. USE CONDITIONAL LANGUAGE: "might suggest", "seems to", "could indicate", "appears to"
4. No em dashes — use commas or full stops.

OUTPUT FORMAT — one block per mode, matching the input order:
MODE: <mode name>
COMMENTARY: <2-3 sentence VTS commentary>`;

// Step 5 — "Your Range" paragraphs
const GIR_RANGE_SYSTEM = `You write the "Your Range" section for a Growth in Range report.
Write one paragraph per mode that appeared. Then write one plain sentence naming absent modes without judgment.

Rules:
- Second person ("you"), present/past tense as appropriate
- Conditional observational language: "it seems", "appears to", "might suggest"
- One paragraph per appeared mode — describe what that mode looks like in this person's responses
- Do NOT rank the range. Two modes is not less developed than five.
- One final sentence naming absent modes plainly: "The [X], [Y] and [Z] modes did not appear in this sequence."
- No bullet points, no markdown, no praise
- No em dashes

OUTPUT FORMAT — one block per appeared mode, then the absent sentence:
MODE: <mode name>
PARAGRAPH: <paragraph text>

ABSENT: <one sentence naming all absent modes>`;

// Step 6 — "How Might This Show Up?"
const GIR_HOW_SYSTEM = `You write the "How might this show up?" section for a Growth in Range report.
One paragraph. Conditional voice. References the home base mode and at least one range mode.
Describes how this cognitive pattern might manifest beyond the art room — in work, relationships, or daily life.

Rules:
- Second person ("you"), present/future tense
- Conditional language throughout: "might", "could", "it seems", "appears to"
- Reference home base + at least one range mode by name
- No bullet points, no markdown
- No em dashes
- No praise or evaluation
- Output only the paragraph body — no heading`;

const analyzeGrowthInRange = async ({ lessons }) => {
  // lessons = [{ lesson_number: 1, transcript_text: "..." }, ...]
  if (!Array.isArray(lessons) || lessons.length === 0) {
    const AppError = require("../utils/app-error");
    throw new AppError("No lesson transcripts found for the Growth in Range report", 400, "VALIDATION_ERROR");
  }

  const anthropic = client();
  const validArchetypes = ["Storyteller", "Framer", "Archivist", "Artist", "Integrator"];

  // ── Step 1: Score all 10 transcripts in one Claude call ────────────────────
  const scoringInput = lessons
    .sort((a, b) => a.lesson_number - b.lesson_number)
    .map((l) => `LESSON ${l.lesson_number}:\n${l.transcript_text}`)
    .join("\n\n---\n\n");

  const rawScores = await callClaude(
    anthropic,
    GIR_SCORING_SYSTEM,
    `Score each transcript and return the dominant mode for each lesson:\n\n${scoringInput}`,
    200,
  );

  // Parse "LESSON N: Mode" lines
  const modePerLesson = [];
  for (const line of rawScores.split("\n")) {
    const match = line.match(/LESSON\s+\d+:\s*(\w+)/i);
    if (match) {
      const mode = match[1].trim();
      modePerLesson.push(validArchetypes.includes(mode) ? mode : "Framer"); // fallback
    }
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

  // Build combined transcript reference for Claude calls
  const allTranscripts = lessons
    .sort((a, b) => a.lesson_number - b.lesson_number)
    .map((l) => `LESSON ${l.lesson_number} [Mode: ${modePerLesson[l.lesson_number - 1]}]:\n${l.transcript_text}`)
    .join("\n\n---\n\n");

  // ── Steps 3–6: Run in parallel once home_base + modes are known ────────────
  const [quotesRaw, rangeParagraphsRaw, howShowUpRaw] = await Promise.all([
    // Step 3: Pull verbatim quotes (one per appeared mode)
    callClaude(
      anthropic,
      GIR_QUOTES_SYSTEM,
      `Modes that appeared: ${appearedModes.join(", ")}\nHome base: ${homeBase}\n\nAll 10 lesson transcripts with mode scores:\n---\n${allTranscripts}\n---\n\nSelect ONE verbatim quote per appeared mode. Follow the output format exactly.`,
      800,
    ),
    // Step 5: Write "Your Range" paragraphs
    callClaude(
      anthropic,
      GIR_RANGE_SYSTEM,
      `Home base: ${homeBase}\nRange modes: ${rangeModes.join(", ") || "none"}\nAbsent modes: ${absentModes.join(", ") || "none"}\n\nAll 10 lesson transcripts:\n---\n${allTranscripts}\n---\n\nWrite one paragraph per appeared mode (${appearedModes.join(", ")}), then the absent sentence.`,
      1000,
    ),
    // Step 6: Write "How might this show up?"
    callClaude(
      anthropic,
      GIR_HOW_SYSTEM,
      `Home base: ${homeBase}\nRange modes: ${rangeModes.join(", ") || "none"}\n\nAll 10 lesson transcripts:\n---\n${allTranscripts}\n---\n\nWrite the "How might this show up?" paragraph.`,
      400,
    ),
  ]);

  // Parse quotes: MODE: X\nQUOTE: "..."
  const parsedQuotes = [];
  const quoteBlocks = quotesRaw.split(/\nMODE:/i).filter((b) => b.trim());
  for (const block of quoteBlocks) {
    const modeMatch = block.match(/^[\s]*([A-Za-z]+)/);
    const quoteMatch = block.match(/QUOTE:\s*[""]?(.+?)[""]?\s*$/ms);
    if (modeMatch && quoteMatch) {
      parsedQuotes.push({
        mode: modeMatch[1].trim(),
        quote: quoteMatch[1].trim().replace(/^[""\u201c]|[""\u201d]$/g, ""),
      });
    }
  }

  // Step 4: Write VTS commentary for each parsed quote (sequential — depends on step 3)
  const quotesForCommentary = parsedQuotes
    .map((q) => `MODE: ${q.mode}\nQUOTE: "${q.quote}"`)
    .join("\n\n");

  const commentaryRaw = await callClaude(
    anthropic,
    GIR_COMMENTARY_SYSTEM,
    `Write VTS commentary for each quote below. Follow the output format exactly.\n\n${quotesForCommentary}`,
    600,
  );

  // Parse commentary: MODE: X\nCOMMENTARY: ...
  const commentaryMap = {};
  const commentaryBlocks = commentaryRaw.split(/\nMODE:/i).filter((b) => b.trim());
  for (const block of commentaryBlocks) {
    const modeMatch = block.match(/^[\s]*([A-Za-z]+)/);
    const commentaryMatch = block.match(/COMMENTARY:\s*(.+)/s);
    if (modeMatch && commentaryMatch) {
      commentaryMap[modeMatch[1].trim()] = commentaryMatch[1].trim();
    }
  }

  // Merge quotes + commentary
  const quotesAndMeanings = parsedQuotes.map((q) => ({
    mode: q.mode,
    quote: q.quote,
    vts_commentary: commentaryMap[q.mode] ?? "",
  }));

  // Parse range paragraphs: MODE: X\nPARAGRAPH: ...\n\nABSENT: ...
  const yourRange = [];
  let absentSentence = absentModes.length > 0
    ? `The ${absentModes.join(", ")} ${absentModes.length === 1 ? "mode" : "modes"} did not appear in this sequence.`
    : "All five modes appeared across these ten transcripts.";

  const rangeBlocks = rangeParagraphsRaw.split(/\nMODE:/i).filter((b) => b.trim());
  for (const block of rangeBlocks) {
    if (/^ABSENT:/i.test(block.trim())) {
      const absentMatch = block.match(/^ABSENT:\s*(.+)/is);
      if (absentMatch) absentSentence = absentMatch[1].trim();
      continue;
    }
    const modeMatch = block.match(/^[\s]*([A-Za-z]+)/);
    const paraMatch = block.match(/PARAGRAPH:\s*(.+)/s);
    if (modeMatch && paraMatch) {
      yourRange.push({
        mode: modeMatch[1].trim(),
        paragraph: paraMatch[1].trim(),
      });
    }
  }

  // Also check for ABSENT: at the top level (some parsers emit it outside a MODE block)
  const absentTopMatch = rangeParagraphsRaw.match(/\nABSENT:\s*(.+)/i);
  if (absentTopMatch) absentSentence = absentTopMatch[1].trim();

  return {
    home_base: homeBase,
    range_modes: rangeModes,
    absent_modes: absentModes,
    mode_counts: modeCounts,
    report: {
      fixed_intro: GIR_FIXED_INTRO,
      how_you_see: ARCHETYPE_DESCRIPTIONS[homeBase], // full description of the home base archetype
      quotes_and_meanings: quotesAndMeanings,
      your_range: yourRange,
      absent_modes_sentence: absentSentence,
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
