import type { NextApiRequest, NextApiResponse } from "next";
import { getProvider } from "@/lib/optimizedOpenAI";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: Message[];
  dataSummary: string;
  userId: string;
  month: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages, dataSummary, userId, month }: ChatRequest = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages are required" });
    }

    // Get the LLM provider (will use configured provider or default)
    const provider = getProvider();

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage.role !== "user") {
      return res.status(400).json({ error: "Last message must be from user" });
    }

    // Build conversation history for context
    const conversationContext = messages
      .slice(-5) // Only keep last 5 messages for context
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    // Create system prompt with data context
    const systemPrompt = `You are a helpful AI financial assistant helping users understand their spending data for ${month}.

Here is the user's spending data summary:
${dataSummary}

Provide helpful, accurate insights about their spending. Be concise and friendly.
If they ask about specific categories or amounts, reference the data above.
If you don't have specific data to answer a question, be honest about it.`;

    // Create user prompt with conversation history
    const userPrompt = `Previous conversation:
${conversationContext}

Please respond to the user's latest question: "${lastUserMessage.content}"`;

    // Call the LLM provider
    const response = await provider.complete(userPrompt, systemPrompt);

    return res.status(200).json({
      message: response.content,
      usage: response.usage,
    });
  } catch (error) {
    console.error("Error in AI chat:", error);

    // Check if it's a configuration error
    if (
      error instanceof Error &&
      (error.message.includes("OPENAI_KEY") ||
        error.message.includes("environment variable") ||
        error.message.includes("LLM_PROVIDER"))
    ) {
      return res.status(500).json({
        error:
          "LLM provider not configured. Please set up your LLM provider in settings.",
        configError: true,
      });
    }

    return res.status(500).json({
      error: "Failed to process chat request",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
