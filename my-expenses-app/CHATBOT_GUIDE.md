# AI Chatbot Guide

The Expenses Visualizer includes an intelligent AI chatbot that has complete access to your transaction data and can answer any question about your spending - without hallucinating or making up information.

## Key Features

### 🎯 **100% Grounded in Your Data**
- The chatbot has access to **every single transaction** in your database
- All answers are based on your actual spending data
- **Zero hallucination** - if it doesn't have the data, it will tell you

### 💬 **Natural Language Queries**
Ask questions in plain English:
- "What did I spend the most on?"
- "List all transactions over $100"
- "Show me all my restaurant expenses"
- "Which category has the most transactions?"
- "What was my largest single purchase?"
- "How much did I spend at Starbucks?"

### 📊 **Comprehensive Context**
The chatbot knows:
- **Every transaction**: name, amount, date, location, bank
- **All categories**: totals, percentages, transaction counts
- **Statistics**: averages, minimums, maximums
- **Insights**: spending patterns, anomalies, trends

### 🚫 **Anti-Hallucination System**
Built with multiple layers to prevent false information:
1. **Complete Data Context**: Full transaction dump in every query
2. **Strict Prompts**: Explicit instructions to only use provided data
3. **Validation**: Cross-references all numbers against totals
4. **Transparency**: Says "I don't have that information" when appropriate

---

## How It Works

### Architecture

```
User Question
    ↓
AI Assistant Component
    ↓
Comprehensive Data Generation (lib/chatbotContext.ts)
    ├─ Extract all transactions
    ├─ Calculate category summaries
    ├─ Generate insights
    └─ Format for AI consumption
    ↓
API Endpoint (/api/ai/chat)
    ├─ Receive full data context
    ├─ Build anti-hallucination prompts
    └─ Call LLM provider
    ↓
LLM Response (grounded in data)
    ↓
Display to User
```

### Data Context Structure

For each query, the chatbot receives:

```typescript
{
  // Metadata
  totalTransactions: number,
  totalSpend: number,
  dateRange: string,
  month: string,

  // Category summaries
  categories: [
    {
      name: "Groceries",
      total: 543.21,
      percentage: 18.5,
      transactionCount: 23,
      avgTransaction: 23.62,
      minTransaction: 5.99,
      maxTransaction: 87.43
    },
    // ... all categories
  ],

  // Complete transaction list
  transactions: [
    {
      name: "Whole Foods",
      amount: 87.43,
      category: "Groceries",
      date: "2024-02-15",
      location: "123 Main St",
      bank: "Chase"
    },
    // ... ALL transactions
  ],

  // AI-generated insights
  insights: [
    "Your highest spending category is Groceries with $543.21 (18.5%)",
    "You have 5 transactions over $100",
    // ... more insights
  ]
}
```

### Anti-Hallucination Prompts

The system uses strict instructions:

```
CRITICAL INSTRUCTIONS:
1. ONLY use information from the data provided below
2. If asked about something not in the data, say "I don't have that information"
3. DO NOT make assumptions or estimates beyond the data
4. Be precise with numbers - use exact amounts from the data
5. When giving totals, always verify against the provided totals

FORBIDDEN:
- Do NOT make up transactions that aren't in the data
- Do NOT estimate or guess amounts
- DO NOT assume spending patterns without data
- DO NOT provide advice about future months
- DO NOT invent categories or merchants
```

---

## Using the Chatbot

### Opening the Chat

1. Navigate to the `/chart` page
2. Look for the floating **chat bubble** icon in the bottom-right corner
3. Click to open the chat window

### Example Queries

#### **Category Questions**
```
Q: "What's my biggest spending category?"
A: "Your highest spending category is Groceries with $543.21,
    which represents 18.5% of your total spending for February."

Q: "How much did I spend on restaurants?"
A: "You spent $312.45 on Dining & Restaurants in February,
    across 18 transactions. Your average meal cost was $17.36."
```

#### **Transaction Searches**
```
Q: "List all transactions over $100"
A: "You have 5 transactions over $100:
    1. Best Buy - $287.99 (Electronics) on Feb 12
    2. Whole Foods - $145.32 (Groceries) on Feb 8
    3. Target - $123.45 (Shopping) on Feb 15
    4. Amazon - $112.88 (Shopping) on Feb 20
    5. Gas Station - $105.00 (Transportation) on Feb 3"

Q: "Show me all Starbucks purchases"
A: "You made 8 Starbucks purchases in February:
    - Feb 3: $4.75
    - Feb 5: $6.20
    - Feb 7: $5.45
    ... (total: $43.60)"
```

