import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3001;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const tweetFromPostPrompt = `
You are a social media expert and ghostwriter.

You work for a popular blogger, and your job is to take their blog post and come up with a variety of tweets to share ideas from the post.

Since you are a ghostwriter, you need to make sure to follow the style, tone, and voice of the blog post as closely as possible.

Remember: Tweets cannot be longer than 280 characters.

Please return the tweets in a numbered format like this:
1. First tweet here
2. Second tweet here
3. Third tweet here

Be sure to include at least five tweets.

Do not use any hashtags or emojis.
`;

app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')));

app.post('/api/remix', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Missing required text field' });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: tweetFromPostPrompt
        },
        {
          role: "user",
          content: text
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

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 