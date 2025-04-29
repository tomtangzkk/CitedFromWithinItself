import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET allowed" });
  }

  try {
    const prompt = \`Generate a fictional citation consisting of an author's name and a book title related to time, reading, or memory. Respond in this format:
Name: [Author Name], Work: [Book Title]\`;

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.data.choices[0].message.content;
    const match = text.match(/Name:\s*(.*),\s*Work:\s*(.*)/i);
    const name = match ? match[1].trim() : "Unknown";
    const work = match ? match[2].trim() : "Untitled";

    res.status(200).json({ name, work });
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: "Failed to generate citation" });
  }
}
