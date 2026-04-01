import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function openrouterInference(): Promise<void> {
  await client.chat.completions.create({
    model: "anthropic/claude-haiku-4-5",
    max_tokens: 1,
    temperature: 0,
    messages: [{ role: "user", content: "Hi" }],
  });
}
