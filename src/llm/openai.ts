import OpenAI from "openai";

const client = new OpenAI();

export async function openaiInference(): Promise<void> {
  await client.chat.completions.create({
    model: "gpt-5-mini",
    max_tokens: 1,
    temperature: 0,
    messages: [{ role: "user", content: "Hi" }],
  });
}
