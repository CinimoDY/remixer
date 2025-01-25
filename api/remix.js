import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { text, style } = req.body;

  try {
    const prompt = getPromptForStyle(style, text);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful content remixing assistant."
        },
        {
          role: "user",
          content: prompt
        }
      ],
    });

    const remixedText = completion.choices[0].message.content;
    res.status(200).json({ remixedText });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
}

function getPromptForStyle(style, text) {
  const prompts = {
    professional: `Rewrite the following text in a professional, business-friendly tone: "${text}"`,
    casual: `Rewrite the following text in a casual, conversational tone: "${text}"`,
    funny: `Rewrite the following text in a humorous way: "${text}"`,
  };
  return prompts[style] || prompts.professional;
} 