"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { Send, Square, ArrowUp } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onStop?: () => void;
  isLoading: boolean;
  placeholder?: string;
  provider?: string;
  model?: string;
}

export default function ChatInput({
  input,
  setInput,
  onSubmit,
  onStop,
  isLoading,
  placeholder = "Message T3 Chat...",
  provider,
  model,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [input, adjustHeight]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send, Shift+Enter for newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        onSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  return (
    <div className="px-4 py-4 md:px-6 sticky bottom-0 z-30">
      {/* Fade overlay */}
      <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none -z-10" />
      
      <form
        onSubmit={onSubmit}
        className="max-w-3xl mx-auto relative"
      >
        <div className="relative group/input rounded-2xl border border-border/80 bg-card shadow-lg focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 focus-within:shadow-xl transition-all duration-200">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={isLoading}
            className="w-full resize-none rounded-2xl bg-transparent py-4 pl-4 pr-14 text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-[0.9375rem]"
            style={{
              minHeight: "56px",
              maxHeight: "200px",
            }}
          />
          
          {/* Send button - inside the input */}
          <div className="absolute right-2 bottom-2">
            {isLoading ? (
              <button
                type="button"
                onClick={onStop}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-destructive text-white hover:bg-destructive/90 active:scale-90 transition-all duration-200"
                aria-label="Stop generating"
              >
                <Square size={14} className="fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-90 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-primary"
                aria-label="Send message"
              >
                <ArrowUp size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground/60 mt-2 font-medium">
          Enter to send · Shift+Enter for new line
        </p>
      </form>
    </div>
  );
}
