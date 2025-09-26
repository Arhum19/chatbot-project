import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;
    
    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Enhance prompt for better responses
    const enhancedPrompt = `${prompt}

RESPONSE GUIDELINES:
- Answer questions naturally and conversationally
- Only provide code if the user specifically asks for programming help
- When providing code, ensure proper formatting and indentation:
  * Python: Use 4 spaces for indentation
  * JavaScript: Use 2 spaces for indentation  
  * Other languages: Follow their standard conventions
- For general questions, provide helpful text answers without code
- Be concise and relevant to the user's question`;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ text });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}