"use client";

import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, User, Bot } from "lucide-react";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
}

function CodeBlock({
  language,
  children,
}: {
  language: string;
  children: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden border border-[var(--border)]">
      <div className="flex items-center justify-between px-4 py-2 text-xs bg-[var(--muted)] text-[var(--muted-foreground)] border-b border-[var(--border)]">
        <span>{language || "text"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-[var(--foreground)] transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} /> Copied
            </>
          ) : (
            <>
              <Copy size={14} /> Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language || "text"}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          padding: "1rem",
          fontSize: "0.875rem",
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

const MessageBubble = memo(function MessageBubble({
  role,
  content,
  isStreaming = false,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex gap-3 py-4 px-4 md:px-0 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[var(--primary)] text-white mt-1">
          <Bot size={18} />
        </div>
      )}

      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-[var(--user-bubble)] text-[var(--user-bubble-text)] rounded-br-md"
            : "bg-[var(--assistant-bubble)] text-[var(--assistant-bubble-text)] rounded-bl-md"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        ) : (
          <div className="prose max-w-none">
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
                        className="px-1.5 py-0.5 rounded bg-[var(--muted)] text-[var(--foreground)] text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }

                  return <CodeBlock language={match[1]}>{codeString}</CodeBlock>;
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
              <span className="inline-block w-2 h-5 bg-[var(--primary)] animate-pulse ml-1 rounded-sm" />
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[var(--muted)] text-[var(--foreground)] mt-1">
          <User size={18} />
        </div>
      )}
    </div>
  );
});

export default MessageBubble;
