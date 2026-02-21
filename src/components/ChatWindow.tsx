"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import ModelSelector from "./ModelSelector";
import { useToast } from "./Toast";
import { MessageSquarePlus, Loader2, Menu, AlertTriangle, ArrowDown, Plus, Sparkles, Wand2, Code2, BookOpen, Lightbulb, PenLine, BarChart3 } from "lucide-react";
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
  const { addToast } = useToast();

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
        // Ensure we don't duplicate the last message if it's already in the messages array
        const messageExists = messages.some((m) => m.id === message.id);
        const finalMessages = messageExists
          ? messages.map((m) => (m.id === message.id ? message : m))
          : [...messages, message];

        onUpdateConversation({
          ...conversation,
          messages: finalMessages.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          provider: selectedProvider,
          model: selectedModel,
          updatedAt: Date.now(),
          title:
            conversation.title === "New Chat" && finalMessages.length > 0
              ? finalMessages[0].content.slice(0, 50) +
                (finalMessages[0].content.length > 50 ? "..." : "")
              : conversation.title,
        });
      }
    },
    onResponse: () => {
      // Save conversation when the response starts (to persist the user message)
      if (conversation && onUpdateConversation) {
        onUpdateConversation({
          ...conversation,
          messages: messages.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          updatedAt: Date.now(),
        });
      }
    },
    onError: (err) => {
      addToast({
        type: "error",
        message: err.message || "Failed to get response from AI",
      });
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

  const suggestions = [
    { title: "Explain", text: "quantum computing like I'm five", icon: Lightbulb, color: "from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400", iconBg: "bg-blue-500/10" },
    { title: "Write", text: "a professional email to my boss", icon: PenLine, color: "from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400", iconBg: "bg-violet-500/10" },
    { title: "Analyze", text: "the pros and cons of remote work", icon: BarChart3, color: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400", iconBg: "bg-amber-500/10" },
    { title: "Create", text: "a workout plan for beginners", icon: Wand2, color: "from-emerald-500/10 to-green-500/10 text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-500/10" },
    { title: "Debug", text: "this React component for me", icon: Code2, color: "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400", iconBg: "bg-rose-500/10" },
    { title: "Summarize", text: "key points of the latest AI news", icon: BookOpen, color: "from-indigo-500/10 to-blue-500/10 text-indigo-600 dark:text-indigo-400", iconBg: "bg-indigo-500/10" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 md:px-6 h-[60px] border-b border-border/60 bg-background/80 backdrop-blur-xl sticky top-0 z-30 transition-all duration-200"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-center gap-2 md:gap-3">
          {/* Sidebar toggle for desktop */}
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200 active:scale-95"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>
          
          <ModelSelector
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            onSelect={handleModelSelect}
          />
          
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/8 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold uppercase tracking-wider border border-emerald-500/15">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ready
          </div>
        </div>
        
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border/50 hover:border-border transition-all duration-200 active:scale-95 group"
          aria-label="New chat"
        >
          <Plus size={16} className="text-primary group-hover:rotate-90 transition-transform duration-300" />
          <span className="hidden sm:inline">New</span>
        </button>
      </header>

      {/* Messages area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-full py-16 px-4">
            {/* Hero icon with glow */}
            <div className="relative mb-8 animate-slide-up">
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center relative z-10 animate-float"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Sparkles size={32} className="text-white md:w-9 md:h-9" />
              </div>
              {/* Glow */}
              <div
                className="absolute inset-0 rounded-3xl opacity-30 blur-2xl scale-150"
                style={{ background: "var(--gradient-primary)" }}
              />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 tracking-tight animate-slide-up animation-delay-75">
              How can I help?
            </h2>
            <p className="text-muted-foreground max-w-sm mb-10 leading-relaxed text-center text-sm animate-slide-up animation-delay-150">
              Start a conversation or pick a suggestion below
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl w-full px-2 md:px-0">
              {suggestions.map((suggestion, i) => {
                const Icon = suggestion.icon;
                return (
                  <button
                    key={suggestion.title}
                    onClick={() => setInput(`${suggestion.title} ${suggestion.text}`)}
                    className="group p-4 md:p-5 rounded-2xl border border-border/60 bg-card hover:bg-muted/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300 text-left flex items-start gap-3.5 active:scale-[0.98] animate-slide-up"
                    style={{ animationDelay: `${200 + (i * 60)}ms` }}
                  >
                    <div className={`w-10 h-10 rounded-xl ${suggestion.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={18} className={suggestion.color.split(' ').slice(-2).join(' ')} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold block text-sm text-foreground group-hover:text-primary transition-colors duration-200">{suggestion.title}</span>
                      <span className="text-muted-foreground text-xs leading-relaxed line-clamp-2 mt-0.5">{suggestion.text}</span>
                    </div>
                  </button>
                );
              })}
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
                <div className="flex gap-3 py-5 px-4 md:px-0 animate-fade-in">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center bg-primary/10 text-primary mt-1">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                  <div className="rounded-2xl rounded-tl-md bg-card px-4 py-3 border border-border/60">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-typing-dot" />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-typing-dot animation-delay-150" />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-typing-dot animation-delay-300" />
                    </div>
                  </div>
                </div>
              )}
            {error && (
              <div
                className="mx-4 md:mx-0 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm animate-fade-in"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-0.5 text-sm">Something went wrong</p>
                    <p className="leading-relaxed text-xs opacity-90">
                      {error.message ||
                        "Please try again or switch to a different model."}
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
              className="pointer-events-auto p-2 rounded-full bg-card border border-border shadow-lg text-foreground hover:bg-muted active:scale-90 transition-all z-20 animate-scale-in"
              aria-label="Scroll to bottom"
            >
              <ArrowDown size={16} />
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