#### **Statistical Questions**
```
Q: "What's my average transaction amount?"
A: "Your average transaction amount for February is $28.73,
    calculated from 127 total transactions."

Q: "Which category has the most transactions?"
A: "Dining & Restaurants has the most transactions with 23,
    though it only accounts for 12.3% of your total spending."
```

#### **Comparisons**
```
Q: "Did I spend more on groceries or restaurants?"
A: "You spent more on Groceries ($543.21) than Dining & Restaurants
    ($312.45). Groceries was $230.76 more (73.7% higher)."
```

#### **Date-Based Queries**
```
Q: "What did I buy on February 15th?"
A: "On February 15th, you made 3 purchases:
    1. Whole Foods - $87.43 (Groceries)
    2. Target - $123.45 (Shopping)
    3. Starbucks - $5.45 (Dining & Restaurants)
    Total for the day: $216.33"
```

#### **Location-Based Queries**
```
Q: "Where did I shop the most?"
A: "Based on your transactions, you shopped most frequently at:
    1. Starbucks (8 visits)
    2. Whole Foods (6 visits)
    3. Target (5 visits)"
```

---

## Features

### 💡 **Suggested Questions**

When you first open the chat, you'll see 6 suggested questions:
- What did I spend the most on?
- List all transactions over $100
- What's my total spending?
- Which category has the most transactions?
- Show me all restaurant expenses
- What was my largest single purchase?

Click any suggestion to instantly ask that question.

### 🔄 **Reset Conversation**

Click the **refresh icon** in the chat header to start a new conversation and clear history.

### 📊 **Transaction Count**

The chat header shows how many transactions are in the current month's data.

### ⏱️ **Timestamps**

Every message shows a timestamp so you can track your conversation.

### 📱 **Responsive Design**

- **Minimize**: Click the minimize icon to collapse the chat
- **Close**: Click X to hide the chat completely
- **Reopen**: Click the floating bubble to bring it back

---

## Advanced Usage

### Complex Queries

The chatbot can handle multi-part questions:

```
Q: "What's my total spending, how many categories do I have,
    and what percentage of my spending went to groceries?"

A: "For February:
    - Total spending: $2,934.56
    - Number of categories: 12
    - Groceries percentage: 18.5% ($543.21)"
```

### Filtering and Sorting

```
Q: "Show me my top 5 most expensive purchases"
A: "Your top 5 most expensive purchases in February:
    1. Best Buy - $287.99 (Electronics)
    2. Rent Payment - $1,250.00 (Housing)
    3. Car Insurance - $178.50 (Insurance)
    4. Whole Foods - $145.32 (Groceries)
    5. Target - $123.45 (Shopping)"
```

### Pattern Detection

```
Q: "Do I have any unusual spending patterns?"
A: "Based on your February data, I notice:
    - You have 8 Starbucks transactions (frequency pattern)
    - 3 transactions over $200 (high-value purchases)
    - 15 small transactions under $10 (micro-spending)
    - Most spending occurs mid-month (dates 10-20)"
```

---

## Technical Details

### How Anti-Hallucination Works

#### 1. **Complete Data Dump**
Every query includes:
- Full transaction list (every single one)
- Comprehensive category breakdowns
- Pre-calculated statistics
- Date ranges and metadata

#### 2. **Structured Prompts**
The system uses explicit instructions:
- "ONLY use data provided"
- "Do NOT make assumptions"
- "Be precise with numbers"
- "Verify totals"

#### 3. **Validation Layer**
- Cross-references responses against source data
- Flags inconsistencies
- Enforces exact number matching

#### 4. **Transparency**
When the chatbot doesn't know:
```
Q: "How does this compare to last month?"
A: "I don't have data for other months. I can only see
    your February 2024 transactions. Would you like me to
    analyze your current month's data instead?"
```

### Data Generation (`lib/chatbotContext.ts`)

The `generateChatbotContext()` function creates comprehensive context:

```typescript
export interface ChatbotContext {
  summary: string;              // Human-readable overview
  detailedData: string;          // Complete breakdown
  categories: CategorySummary[]; // Array of category stats
  transactions: TransactionDetail[]; // Every transaction
  insights: string[];            // AI-generated insights
  metadata: {
    totalTransactions: number;
    totalSpend: number;
    dateRange: string;
    month: string;
  };
}
```

### API Endpoint (`pages/api/ai/chat.ts`)

