import type { NextApiRequest, NextApiResponse } from "next";
import { getProvider } from "@/lib/optimizedOpenAI";
import { SankeyData } from "@/app/types/types";
import {
  generateChatbotContext,
  formatContextForAI,
  ChatbotContext,
} from "@/lib/chatbotContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: Message[];
  dataSummary?: string; // Legacy support
  userId: string;
  month: string;
  // New: full data context
  data?: SankeyData;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages, dataSummary, userId, month, data }: ChatRequest = req.body;

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

    // Generate comprehensive context from data
    let context: ChatbotContext | null = null;
    let contextPrompt: string;

    if (data && data.nodes && data.links) {
      // Use full data context for comprehensive, grounded responses
      context = generateChatbotContext(data, month);
      contextPrompt = formatContextForAI(context);
    } else if (dataSummary) {
      // Fallback to legacy summary (less comprehensive)
      contextPrompt = `You are a helpful AI financial assistant for ${month}.\n\n${dataSummary}\n\nOnly use information from the data above. If you don't have specific data, say so.`;
    } else {
      return res.status(400).json({
        error: "Either 'data' or 'dataSummary' is required"
      });
    }

    // Build conversation history
    const conversationHistory = messages
      .slice(-6) // Keep last 6 messages (3 exchanges)
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    // Create enhanced system prompt with strict anti-hallucination instructions
    const systemPrompt = `${contextPrompt}

CONVERSATION GUIDELINES:
- Be conversational and friendly, but precise
- Always cite specific numbers from the data when discussing amounts
- If asked to compare, calculate based on the data provided
- If asked about trends, only mention what's visible in this month's data
- Format currency as $X.XX
- Use bullet points for lists
- Be concise but complete

FORBIDDEN:
- Do NOT make up transactions that aren't in the data
- Do NOT estimate or guess amounts
- Do NOT assume spending patterns without data
- Do NOT provide advice about future months
- Do NOT invent categories or merchants`;

    // Create user prompt with enhanced query handling
    const userPrompt = `${conversationHistory}

User's latest question: "${lastUserMessage.content}"

Instructions for your response:
1. First, identify what data is needed to answer this question
2. Search the provided data for that information
3. If the data exists, provide a specific, accurate answer with exact numbers
4. If the data doesn't exist, politely say you don't have that information
5. Suggest alternative questions the user could ask based on available data`;

    // Call the LLM provider with enhanced prompts
    const response = await provider.complete(userPrompt, systemPrompt);

    // Return response with metadata
    return res.status(200).json({
      message: response.content,
      usage: response.usage,
      metadata: context ? {
        totalTransactions: context.metadata.totalTransactions,
        totalSpend: context.metadata.totalSpend,
        categoriesCount: context.categories.length,
      } : undefined,
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
