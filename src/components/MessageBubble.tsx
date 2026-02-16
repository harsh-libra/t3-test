"use client";

import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, User, Bot, FileText } from "lucide-react";

interface Attachment {
  name: string;
  contentType: string;
  url: string;
}

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
  experimental_attachments?: Attachment[];
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
    <div
      className="relative group my-3 rounded-lg overflow-hidden border border-[var(--border)]"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-center justify-between px-4 py-2.5 text-xs bg-[var(--muted)] text-[var(--muted-foreground)] border-b border-[var(--border)]">
        <span className="font-medium tracking-wide">{language || "text"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-[var(--foreground)] transition-colors px-2 py-1 rounded-md hover:bg-[var(--background)]"
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
          fontSize: "0.8125rem",
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
  experimental_attachments,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex gap-3.5 py-5 px-4 md:px-0 ${
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

      <div
        className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-5 py-3.5 ${
          isUser
            ? "bg-[var(--user-bubble)] text-[var(--user-bubble-text)] rounded-br-md"
            : "bg-[var(--assistant-bubble)] text-[var(--assistant-bubble-text)] rounded-bl-md border border-[var(--border)]/50"
        }`}
        style={isUser ? { boxShadow: "var(--shadow-sm)" } : {}}
      >
        {isUser ? (
          <div>
            {experimental_attachments && experimental_attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {experimental_attachments.map((attachment, index) => (
                  <div key={index}>
                    {attachment.contentType?.startsWith("image/") ? (
                      <img
                        src={attachment.url}
                        alt={attachment.name || `attachment-${index}`}
                        className="max-w-[200px] max-h-[200px] rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-sm">
                        <FileText size={16} />
                        <span className="max-w-[150px] truncate">
                          {attachment.name}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
          </div>
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
                        className="px-2 py-1 rounded-md bg-[var(--muted)] text-[var(--foreground)] text-[0.8125rem] font-mono border border-[var(--border)]/40"
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
        <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-[var(--muted)] text-[var(--foreground)] mt-1 ring-1 ring-[var(--border)]">
          <User size={18} />
        </div>
      )}
    </div>
  );
});

export default MessageBubble;
