import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.openai.com/v1' // Add explicit base URL
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

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

    // Add more detailed logging
    console.log('Request received:', { textLength: text?.length });
    console.log('API Key present:', !!process.env.OPENAI_API_KEY);

    // Validate input
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

    return res.status(200).json({ remixedText: completion.choices[0].message.content });
  } catch (error) {
    console.error('Detailed error:', error);
    return res.status(500).json({ 
      error: 'Error processing your request',
      details: error.message 
    });
  }
} 