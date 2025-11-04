"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiSend, FiMessageCircle, FiX, FiMinimize2, FiRefreshCw } from "react-icons/fi";
import { SankeyData } from "@/app/types/types";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  userId: string;
  month: string;
  dataSummary: string;
  // New: full data context for comprehensive answers
  data?: SankeyData;
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  userId,
  month,
  dataSummary,
  data,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm your AI financial assistant with full access to your ${month} spending data. I can answer any question about your transactions, categories, amounts, and patterns. What would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          dataSummary,
          userId,
          month,
          // Send full data for comprehensive context
          data,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const responseData = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: responseData.message || "I'm sorry, I couldn't process that request.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "What did I spend the most on?",
    "List all transactions over $100",
    "What's my total spending?",
    "Which category has the most transactions?",
    "Show me all restaurant expenses",
    "What was my largest single purchase?",
  ];

  const handleResetChat = () => {
    setMessages([
      {
        role: "assistant",
        content: `Hi! I'm your AI financial assistant with full access to your ${month} spending data. I can answer any question about your transactions, categories, amounts, and patterns. What would you like to know?`,
        timestamp: new Date(),
      },
    ]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-text-primary shadow-lg transition-all hover:scale-110 hover:shadow-xl"
        aria-label="Open AI Assistant"
      >
        <FiMessageCircle size={24} />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl border border-border-secondary bg-background-primary shadow-2xl transition-all ${
        isMinimized ? "h-16 w-80" : "h-[600px] w-96"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-secondary bg-gradient-to-r from-primary-500 to-secondary-500 p-4">
        <div className="flex items-center gap-2">
          <FiMessageCircle size={20} className="text-text-primary" />
          <h3 className="font-semibold text-text-primary">AI Assistant</h3>
          {data && (
            <span className="text-xs text-text-primary/80">
              ({data.nodes.filter(n => n.isleaf).length} transactions)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetChat}
            className="rounded p-1 text-text-primary transition hover:bg-white/20"
            aria-label="Reset chat"
            title="Start new conversation"
          >
            <FiRefreshCw size={16} />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded p-1 text-text-primary transition hover:bg-white/20"
            aria-label="Minimize"
          >
            <FiMinimize2 size={18} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded p-1 text-text-primary transition hover:bg-white/20"
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-text-primary"
                      : "bg-background-secondary text-slate-100"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className="mt-1 text-xs opacity-60">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-background-secondary px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary-500" />
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-secondary-500"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-accent-500"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                    <span className="text-xs text-text-tertiary">
                      AI is thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="border-t border-border-secondary bg-background-secondary/50 p-3">
              <p className="mb-2 text-xs font-medium text-text-tertiary">
                Try asking:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(question)}
                    className="rounded-full border border-border-primary bg-background-secondary px-3 py-1 text-xs text-text-secondary transition hover:border-primary-500 hover:bg-background-tertiary"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border-secondary bg-background-secondary p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your expenses..."
                className="flex-1 rounded-lg border border-border-primary bg-background-primary px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 text-text-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                {isLoading ? (
                  <div className="relative">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <FiSend size={18} />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIAssistant;
