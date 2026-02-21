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

export default function CodeBlock({ language = "text", children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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
  
  const currentTheme = mounted && resolvedTheme === "light" ? prism : oneDark;

  return (
    <div className="relative group my-5 rounded-xl overflow-hidden border border-border/80 bg-card transition-all duration-200 hover:border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 text-[11px] font-medium bg-muted/50 text-muted-foreground border-b border-border/60">
        <div className="flex items-center gap-2">
          <Icon size={12} className="opacity-60" />
          <span className="capitalize">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 transition-all duration-200 px-2 py-1 rounded-md text-[10px] ${
            copied 
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
              : "opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground"
          }`}
          aria-label="Copy code"
        >
          {copied ? (
            <span className="flex items-center gap-1">
              <Check size={12} className="animate-scale-in" />
              Copied!
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Copy size={12} />
              Copy
            </span>
          )}
        </button>
      </div>
      
      {/* Code */}
      <div className={`relative font-mono transition-colors duration-200 ${
        mounted && resolvedTheme === "light" ? "bg-slate-50/80" : "bg-[#1e1e28]"
      }`}>
        <SyntaxHighlighter
          style={currentTheme}
          language={language}
          PreTag="div"
          showLineNumbers={showLineNumbers}
          className="code-block-scrollbar"
          lineNumberStyle={{
            minWidth: "2.5em",
            paddingRight: "1em",
            textAlign: "right",
            color: "var(--muted-foreground)",
            opacity: 0.4,
            userSelect: "none",
            fontSize: "0.8rem",
          }}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            padding: "1rem",
            fontSize: "0.8125rem",
            lineHeight: "1.6",
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
}
