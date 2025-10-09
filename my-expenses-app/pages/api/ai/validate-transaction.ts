import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

interface TransactionValidationRequest {
  transaction: string;
  amount: number;
  allTransactions: Array<{ name: string; cost?: number }>;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "OpenAI API key not configured",
      suggestion: null,
    });
  }

  try {
    const { transaction, amount, allTransactions } =
      req.body as TransactionValidationRequest;

    if (!transaction || !amount) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Calculate average transaction amount for context
    const avgAmount =
      allTransactions.reduce((sum, t) => sum + (t.cost || 0), 0) /
        allTransactions.length || 0;

    // System prompt for transaction validation
    const systemPrompt = `You are an AI financial assistant that validates transactions and provides helpful suggestions.

Analyze the transaction and determine if:
1. The amount seems unusually high or low compared to the merchant
2. It might be a duplicate transaction
3. The merchant name suggests it might be a subscription or recurring charge
4. The amount is significantly different from the user's average spending

Average transaction amount: $${avgAmount.toFixed(2)}

Provide a brief, actionable suggestion ONLY if there's something notable. If the transaction seems normal, respond with "OK".

Keep suggestions under 80 characters and friendly in tone.`;

    const userPrompt = `Transaction: ${transaction}
Amount: $${amount.toFixed(2)}

Is this transaction normal or does it need attention?`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    const suggestion = completion.choices[0]?.message?.content?.trim();

    // Only return suggestions if AI found something notable
    if (suggestion && suggestion.toLowerCase() !== "ok") {
      return res.status(200).json({
        suggestion,
        isNormal: false,
      });
    }

    return res.status(200).json({
      suggestion: null,
      isNormal: true,
    });
  } catch (error) {
    console.error("Error validating transaction:", error);

    return res.status(500).json({
      error: "Failed to validate transaction",
      suggestion: null,
    });
  }
};

export default handler;

