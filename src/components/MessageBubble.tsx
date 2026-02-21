"use client";

import React, { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, Bot, Copy, Check, RotateCcw } from "lucide-react";
import CodeBlock from "./CodeBlock";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  showRegenerate?: boolean;
}

const MessageBubble = memo(function MessageBubble({
  role,
  content,
  isStreaming = false,
  onRegenerate,
  showRegenerate = false,
}: MessageBubbleProps) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div
      className={`group flex gap-3 md:gap-4 py-6 px-4 md:px-0 animate-message-pop ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-2xl flex items-center justify-center mt-1 animate-scale-in shadow-md transition-all duration-300 hover:scale-110 hover:rotate-3 ${
          isUser
            ? "bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border border-[var(--border)] text-[var(--foreground)]"
            : "bg-linear-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white shadow-lg shadow-indigo-500/25"
        }`}
      >
        {isUser ? (
          <User size={18} className="md:w-5 md:h-5" />
        ) : (
          <Bot
            size={18}
            className={`md:w-5 md:h-5 ${
              isStreaming ? "animate-pulse" : ""
            }`}
          />
        )}
      </div>

      <div className={`flex flex-col gap-2 max-w-[85%] md:max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`relative px-4 md:px-6 py-3 md:py-4 transition-all duration-300 shadow-sm ${
            isUser
              ? "bg-linear-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white rounded-3xl rounded-tr-none hover:shadow-lg hover:shadow-indigo-500/20"
              : "backdrop-blur-md bg-white/90 dark:bg-slate-900/90 text-[var(--assistant-bubble-text)] rounded-3xl rounded-tl-none border border-[var(--border)]/80 hover:shadow-lg hover:border-[var(--border)]"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed text-[0.9375rem] font-medium">{content}</p>
          ) : (
            <div className="prose max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeString = String(children).replace(/\n$/, "");

                    if (!match) {
                      return (
                        <code
                          className="px-1.5 py-0.5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] text-[0.875em] font-semibold font-mono"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }

                    return <CodeBlock language={match[1]}>{codeString}</CodeBlock>;
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-4 rounded-xl border border-[var(--border)] shadow-xs">
                        <table className="min-w-full divide-y divide-[var(--border)] m-0">
                          {children}
                        </table>
                      </div>
                    );
                  },
                  pre({ children }) {
                    return <>{children}</>;
                  },
                }}
              >
                {content}
              </ReactMarkdown>
              {isStreaming && (
                <div className="flex gap-1 mt-2 items-center h-5">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-typing-dot" />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-typing-dot animation-delay-150" />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-typing-dot animation-delay-300" />
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className={`flex gap-1.5 md:gap-2 transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${
            isUser ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
              copied
                ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                : "text-muted-foreground hover:text-foreground bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border-[var(--border)]/50 shadow-xs"
            } backdrop-blur-sm`}
            title="Copy message"
          >
            {copied ? (
              <span className="flex items-center gap-1.5">
                <Check size={14} className="animate-scale-in" />
                <span className="hidden sm:inline animate-fade-in">Copied</span>
              </span>
            ) : (
              <>
                <Copy size={14} />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          {showRegenerate && onRegenerate && (
            <button
              onClick={onRegenerate}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 backdrop-blur-sm transition-all duration-200 border border-[var(--border)]/50 shadow-xs"
              title="Regenerate response"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default MessageBubble;
