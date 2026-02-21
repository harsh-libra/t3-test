"use client";

import React, { useState } from "react";
import {
  MessageSquarePlus,
  Trash2,
  MessageSquare,
  X,
  Menu,
  Sparkles,
  Cpu,
  Zap,
  Keyboard,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import type { Conversation } from "@/types";

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

function ProviderBadge({ providerId }: { providerId: string }) {
  switch (providerId) {
    case "openai":
      return <Sparkles size={13} className="text-green-500 flex-shrink-0" />;
    case "anthropic":
      return <Cpu size={13} className="text-orange-500 flex-shrink-0" />;
    case "google":
      return <Zap size={13} className="text-blue-500 flex-shrink-0" />;
    default:
      return null;
  }
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-sm animate-fade-in"
          onClick={onToggle}
        />
      )}

      {/* Mobile hamburger button */}
      <button
        onClick={onToggle}
        className="fixed top-3 left-3 z-50 p-2 rounded-lg bg-card border border-border text-foreground md:hidden"
        style={{ boxShadow: "var(--shadow-md)" }}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 h-full flex flex-col bg-sidebar-bg border-r border-sidebar-border transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] transition-theme ${
          isOpen
            ? "w-80 translate-x-0"
            : "w-80 -translate-x-full md:w-0 md:translate-x-0 md:overflow-hidden"
        }`}
      >
        <div className="flex flex-col h-full w-80">
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b border-[var(--sidebar-border)]"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <h1 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2.5 tracking-tight">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--gradient-primary)" }}
              >
                <MessageSquare size={16} className="text-white" />
              </div>
              T3 Chat
            </h1>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors md:hidden"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* New Chat button */}
          <div className="px-4 py-3">
            <button
              onClick={() => {
                onNewChat();
                if (window.innerWidth < 768) onToggle();
              }}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 hover:shadow-sm active:scale-[0.97] transition-all duration-150 font-medium text-sm"
              style={{ boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)" }}
            >
              <span className="flex items-center gap-2">
                <MessageSquarePlus size={18} />
                New Chat
              </span>
              <kbd className="hidden sm:inline text-xs opacity-80 bg-white/20 px-2 py-0.5 rounded-md font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            {conversations.length === 0 ? (
              <div className="text-center py-10 text-[var(--muted-foreground)] text-sm">
                <MessageSquare
                  size={36}
                  className="mx-auto mb-3 opacity-40"
                />
                <p className="font-medium">No conversations yet</p>
                <p className="text-xs mt-1.5 opacity-75">Start a new chat to begin</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {conversations.map((conv, index) => {
                  const isActive = conv.id === currentConversationId;
                  const isHovered = conv.id === hoveredId;

                  return (
                    <div
                      key={conv.id}
                      className={`group relative flex items-center rounded-xl cursor-pointer transition-all duration-150 hover:translate-x-0.5 active:scale-[0.98] animate-fade-in-up ${
                        isActive
                          ? "bg-[var(--accent)] text-[var(--accent-foreground)] border-l-2 border-l-[var(--primary)]"
                          : "hover:bg-[var(--muted)] text-[var(--foreground)] border-l-2 border-l-transparent"
                      }`}
                      style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
                      onMouseEnter={() => setHoveredId(conv.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => {
                        onSelectConversation(conv.id);
                        if (window.innerWidth < 768) onToggle();
                      }}
                    >
                      <div className="flex-1 min-w-0 px-3.5 py-3">
                        <div className="flex items-center gap-2">
                          <ProviderBadge providerId={conv.provider} />
                          <p className="text-sm font-medium truncate">
                            {conv.title}
                          </p>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1 tracking-wide">
                          {conv.messages.length} messages ·{" "}
                          {formatTimeAgo(conv.updatedAt)}
                        </p>
                      </div>

                      {/* Delete button */}
                      {(isHovered || isActive) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conv.id);
                          }}
                          className="flex-shrink-0 p-2 mr-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--muted)] hover:scale-110 active:scale-95 transition-all duration-150 animate-scale-in"
                          aria-label="Delete conversation"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with shortcuts */}
          <div className="px-4 py-3.5 border-t border-[var(--sidebar-border)]">
            <button
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="w-full flex items-center justify-center gap-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg active:scale-[0.98] transition-all duration-150 py-1"
            >
              <Keyboard size={14} />
              Keyboard shortcuts
            </button>
            {showShortcuts && (
              <div className="mt-2.5 p-3.5 rounded-lg bg-[var(--muted)] text-xs space-y-2 animate-fade-in-down">
                <div className="flex justify-between items-center">
                  <span className="tracking-wide">New chat</span>
                  <kbd
                    className="px-2 py-0.5 rounded-md bg-[var(--card)] border border-[var(--border)] font-mono text-[var(--muted-foreground)]"
                    style={{ boxShadow: "var(--shadow-sm)" }}
                  >
                    ⌘K
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="tracking-wide">Toggle sidebar</span>
                  <kbd
                    className="px-2 py-0.5 rounded-md bg-[var(--card)] border border-[var(--border)] font-mono text-[var(--muted-foreground)]"
                    style={{ boxShadow: "var(--shadow-sm)" }}
                  >
                    ⌘B
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="tracking-wide">Send message</span>
                  <kbd
                    className="px-2 py-0.5 rounded-md bg-[var(--card)] border border-[var(--border)] font-mono text-[var(--muted-foreground)]"
                    style={{ boxShadow: "var(--shadow-sm)" }}
                  >
                    Enter
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="tracking-wide">New line</span>
                  <kbd
                    className="px-2 py-0.5 rounded-md bg-[var(--card)] border border-[var(--border)] font-mono text-[var(--muted-foreground)]"
                    style={{ boxShadow: "var(--shadow-sm)" }}
                  >
                    ⇧Enter
                  </kbd>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
