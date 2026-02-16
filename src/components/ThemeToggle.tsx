"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Check } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-theme-toggle]")) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg bg-[var(--muted)] animate-pulse" />
    );
  }

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const currentIcon =
    theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <div className="relative" data-theme-toggle>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
        aria-label="Toggle theme"
      >
        {React.createElement(currentIcon, { size: 16 })}
      </button>

      {isOpen && (
        <div
          className="absolute left-0 bottom-full mb-2 w-40 rounded-xl border border-[var(--border)] bg-[var(--card)] z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          <div className="p-1.5">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  theme === option.value
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                    : "text-[var(--card-foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                {React.createElement(option.icon, { size: 16 })}
                <span className="flex-1 text-left">{option.label}</span>
                {theme === option.value && (
                  <Check size={14} className="text-[var(--primary)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
