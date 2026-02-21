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
      className="relative group my-8 rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)] transition-all duration-300 shadow-md hover:shadow-2xl hover:border-[var(--primary)]/40"
    >
      <div className="flex items-center justify-between px-5 py-3 text-xs font-bold bg-slate-50/90 dark:bg-slate-900/90 text-[var(--muted-foreground)] border-b border-[var(--border)] backdrop-blur-sm transition-colors duration-200 uppercase tracking-widest">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded bg-[var(--primary)]/10 text-[var(--primary)]">
            <Icon size={14} />
          </div>
          <span className="capitalize tracking-wide">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 transition-all duration-200 px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 ${
            copied 
              ? "bg-green-500/10 text-green-600 dark:text-green-400" 
              : "hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
          aria-label="Copy code"
        >
          <span key={copied ? 'check' : 'copy'} className="flex items-center gap-1.5">
            {copied ? (
              <>
                <Check size={14} className="animate-scale-in" />
                <span className="animate-fade-in">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy</span>
              </>
            )}
          </span>
        </button>
      </div>
      <div className={`relative font-mono transition-colors duration-200 ${
        mounted && resolvedTheme === "light" ? "bg-slate-50/50" : "bg-[#282c34]"
      }`}>
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
