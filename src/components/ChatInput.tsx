"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { Send, Square } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onStop?: () => void;
  isLoading: boolean;
  placeholder?: string;
}

export default function ChatInput({
  input,
  setInput,
  onSubmit,
  onStop,
  isLoading,
  placeholder = "Send a message...",
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
      className="border-t border-[var(--border)] bg-[var(--background)] px-4 py-5 md:px-6 transition-shadow duration-200"
      style={{ boxShadow: "0 -1px 3px rgba(0,0,0,0.04)" }}
    >
      <form
        onSubmit={onSubmit}
        className="max-w-[48rem] mx-auto flex items-end gap-3.5"
      >
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={isLoading}
            className="w-full resize-none rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-5 py-3.5 pr-5 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--ring)] focus:shadow-[0_0_0_3px_var(--ring)/15] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              minHeight: "52px",
              maxHeight: "200px",
              boxShadow: "var(--shadow-sm)",
            }}
          />
        </div>

        {isLoading ? (
          <button
            type="button"
            onClick={onStop}
            className="flex-shrink-0 p-3.5 rounded-2xl bg-[var(--destructive)] text-white hover:brightness-110 hover:scale-105 hover:shadow-md active:scale-90 transition-all duration-150 animate-scale-in"
            aria-label="Stop generating"
          >
            <Square size={20} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="group flex-shrink-0 p-3.5 rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110 hover:scale-105 hover:shadow-md active:scale-90 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none disabled:active:scale-100"
            style={{
              boxShadow: input.trim()
                ? "0 2px 8px rgba(79, 70, 229, 0.2)"
                : "none",
            }}
            aria-label="Send message"
          >
            <span className="block group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
              <Send size={20} />
            </span>
          </button>
        )}
      </form>

      <p className="text-center text-[0.6875rem] text-[var(--muted-foreground)] mt-3 max-w-[48rem] mx-auto opacity-75 tracking-wide">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
