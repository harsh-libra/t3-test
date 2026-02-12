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
function ProviderIcon({ providerId }: { providerId: string }) {
  switch (providerId) {
    case "openai":
      return <Sparkles size={16} className="text-green-500" />;
    case "anthropic":
      return <Cpu size={16} className="text-orange-500" />;
    case "google":
      return <Zap size={16} className="text-blue-500" />;
    default:
      return <Cpu size={16} />;
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
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] hover:bg-[var(--muted)] transition-colors text-sm font-medium"
        disabled={loading}
      >
        {currentProvider && (
          <ProviderIcon providerId={currentProvider.id} />
        )}
        <span className="truncate max-w-[200px]">{displayName}</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2">
            {providers.map((provider) => (
              <div key={provider.id}>
                {/* Provider header */}
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                  <ProviderIcon providerId={provider.id} />
                  {provider.name}
                  {!provider.available && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--muted)] normal-case tracking-normal font-medium">
                      No API Key
                    </span>
                  )}
                </div>

                {/* Models */}
                {provider.models.map((model) => {
                  const isSelected =
                    selectedProvider === provider.id &&
                    selectedModel === model.id;
                  const isDisabled = !provider.available;

                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        if (!isDisabled) {
                          onSelect(provider.id, model.id);
                          setIsOpen(false);
                        }
                      }}
                      disabled={isDisabled}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${
                        isDisabled
                          ? "opacity-40 cursor-not-allowed"
                          : isSelected
                            ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                            : "hover:bg-[var(--muted)] text-[var(--card-foreground)]"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {model.name}
                        </span>
                        {model.description && (
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {model.description}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <Check size={16} className="text-[var(--primary)]" />
                      )}
                    </button>
                  );
                })}

                {/* Divider between providers */}
                <div className="mx-3 my-1 border-t border-[var(--border)]" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
