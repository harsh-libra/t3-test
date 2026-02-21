"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import ModelSelector from "./ModelSelector";
import { MessageSquarePlus, Loader2, Menu, AlertTriangle, ArrowDown, Plus, Sparkles } from "lucide-react";
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
  const [showScrollButton, setShowScrollButton] = useState(false);

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
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle scroll to show/hide scroll-to-bottom button
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 300;
      setShowScrollButton(isScrolledUp);
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 md:px-8 py-4 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30 transition-all duration-300"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-center gap-3 md:gap-4">
          {/* Sidebar toggle for desktop */}
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
            <ModelSelector
              selectedProvider={selectedProvider}
              selectedModel={selectedModel}
              onSelect={handleModelSelect}
            />
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20 shadow-sm transition-all duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              Model: {selectedModel}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onNewChat}
            className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-sm font-medium bg-muted/50 text-foreground hover:bg-muted border border-border/50 hover:border-border transition-all active:scale-95 group"
            aria-label="New chat"
          >
            <Plus size={18} className="text-[var(--primary)] group-hover:rotate-90 transition-transform duration-300" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-full py-12 px-4">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-8 relative animate-scale-in"
              style={{ background: "var(--gradient-primary)" }}
            >
              {/* Soft glow behind icon */}
              <div
                className="absolute inset-0 rounded-3xl opacity-40 blur-2xl animate-pulse"
                style={{ background: "var(--gradient-primary)" }}
              />
              <MessageSquarePlus size={38} className="text-white relative z-10" />
            </div>
            
            <h2 className="text-3xl font-extrabold text-foreground mb-3 tracking-tight animate-fade-in-up animation-delay-150">
              T3 Chat
            </h2>
            <p className="text-muted-foreground max-w-md mb-10 leading-relaxed text-center animate-fade-in-up animation-delay-225">
              Your intelligent companion for brainstorming, coding, and learning. 
              Choose a model above to start.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl w-full animate-fade-in-up animation-delay-300 px-4 md:px-0">
              {[
                { title: "Explain", text: "quantum computing like I'm five", icon: "🔬", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
                { title: "Write", text: "a professional email to my boss", icon: "📧", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
                { title: "Analyze", text: "the pros and cons of remote work", icon: "📊", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
                { title: "Create", text: "a workout plan for beginners", icon: "💪", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
                { title: "Brainstorm", text: "creative names for my new startup", icon: "💡", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
                { title: "Summarize", text: "key points of the latest AI news", icon: "📝", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
              ].map((suggestion, i) => (
                <button
                  key={suggestion.text}
                  onClick={() => setInput(`${suggestion.title} ${suggestion.text}`)}
                  className={`group p-6 rounded-[2rem] border border-border bg-card text-card-foreground hover:bg-muted hover:border-[var(--primary)]/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-left flex flex-col gap-4 active:scale-[0.97] animate-fade-in-up`}
                  style={{ animationDelay: `${400 + (i * 50)}ms` }}
                >
                  <div className={`w-14 h-14 rounded-2xl ${suggestion.color} flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-md`}>
                    {suggestion.icon}
                  </div>
                  <div>
                    <span className="font-extrabold block text-lg group-hover:text-[var(--primary)] transition-colors mb-1">{suggestion.title}</span>
                    <span className="text-muted-foreground text-[0.8125rem] leading-relaxed line-clamp-2">{suggestion.text}</span>
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
                onRegenerate={reload}
                showRegenerate={
                  !isLoading &&
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
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-typing-dot" />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-typing-dot animation-delay-150" />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-typing-dot animation-delay-300" />
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

        {showScrollButton && (
          <div className="sticky bottom-4 right-0 left-0 flex justify-center pointer-events-none">
            <button
              onClick={() => scrollToBottom()}
              className="pointer-events-auto p-2.5 rounded-full bg-[var(--background)] border border-[var(--border)] shadow-xl text-[var(--foreground)] hover:bg-[var(--muted)] hover:scale-110 active:scale-90 transition-all z-20 animate-scale-in"
              aria-label="Scroll to bottom"
            >
              <ArrowDown size={18} />
            </button>
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
        provider={selectedProvider}
        model={selectedModel}
      />
    </div>
  );
}
