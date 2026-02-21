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
    ? currentModel.name
    : loading
      ? "Loading..."
      : "Select model";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-border/60 bg-card text-foreground hover:bg-muted/50 hover:border-border transition-all duration-200 active:scale-[0.97] text-sm font-medium group ${isOpen ? 'ring-2 ring-primary/15 border-primary/30' : ''}`}
        disabled={loading}
      >
        {currentProvider && (
          <ProviderIcon providerId={currentProvider.id} size={14} />
        )}
        <span className="truncate max-w-[160px]">{displayName}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 text-muted-foreground ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1.5 w-72 rounded-xl border border-border bg-card z-50 overflow-hidden animate-scale-in"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          <div className="p-1.5 flex flex-col gap-1">
            {providers.map((provider, providerIndex) => (
              <div key={provider.id} className="flex flex-col">
                {/* Provider header */}
                <div className="flex items-center gap-2 px-3 pt-2 pb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <ProviderIcon providerId={provider.id} size={11} />
                  {provider.name}
                  {!provider.available && (
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-muted border border-border normal-case tracking-normal font-medium text-muted-foreground">
                      No Key
                    </span>
                  )}
                </div>

                {/* Models */}
                <div className="flex flex-col gap-0.5 px-0.5">
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
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-150 ${
                          isDisabled
                            ? "opacity-35 cursor-not-allowed"
                            : isSelected
                              ? "bg-primary/8 text-foreground"
                              : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-[13px] font-medium ${isSelected ? "text-primary" : ""}`}>
                              {model.name}
                            </span>
                          </div>
                          {model.description && (
                            <span className="text-[10px] text-muted-foreground/70 leading-snug line-clamp-1">
                              {model.description}
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <Check size={14} className="text-primary flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Divider between providers */}
                {providerIndex < providers.length - 1 && (
                  <div className="mx-3 my-1 border-t border-border/50" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