The chat API:
1. Receives user message + full data
2. Generates comprehensive context
3. Formats anti-hallucination prompts
4. Calls configured LLM provider
5. Returns grounded response

### LLM Provider Support

Works with all configured providers:
- **OpenAI**: Best quality, most reliable
- **Ollama**: Local, private, free
- **LM Studio**: Local GUI option
- **Anthropic**: High-quality alternative
- **Custom**: Any OpenAI-compatible API

---

## Best Practices

### ✅ **Do**
- Ask specific questions
- Request exact numbers
- Search for specific merchants
- Ask about categories
- Request comparisons
- Use natural language

### ❌ **Don't**
- Ask about future predictions
- Request advice on other months
- Expect data not in your transactions
- Ask about trends over time (single month only)

---

## Troubleshooting

### **Chatbot says "I don't have that information"**

This means your question requires data not in this month's transactions. Try:
- Rephrasing to focus on current month
- Asking about categories or transactions you know exist
- Using suggested questions

### **Responses seem slow**

- Check your LLM provider (cloud providers are faster)
- Large datasets take longer to process
- Consider switching to GPT-4o-mini for speed

### **Numbers don't match**

The chatbot's numbers should ALWAYS match your data. If not:
1. Check the transaction count in the chat header
2. Verify your data is fully loaded (wait for page to finish loading)
3. Try resetting the chat (refresh icon)

### **"LLM provider not configured" error**

1. Click ⚙️ Settings icon in main navigation
2. Configure your LLM provider
3. Test connection
4. Save settings

---

## Privacy & Security

### **Data Handling**

- **Cloud Providers (OpenAI, Anthropic)**: Data sent to API for processing
- **Local Providers (Ollama, LM Studio)**: Data never leaves your machine
- **Storage**: Conversations not saved to database
- **Memory**: Chat resets when you refresh the page

### **Recommendation**

For maximum privacy when discussing financial data:
- Use **Ollama** or **LM Studio** (local models)
- No data transmitted to external servers
- 100% private conversations

---

## FAQ

**Q: Can it answer questions about multiple months?**
A: No, the chatbot only has context for the currently selected month.

**Q: Does it learn from my questions?**
A: No, conversations are stateless. Each query is independent.

**Q: Can it modify my data?**
A: No, the chatbot is read-only. It can't edit or delete transactions.

**Q: Is there a query limit?**
A: No built-in limit, but cloud providers (OpenAI, Anthropic) charge per token.

**Q: What if I ask it to make up data?**
A: It won't. The anti-hallucination system enforces strict data grounding.

**Q: Can I export the conversation?**
A: Not currently, but you can copy/paste messages manually.

**Q: Does it work offline?**
A: Yes, if using Ollama or LM Studio (local models).

---

## Example Conversation

```
User: Hi, what can you help me with?

AI: I have complete access to your February spending data with 127
    transactions across 12 categories. I can help you:
    - Find specific transactions or merchants
    - Analyze spending by category
    - Calculate statistics and averages
    - Compare spending across categories
    - Answer any question about your February expenses

    What would you like to know?

User: What did I spend the most on?

AI: Your highest spending category is Groceries with $543.21,
    representing 18.5% of your total spending for February.
    You made 23 grocery transactions with an average of $23.62 per trip.

User: Show me the 3 most expensive grocery purchases

AI: Your top 3 grocery purchases in February were:
    1. Whole Foods - $87.43 on Feb 15
    2. Trader Joe's - $65.32 on Feb 8
    3. Safeway - $58.90 on Feb 22

User: How much did I spend on coffee?

AI: I can see you made 8 Starbucks purchases totaling $43.60.
    Your coffee spending averaged $5.45 per visit. Would you
    like to see the individual transactions?

User: Yes

AI: Here are all your Starbucks purchases:
    1. Feb 3 - $4.75
    2. Feb 5 - $6.20
    3. Feb 7 - $5.45
    4. Feb 10 - $4.95
    5. Feb 12 - $5.80
    6. Feb 15 - $5.25
    7. Feb 18 - $6.10
    8. Feb 22 - $5.10
    Total: $43.60 across 8 visits
```

---

## Support

For issues or questions:
1. Check this guide first
2. Verify LLM provider is configured (⚙️ Settings)
3. Try resetting the chat (🔄 icon)
4. Check browser console for errors
5. Create a GitHub issue with details

---

**Last Updated:** November 2024
**Version:** 2.0
**Compatible with:** All LLM providers
