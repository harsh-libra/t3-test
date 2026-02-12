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
      return <Sparkles size={12} className="text-green-500" />;
    case "anthropic":
      return <Cpu size={12} className="text-orange-500" />;
    case "google":
      return <Zap size={12} className="text-blue-500" />;
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
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Mobile hamburger button */}
      <button
        onClick={onToggle}
        className="fixed top-3 left-3 z-50 p-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] md:hidden shadow-md"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 h-full flex flex-col bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] transition-all duration-300 ease-in-out ${
          isOpen
            ? "w-72 translate-x-0"
            : "w-72 -translate-x-full md:w-0 md:translate-x-0 md:overflow-hidden"
        }`}
      >
        <div className="flex flex-col h-full w-72">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--sidebar-border)]">
            <h1 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--primary)] flex items-center justify-center">
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
          <div className="p-3">
            <button
              onClick={() => {
                onNewChat();
                if (window.innerWidth < 768) onToggle();
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity font-medium text-sm"
            >
              <span className="flex items-center gap-2">
                <MessageSquarePlus size={18} />
                New Chat
              </span>
              <kbd className="hidden sm:inline text-xs opacity-70 bg-white/20 px-1.5 py-0.5 rounded">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-[var(--muted-foreground)] text-sm">
                <MessageSquare
                  size={32}
                  className="mx-auto mb-2 opacity-50"
                />
                <p>No conversations yet</p>
                <p className="text-xs mt-1">Start a new chat to begin</p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => {
                  const isActive = conv.id === currentConversationId;
                  const isHovered = conv.id === hoveredId;

                  return (
                    <div
                      key={conv.id}
                      className={`group relative flex items-center rounded-xl cursor-pointer transition-colors ${
                        isActive
                          ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                          : "hover:bg-[var(--muted)] text-[var(--foreground)]"
                      }`}
                      onMouseEnter={() => setHoveredId(conv.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => {
                        onSelectConversation(conv.id);
                        if (window.innerWidth < 768) onToggle();
                      }}
                    >
                      <div className="flex-1 min-w-0 px-3 py-3">
                        <div className="flex items-center gap-2">
                          <ProviderBadge providerId={conv.provider} />
                          <p className="text-sm font-medium truncate">
                            {conv.title}
                          </p>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
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
                          className="flex-shrink-0 p-2 mr-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--muted)] transition-colors"
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
          <div className="p-3 border-t border-[var(--sidebar-border)]">
            <button
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="w-full flex items-center justify-center gap-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors py-1"
            >
              <Keyboard size={14} />
              Keyboard shortcuts
            </button>
            {showShortcuts && (
              <div className="mt-2 p-3 rounded-lg bg-[var(--muted)] text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span>New chat</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--card)] border border-[var(--border)] font-mono">
                    ⌘K
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span>Toggle sidebar</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--card)] border border-[var(--border)] font-mono">
                    ⌘B
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span>Send message</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--card)] border border-[var(--border)] font-mono">
                    Enter
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span>New line</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--card)] border border-[var(--border)] font-mono">
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
