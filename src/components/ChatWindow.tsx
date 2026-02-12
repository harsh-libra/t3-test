"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import ModelSelector from "./ModelSelector";
import { MessageSquarePlus, Loader2, Menu } from "lucide-react";
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
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          {/* Sidebar toggle for desktop */}
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>
          <ModelSelector
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            onSelect={handleModelSelect}
          />
        </div>
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
              <MessageSquarePlus size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              T3 Chat
            </h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Start a conversation with any AI model. Select your preferred
              provider and model from the dropdown above.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg">
              {[
                { text: "Explain quantum computing", icon: "🔬" },
                { text: "Write a Python script", icon: "🐍" },
                { text: "Help me brainstorm ideas", icon: "💡" },
              ].map((suggestion) => (
                <button
                  key={suggestion.text}
                  onClick={() => {
                    setInput(suggestion.text);
                  }}
                  className="p-3 rounded-xl border border-border bg-card text-card-foreground hover:bg-muted transition-colors text-sm text-left"
                >
                  <span className="text-lg mb-1 block">
                    {suggestion.icon}
                  </span>
                  {suggestion.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto py-4">
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
                <div className="flex gap-3 py-4 px-4 md:px-0">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary text-white mt-1">
                    <Loader2 size={18} className="animate-spin" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md bg-assistant-bubble px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                      <span
                        className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            {error && (
              <div className="mx-4 md:mx-0 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                <p className="font-medium">Error</p>
                <p>
                  {error.message ||
                    "Something went wrong. Please try again."}
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
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
