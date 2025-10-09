import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "OpenAI API key not configured",
      message: "Please add your OpenAI API key to the .env.local file",
    });
  }

  try {
    const { messages, dataSummary, month } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // System prompt for the AI assistant
    const systemPrompt = `You are a helpful AI financial assistant for a personal expenses tracking app. 
You help users understand their spending patterns, provide insights, and offer personalized financial advice.

Current Month: ${month || "Unknown"}

${dataSummary || "No financial data available yet."}

Guidelines:
- Be concise, friendly, and encouraging
- Provide specific, actionable insights based on the data
- Use dollar amounts when relevant
- Highlight both concerns and positive patterns
- Offer practical tips for saving money
- If asked about specific transactions, reference the data summary
- Format your responses clearly with line breaks when listing items
- Keep responses under 150 words unless detailed analysis is requested`;

    // Prepare messages for OpenAI
    const openaiMessages: Message[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })),
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages:
        openaiMessages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = completion.choices[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error("No response from OpenAI");
    }

    return res.status(200).json({
      message: assistantMessage,
      usage: completion.usage,
    });
  } catch (error) {
    console.error("Error in AI chat:", error);

    if (error instanceof Error) {
      return res.status(500).json({
        error: "Failed to process AI request",
        details: error.message,
      });
    }

    return res.status(500).json({
      error: "An unexpected error occurred",
    });
  }
};

export default handler;
