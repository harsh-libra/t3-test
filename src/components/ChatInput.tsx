"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { Send, Square, Sparkles } from "lucide-react";
import { ProviderIcon } from "./ModelSelector";

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
  placeholder = "Send a message...",
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
    <div
      className="px-4 py-6 md:px-6 transition-all duration-300 sticky bottom-0 z-30 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent"
    >
      <form
        onSubmit={onSubmit}
        className="max-w-[52rem] mx-auto flex items-end gap-3 relative"
      >
        <div className="flex-1 relative group/input shadow-2xl shadow-indigo-500/10 rounded-[2rem]">
          {provider && (
            <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 group-focus-within/input:opacity-0 group-focus-within/input:-translate-x-4">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--muted)] border border-[var(--border)]/50 backdrop-blur-sm shadow-sm">
                <ProviderIcon providerId={provider} size={14} />
                <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">AI</span>
              </div>
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={isLoading}
            className={`w-full resize-none rounded-[2rem] border-2 border-[var(--input-border)] bg-[var(--input-bg)] py-4 pr-14 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)]/60 focus:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${provider ? 'pl-20 focus:pl-6' : 'pl-6'}`}
            style={{
              minHeight: "60px",
              maxHeight: "200px",
            }}
          />
          {input.length > 0 && (
            <div className="absolute right-5 bottom-4 text-[10px] font-medium text-[var(--muted-foreground)] bg-[var(--input-bg)]/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md pointer-events-none transition-opacity duration-200">
              {input.length.toLocaleString()}
            </div>
          )}
        </div>

        {isLoading ? (
          <button
            type="button"
            onClick={onStop}
            className="flex-shrink-0 w-[60px] h-[60px] flex items-center justify-center rounded-[2rem] bg-[var(--destructive)] text-white hover:brightness-110 active:scale-90 transition-all duration-300 animate-in zoom-in-75 group relative overflow-hidden shadow-lg shadow-red-500/20"
            aria-label="Stop generating"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Square size={20} className="relative z-10 fill-current animate-pulse" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="group flex-shrink-0 w-[60px] h-[60px] flex items-center justify-center rounded-[2rem] bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110 hover:shadow-xl hover:shadow-[var(--primary)]/20 active:scale-90 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none animate-in zoom-in-75"
            aria-label="Send message"
          >
            <Send size={22} className={`transition-all duration-500 ${input.trim() ? "translate-x-0.5 -translate-y-0.5 scale-110" : "scale-100 opacity-70"}`} />
          </button>
        )}
      </form>

      <p className="text-center text-[0.6875rem] text-[var(--muted-foreground)] mt-3 max-w-[48rem] mx-auto opacity-75 tracking-wide">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
