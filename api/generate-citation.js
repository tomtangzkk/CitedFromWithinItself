import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  // ✅ 设置 CORS 允许所有来源访问（也可改为指定你的前端域名）
res.setHeader("Access-Control-Allow-Origin", "https://citation-generator-client-eb0blvtd7-tom-tangzks-projects.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ 处理 preflight 请求（浏览器用 OPTIONS 探测权限）
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ⬇️ 以下是你原来的 OpenAI 生成逻辑
  // ...
}


export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET requests allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("Missing OpenAI API Key");
    return res.status(500).json({ error: "Missing OpenAI API Key" });
  }

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Give me a fictional author's name and a book title about time and memory. Format: Name: ..., Work: ..."
        }
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const resultText = completion.data.choices[0]?.message?.content || "";

    if (!resultText) {
      console.error("OpenAI returned empty response");
      return res.status(500).json({ error: "Empty response from OpenAI" });
    }

    const match = resultText.match(/Name:\s*(.*),\s*Work:\s*(.*)/i);
    if (!match) {
      console.error("Failed to parse response:", resultText);
      return res.status(500).json({ error: "Failed to parse OpenAI response" });
    }

    const name = match[1].trim();
    const work = match[2].trim();

    res.status(200).json({ name, work });
    
  } catch (err) {
    console.error("Catch error:", err.response?.data || err.message || err);
    res.status(500).json({ error: "Server error", detail: err.response?.data || err.message });
  }
}
