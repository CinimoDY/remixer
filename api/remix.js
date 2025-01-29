import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.openai.com/v1'
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

const linkedinFromPostPrompt = `
You are a social media expert and ghostwriter specializing in LinkedIn content.

Your job is to take a piece of content and transform it into multiple LinkedIn posts that will engage a professional audience.

Since you are a ghostwriter, you need to make sure to follow the style, tone, and voice of the original content as closely as possible.

Remember:
- LinkedIn posts should be professional but conversational
- Each post should be between 100-1300 characters
- Focus on providing value and insights
- Include a clear call to action when appropriate
- Break up text into readable paragraphs

Please return the posts in a numbered format like this:
1. First LinkedIn post here

2. Second LinkedIn post here

3. Third LinkedIn post here

Be sure to include at least three posts.
Do not use hashtags or emojis.
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
    const { text, contentType = 'twitter' } = req.body;

    // Add more detailed logging
    console.log('Request received:', { textLength: text?.length, contentType });
    console.log('API Key present:', !!process.env.OPENAI_API_KEY);

    // Validate input
    if (!text) {
      return res.status(400).json({ error: 'Missing required text field' });
    }

    const prompt = contentType === 'linkedin' ? linkedinFromPostPrompt : tweetFromPostPrompt;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: prompt
        },
        {
          role: "user",
          content: text
        }
      ],
    });

    return res.status(200).json({ 
      remixedText: completion.choices[0].message.content,
      contentType 
    });
  } catch (error) {
    console.error('Detailed error:', error);
    return res.status(500).json({ 
      error: 'Error processing your request',
      details: error.message 
    });
  }
} 