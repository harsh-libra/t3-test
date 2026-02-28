"use client";

import React, { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, Bot, Copy, Check } from "lucide-react";
import CodeBlock from "./CodeBlock";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
  createdAt?: Date;
}

const MessageBubble = memo(function MessageBubble({
  role,
  content,
  isStreaming = false,
  createdAt,
}: MessageBubbleProps) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timeString = createdAt
    ? createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div
      className={`group flex gap-3.5 py-5 px-4 md:px-0 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-[var(--primary)] text-white mt-1"
          style={{ boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)" }}
        >
          <Bot size={18} />
        </div>
      )}

      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-5 py-3.5 ${
            isUser
              ? "bg-[var(--user-bubble)] text-[var(--user-bubble-text)] rounded-br-md"
              : "bg-[var(--assistant-bubble)] text-[var(--assistant-bubble-text)] rounded-bl-md border border-[var(--border)]/50"
          }`}
          style={isUser ? { boxShadow: "var(--shadow-sm)" } : {}}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
          ) : (
            <div className="prose max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeString = String(children).replace(/\n$/, "");

                    // Inline code vs block code
                    if (!match) {
                      return (
                        <code
                          className="px-1.5 py-0.5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] text-[0.875em] font-medium font-mono border border-[var(--primary)]/20"
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
                      <div className="overflow-x-auto my-4 rounded-lg border border-[var(--border)]">
                        <table className="min-w-full divide-y divide-[var(--border)] m-0">
                          {children}
                        </table>
                      </div>
                    );
                  },
                  pre({ children }) {
                    // Let the code component handle rendering
                    return <>{children}</>;
                  },
                }}
              >
                {content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-2 h-5 bg-[var(--primary)] animate-blink ml-1 rounded-sm" />
              )}
            </div>
          )}
        </div>

        {/* Copy button + timestamp row */}
        <div
          className={`flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${
            isUser ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <button
            onClick={handleCopy}
            title="Copy message"
            className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            {copied ? (
              <Check size={13} className="text-green-500" />
            ) : (
              <Copy size={13} />
            )}
          </button>

          {timeString && (
            <span className="text-[10px] text-[var(--muted-foreground)]">
              {timeString}
            </span>
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-[var(--muted)] text-[var(--foreground)] mt-1 ring-1 ring-[var(--border)]">
          <User size={18} />
        </div>
      )}
    </div>
  );
});

export default MessageBubble;
