import express from "express";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.get("/generate-citation", async (req, res) => {
  try {
    const prompt = `Generate a fictional citation consisting of an author's name and a book title related to time, reading, or memory. Respond in this format:
Name: [Author Name], Work: [Book Title]`;

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.data.choices[0].message.content;
    const match = text.match(/Name:\s*(.*),\s*Work:\s*(.*)/i);
    const name = match ? match[1].trim() : "Unknown";
    const work = match ? match[2].trim() : "Untitled";

    res.json({ name, work });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to generate citation.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
