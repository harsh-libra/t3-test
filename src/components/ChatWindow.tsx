"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import ModelSelector from "./ModelSelector";
import { MessageSquarePlus, Loader2, Menu, AlertTriangle, MessageCircle, ChevronDown } from "lucide-react";
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
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);

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

  // Scroll-to-bottom button visibility
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 200);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 md:px-6 py-3.5 border-b border-border bg-background"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
      >
        <div className="flex items-center gap-4">
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
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border transition-all"
          aria-label="New chat"
        >
          <MessageSquarePlus size={18} />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 relative overflow-hidden">
      <div ref={scrollContainerRef} className="h-full overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-16">
            <div className="max-w-2xl mx-auto w-full flex flex-col items-center">
              {/* Logo treatment: stacked gradient circles with ping ring */}
              <div className="relative flex items-center justify-center mb-8">
                {/* Animated ping ring */}
                <span
                  className="absolute inline-flex rounded-full opacity-20 animate-ping"
                  style={{
                    width: "88px",
                    height: "88px",
                    background: "var(--gradient-primary)",
                  }}
                />
                {/* Outer circle */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center relative"
                  style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-md)" }}
                >
                  {/* Inner circle */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.20)" }}
                  >
                    <MessageCircle size={26} className="text-white" fill="white" />
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                How can I help you today?
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-10 leading-relaxed">
                Select a suggestion below or type anything to get started.
              </p>

              {/* 2×3 suggestion grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                {[
                  { icon: "🔬", text: "Explain a concept", desc: "Break down any topic simply" },
                  { icon: "🐍", text: "Write code", desc: "Generate scripts in any language" },
                  { icon: "💡", text: "Brainstorm ideas", desc: "Explore creative directions" },
                  { icon: "🐛", text: "Debug my code", desc: "Paste code and get fixes fast" },
                  { icon: "✍️", text: "Draft a message", desc: "Emails, docs, and more" },
                  { icon: "📊", text: "Analyze data", desc: "Interpret results & trends" },
                ].map((suggestion) => (
                  <button
                    key={suggestion.text}
                    onClick={() => {
                      setInput(suggestion.text);
                      setTimeout(() => {
                        document.querySelector("textarea")?.focus();
                      }, 0);
                    }}
                    className="p-4 rounded-xl border border-border bg-card text-card-foreground text-left transition-all duration-200 ring-1 ring-[var(--primary)]/20 hover:ring-[var(--primary)]/60 hover:bg-muted"
                    style={{ boxShadow: "var(--shadow-sm)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-md)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-sm)";
                    }}
                  >
                    <span className="block mb-2" style={{ fontSize: "1.5rem" }}>
                      {suggestion.icon}
                    </span>
                    <span className="block font-semibold text-sm text-foreground mb-0.5">
                      {suggestion.text}
                    </span>
                    <span className="block text-xs text-muted-foreground leading-snug">
                      {suggestion.desc}
                    </span>
                  </button>
                ))}
              </div>
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
                <div className="flex gap-3.5 py-5 px-4 md:px-0">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-primary text-white mt-1">
                    <Loader2 size={18} className="animate-spin" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md bg-assistant-bubble px-5 py-3.5 border border-[var(--border)]/50">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/60 animate-bounce" />
                      <span
                        className="w-2.5 h-2.5 rounded-full bg-muted-foreground/60 animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full bg-muted-foreground/60 animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            {error && (
              <div
                className="mx-4 md:mx-0 p-5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">Error</p>
                    <p className="leading-relaxed">
                      {error.message ||
                        "Something went wrong. Please try again."}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>
      {showScrollButton && (
        <button
          onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="absolute bottom-4 right-4 z-10 p-2.5 rounded-full bg-[var(--primary)] text-white shadow-lg hover:opacity-90 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
          aria-label="Scroll to bottom"
        >
          <ChevronDown size={20} />
        </button>
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
