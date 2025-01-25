import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Securely access API key from environment
});

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, style } = req.body;

    // Debug logs
    console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
    console.log('Received style:', style);
    console.log('Received text length:', text?.length);

    // Validate input
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

    const remixedText = completion.choices[0].message.content;
    return res.status(200).json({ remixedText });

  } catch (error) {
    // Detailed error logging
    console.error('Full error:', error);
    return res.status(500).json({ 
      error: 'Error processing your request',
      details: error.message
    });
  }
} 