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

    // Add system instruction for proper code formatting
    const enhancedPrompt = `${prompt}

CRITICAL FORMATTING REQUIREMENTS:
- When writing Python code, use EXACTLY 4 spaces for each level of indentation
- Functions, classes, if statements, loops, etc. must be properly indented
- Never use tabs, only spaces for indentation
- Each nested block should be indented 4 more spaces than its parent
- Example of correct Python indentation:
def example_function():
    if condition:
        for item in items:
            print(item)
            if nested_condition:
                do_something()

Please ensure all code follows proper indentation standards for the respective programming language.`;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ text });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}