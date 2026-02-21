"use client";

import React, { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, Bot, Copy, Check, RotateCcw } from "lucide-react";
import CodeBlock from "./CodeBlock";
import { useToast } from "./Toast";

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
      className={`group flex gap-3 py-4 px-4 md:px-0 animate-message-pop ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center mt-1 transition-all duration-200 ${
          isUser
            ? "bg-muted text-muted-foreground border border-border/60"
            : "bg-primary/10 text-primary"
        }`}
      >
        {isUser ? (
          <User size={14} className="md:w-4 md:h-4" />
        ) : (
          <Bot
            size={14}
            className={`md:w-4 md:h-4 ${
              isStreaming ? "animate-pulse" : ""
            }`}
          />
        )}
      </div>

      {/* Message content */}
      <div className={`flex flex-col gap-1.5 max-w-[85%] md:max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`relative px-4 py-3 transition-all duration-200 ${
            isUser
              ? "bg-user-bubble text-user-bubble-text rounded-2xl rounded-tr-sm shadow-sm"
              : "bg-assistant-bubble border border-border/60 text-assistant-bubble-text rounded-2xl rounded-tl-sm shadow-sm"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed text-[0.9rem]">{content}</p>
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
                          className="px-1.5 py-0.5 rounded-md bg-primary/8 text-primary text-[0.85em] font-medium font-mono"
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
                      <div className="overflow-x-auto my-4 rounded-lg border border-border">
                        <table className="min-w-full divide-y divide-border m-0">
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
                <div className="flex gap-1 mt-2 items-center h-4">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-typing-dot" />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-typing-dot animation-delay-150" />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-typing-dot animation-delay-300" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div
          className={`flex gap-1 transition-opacity duration-200 opacity-0 group-hover:opacity-100 ${
            isUser ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all duration-200 ${
              copied
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            title="Copy message"
          >
            {copied ? (
              <span className="flex items-center gap-1">
                <Check size={12} className="animate-scale-in" />
                <span className="hidden sm:inline">Copied</span>
              </span>
            ) : (
              <>
                <Copy size={12} />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          {showRegenerate && onRegenerate && (
            <button
              onClick={onRegenerate}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              title="Regenerate response"
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">Retry</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default MessageBubble;
