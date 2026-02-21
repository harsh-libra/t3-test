"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import ModelSelector from "./ModelSelector";
import {
  MessageSquarePlus,
  Loader2,
  Menu,
  AlertTriangle,
  Sparkles,
  Code,
  Lightbulb,
  Zap,
  RefreshCcw,
} from "lucide-react";
import type { Conversation } from "@/types";

interface ChatWindowProps {
  conversation: Conversation | null;
  onUpdateConversation?: (conversation: Conversation) => void;
  onNewChat?: () => void;
  onToggleSidebar?: () => void;
}

const DEFAULT_PROVIDER = "openai";
const DEFAULT_MODEL = "gpt-4o-mini";

const PROVIDER_KEY = "t3chat-provider";
const MODEL_KEY = "t3chat-model";

export default function ChatWindow({
  conversation,
  onUpdateConversation,
  onNewChat,
  onToggleSidebar,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Persist provider/model selection
  const [selectedProvider, setSelectedProvider] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(PROVIDER_KEY) || DEFAULT_PROVIDER;
    }
    return DEFAULT_PROVIDER;
  });
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(MODEL_KEY) || DEFAULT_MODEL;
    }
    return DEFAULT_MODEL;
  });

  const handleModelSelect = useCallback(
    (provider: string, model: string) => {
      setSelectedProvider(provider);
      setSelectedModel(model);
      if (typeof window !== "undefined") {
        localStorage.setItem(PROVIDER_KEY, provider);
        localStorage.setItem(MODEL_KEY, model);
      }
    },
    []
  );

  const {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    stop,
    setMessages,
    error,
    reload,
  } = useChat({
    api: "/api/chat",
    body: {
      provider: selectedProvider,
      model: selectedModel,
    },
    initialMessages:
      conversation?.messages?.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
      })) || [],
    onFinish: (message) => {
      // Save the conversation when the assistant finishes
      if (conversation && onUpdateConversation) {
        const updatedMessages = [
          ...messages,
          { id: message.id, role: message.role, content: message.content },
        ];
        onUpdateConversation({
          ...conversation,
          messages: updatedMessages.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          provider: selectedProvider,
          model: selectedModel,
          updatedAt: Date.now(),
          title:
            conversation.title === "New Chat" && updatedMessages.length > 0
              ? updatedMessages[0].content.slice(0, 50) +
                (updatedMessages[0].content.length > 50 ? "..." : "")
              : conversation.title,
        });
      }
    },
  });

  // Sync messages when conversation changes
  useEffect(() => {
    if (conversation) {
      const convMessages =
        conversation.messages?.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
        })) || [];
      setMessages(convMessages);
    } else {
      setMessages([]);
    }
  }, [conversation?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
      >
        <div className="flex items-center gap-2 md:gap-4">
          {/* Sidebar toggle for both mobile and desktop */}
          <button
            onClick={onToggleSidebar}
            className="flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} className="md:w-[18px] md:h-[18px]" />
          </button>
          <ModelSelector
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            onSelect={handleModelSelect}
          />
        </div>
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border transition-all"
          aria-label="New chat"
        >
          <MessageSquarePlus size={18} />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>

      {/* Messages area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 relative"
              style={{ background: "var(--gradient-primary)" }}
            >
              {/* Soft glow behind icon */}
              <div
                className="absolute inset-0 rounded-2xl opacity-30 blur-xl"
                style={{ background: "var(--gradient-primary)" }}
              />
              <MessageSquarePlus size={38} className="text-white relative z-10" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
              T3 Chat
            </h2>
            <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
              Start a conversation with any AI model. Select your preferred
              provider and model from the dropdown above.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg w-full">
              {[
                {
                  text: "Explain quantum computing",
                  icon: <Zap size={18} className="text-amber-500" />,
                },
                {
                  text: "Write a Python script",
                  icon: <Code size={18} className="text-blue-500" />,
                },
                {
                  text: "Help me brainstorm ideas",
                  icon: <Lightbulb size={18} className="text-emerald-500" />,
                },
              ].map((suggestion) => (
                <button
                  key={suggestion.text}
                  onClick={() => {
                    setInput(suggestion.text);
                  }}
                  className="p-4 rounded-xl border border-border bg-card text-card-foreground hover:bg-muted transition-all text-sm text-left hover:border-[var(--primary)]/30 group relative"
                  style={{ boxShadow: "var(--shadow-sm)" }}
                >
                  <div className="mb-3 p-2 rounded-lg bg-muted group-hover:bg-background transition-colors w-fit">
                    {suggestion.icon}
                  </div>
                  <span className="font-medium">{suggestion.text}</span>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles size={14} className="text-primary" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-[48rem] mx-auto py-6">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                role={message.role as "user" | "assistant"}
                content={message.content}
                isStreaming={
                  isLoading &&
                  index === messages.length - 1 &&
                  message.role === "assistant"
                }
              />
            ))}
            {isLoading &&
              messages.length > 0 &&
              messages[messages.length - 1].role === "user" && (
                <div className="flex gap-3.5 py-4 px-4 md:px-0 animate-slide-up">
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white mt-1"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <Sparkles size={18} className="animate-pulse" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-[var(--assistant-bubble)] px-5 py-3.5 border border-[var(--border)]/50 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce" />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            {error && (
              <div
                className="mx-4 md:mx-0 p-5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm animate-fade-in"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
                    <AlertTriangle size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-red-800 dark:text-red-300 mb-1">
                      Something went wrong
                    </p>
                    <p className="leading-relaxed mb-4 opacity-90">
                      {error.message ||
                        "An error occurred while communicating with the AI. This might be due to a rate limit or connection issue."}
                    </p>
                    <button
                      onClick={() => reload()}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 dark:bg-red-700 text-white font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors shadow-sm"
                    >
                      <RefreshCcw size={16} />
                      Retry Request
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Input area */}
      <ChatInput
        input={input}
        setInput={setInput}
        onSubmit={handleSubmit}
        onStop={stop}
        isLoading={isLoading}
      />
    </div>
  );
}
