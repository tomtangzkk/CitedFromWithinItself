import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET requests are allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Missing OpenAI API key" });
  }

  try {
    const prompt = `Generate a fictional citation consisting of an author's name and a book title related to time, reading, or memory. Respond in this format:
Name: [Author Name], Work: [Book Title]`;

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7, // 控制生成文本的随机性
      max_tokens: 100,  // 限制返回内容长度
    });

    const text = completion.data.choices[0].message.content;
    const match = text.match(/Name:\s*(.*),\s*Work:\s*(.*)/i);

    if (!match) {
      return res.status(500).json({ error: "Failed to parse OpenAI response" });
    }

    const name = match[1].trim();
    const work = match[2].trim();

    res.status(200).json({ name, work });

  } catch (error) {
    console.error("Error generating citation:", error.response?.data || error.message || error);
    res.status(500).json({ error: "Error generating citation" });
  }
}
