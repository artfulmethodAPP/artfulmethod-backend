const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");
const path = require("path");
const AppError = require("../utils/app-error");

const defaultPromptTemplate = fs.readFileSync(
  path.join(__dirname, "../prompts/mental-health-prompt.txt"),
  "utf-8",
);

/**
 * Analyze transcribed text for mental health signals using Claude.
 * @param {string} text - The transcribed speech text from the user.
 * @returns {Promise<{analysis: string, usage: object}>}
 */
const analyzeMentalHealth = async ({ text }) => {
  if (!process.env.CLAUDE_API_KEY) {
    throw new AppError(
      "Claude API key is not configured",
      500,
      "CLAUDE_NOT_CONFIGURED",
    );
  }

  const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

  const template = defaultPromptTemplate;

  if (!template.includes("{{TRANSCRIBED_TEXT}}")) {
    throw new AppError(
      "Prompt template must contain {{TRANSCRIBED_TEXT}} placeholder",
      400,
      "INVALID_PROMPT_TEMPLATE",
    );
  }

  const prompt = template.replace("{{TRANSCRIBED_TEXT}}", text);

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 50,
    messages: [{ role: "user", content: prompt }],
  });
  console.log(message.content);
  const analysis = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  return {
    analysis,
    usage: {
      input_tokens: message.usage.input_tokens,
      output_tokens: message.usage.output_tokens,
    },
  };
};

module.exports = { analyzeMentalHealth };
