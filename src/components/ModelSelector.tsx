"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Cpu, Sparkles, Zap } from "lucide-react";
import type { Provider } from "@/types";

interface ModelSelectorProps {
  selectedProvider: string;
  selectedModel: string;
  onSelect: (provider: string, model: string) => void;
}

// Provider icons
export function ProviderIcon({ providerId, size = 16 }: { providerId: string; size?: number }) {
  switch (providerId) {
    case "openai":
      return <Sparkles size={size} className="text-green-500" />;
    case "anthropic":
      return <Cpu size={size} className="text-orange-500" />;
    case "google":
      return <Zap size={size} className="text-blue-500" />;
    default:
      return <Cpu size={size} />;
  }
}

export default function ModelSelector({
  selectedProvider,
  selectedModel,
  onSelect,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [providers, setProviders] = useState<
    (Provider & { available: boolean })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch available models
  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch("/api/models");
        const data = await res.json();
        setProviders(data.providers || []);
      } catch (err) {
        console.error("Failed to fetch models:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchModels();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find current selection display name
  const currentProvider = providers.find((p) => p.id === selectedProvider);
  const currentModel = currentProvider?.models.find(
    (m) => m.id === selectedModel
  );

  const displayName = currentModel
    ? `${currentModel.name}`
    : loading
      ? "Loading models..."
      : "Select a model";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] hover:border-[var(--primary)]/30 hover:shadow-md transition-all active:scale-[0.97] text-sm font-semibold group ${isOpen ? 'ring-2 ring-[var(--primary)]/20 border-[var(--primary)]/30' : ''}`}
        style={{ boxShadow: "var(--shadow-sm)" }}
        disabled={loading}
      >
        {currentProvider && (
          <div className="transition-transform group-hover:scale-110 duration-200">
            <ProviderIcon providerId={currentProvider.id} />
          </div>
        )}
        <span className="truncate max-w-[200px]">{displayName}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-300 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-80 rounded-2xl border border-[var(--border)] bg-[var(--card)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          <div className="p-2 flex flex-col gap-2">
            {providers.map((provider, providerIndex) => (
              <div key={provider.id} className="flex flex-col gap-1">
                {/* Provider header */}
                <div className={`flex items-center gap-2 px-3 pt-2 pb-1 text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-[0.1em] opacity-70`}>
                  <ProviderIcon providerId={provider.id} size={12} />
                  {provider.name}
                  {!provider.available && (
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-[var(--muted)] border border-[var(--border)] normal-case tracking-normal font-medium">
                      Missing Key
                    </span>
                  )}
                </div>

                {/* Models */}
                <div className="flex flex-col gap-1 px-1">
                  {provider.models.map((model) => {
                    const isSelected =
                      selectedProvider === provider.id &&
                      selectedModel === model.id;
                    const isDisabled = !provider.available;

                    return (
                      <button
                        key={model.id}
                        disabled={isDisabled}
                        onClick={() => {
                          onSelect(provider.id, model.id);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                          isDisabled
                            ? "opacity-40 cursor-not-allowed"
                            : isSelected
                              ? "bg-[var(--primary)]/10 text-[var(--foreground)] ring-1 ring-[var(--primary)]/30 shadow-sm"
                              : "hover:bg-[var(--muted)] hover:translate-x-1 active:scale-[0.98] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${isSelected ? "text-[var(--primary)]" : ""}`}>
                              {model.name}
                            </span>
                            {isSelected && (
                              <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                            )}
                          </div>
                          {model.description && (
                            <span className="text-[11px] text-[var(--muted-foreground)]/80 leading-snug line-clamp-1">
                              {model.description}
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center animate-in zoom-in-50 shadow-sm shadow-[var(--primary)]/20">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Divider between providers — not after the last one */}
                {providerIndex < providers.length - 1 && (
                  <div className="mx-3 my-1.5 border-t border-[var(--border)]/60" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
