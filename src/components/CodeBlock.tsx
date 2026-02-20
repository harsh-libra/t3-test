"use client";

import React, { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { Copy, Check, Terminal, Braces, FileCode } from "lucide-react";

interface CodeBlockProps {
  language?: string;
  children: string;
}

const languageIcons: Record<string, React.ElementType> = {
  bash: Terminal,
  sh: Terminal,
  shell: Terminal,
  zsh: Terminal,
  json: Braces,
  yaml: Braces,
  yml: Braces,
};

const CodeBlock: React.FC<CodeBlockProps> = ({ language = "text", children }) => {
  const [copied, setCopied] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering theme-specific content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Icon = languageIcons[language.toLowerCase()] || FileCode;
  const lineCount = children.split("\n").length;
  const showLineNumbers = lineCount > 5;
  
  // Use oneDark by default during SSR to prevent flash
  const currentTheme = mounted && resolvedTheme === "light" ? prism : oneDark;

  return (
    <div
      className="relative group my-4 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--card)] transition-all duration-200"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-center justify-between px-4 py-2 text-xs font-medium bg-[var(--muted)]/50 text-[var(--muted-foreground)] border-b border-[var(--border)] transition-colors duration-200">
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-[var(--primary)]" />
          <span className="capitalize">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-[var(--foreground)] transition-colors px-2 py-1 rounded-md hover:bg-[var(--background)]"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-500" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="relative font-mono transition-colors duration-200">
        <SyntaxHighlighter
          style={currentTheme}
          language={language}
          PreTag="div"
          showLineNumbers={showLineNumbers}
          className="code-block-scrollbar"
          lineNumberStyle={{
            minWidth: "3em",
            paddingRight: "1em",
            textAlign: "right",
            color: "var(--muted-foreground)",
            opacity: 0.5,
            userSelect: "none",
          }}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            padding: "1.25rem 1rem",
            fontSize: "0.875rem",
            lineHeight: "1.5",
            background: "transparent",
            fontFamily: "var(--font-mono)",
          }}
          codeTagProps={{
            style: {
              fontFamily: "var(--font-mono)",
            },
          }}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;
