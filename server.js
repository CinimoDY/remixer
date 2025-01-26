import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3001;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json());

app.post('/api/remix', async (req, res) => {
  try {
    const { text, style } = req.body;

    if (!text || !style) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful content remixing assistant."
        },
        {
          role: "user",
          content: `Rewrite the following text in a ${style} style: "${text}"`
        }
      ],
    });

    return res.json({ remixedText: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Error processing your request',
      details: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 