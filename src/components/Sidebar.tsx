"use client";

import React from "react";
import {
  Plus,
  Trash2,
  MessageSquare,
  X,
  Menu,
  Sparkles,
  Cpu,
  Zap,
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
      return <Sparkles size={12} className="text-green-500 flex-shrink-0" />;
    case "anthropic":
      return <Cpu size={12} className="text-orange-500 flex-shrink-0" />;
    case "google":
      return <Zap size={12} className="text-blue-500 flex-shrink-0" />;
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

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
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
        className={`fixed md:relative z-40 h-full flex flex-col bg-sidebar-bg border-r border-sidebar-border transition-all duration-300 ease-in-out transition-theme ${
          isOpen
            ? "w-64 translate-x-0"
            : "w-64 -translate-x-full md:w-0 md:translate-x-0 md:overflow-hidden"
        }`}
      >
        <div className="flex flex-col h-full w-64">
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-3 border-b border-[var(--sidebar-border)]">
            <h1 className="text-sm font-semibold text-[var(--foreground)] tracking-tight">
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
          <div className="px-3 py-2">
            <button
              onClick={() => {
                onNewChat();
                if (window.innerWidth < 768) onToggle();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-all text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                <Plus size={16} />
                New Chat
              </span>
              <kbd className="hidden sm:inline text-[10px] text-[var(--muted-foreground)] bg-[var(--muted)] px-1.5 py-0.5 rounded font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto px-2.5 pb-2.5">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-[var(--muted-foreground)] text-sm">
                <MessageSquare
                  size={28}
                  className="mx-auto mb-2.5 opacity-40"
                />
                <p className="font-medium">No conversations yet</p>
                <p className="text-xs mt-1.5 opacity-75">Start a new chat to begin</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {conversations.map((conv) => {
                  const isActive = conv.id === currentConversationId;

                  return (
                    <div
                      key={conv.id}
                      className={`group relative flex items-center rounded-lg cursor-pointer transition-colors ${
                        isActive
                          ? "bg-[var(--muted)] text-[var(--foreground)]"
                          : "hover:bg-[var(--muted)]/50 text-[var(--foreground)]"
                      }`}
                      onClick={() => {
                        onSelectConversation(conv.id);
                        if (window.innerWidth < 768) onToggle();
                      }}
                    >
                      <div className="flex-1 min-w-0 px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <ProviderBadge providerId={conv.provider} />
                          <p className="text-sm truncate">
                            {conv.title}
                          </p>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 opacity-75">
                          {formatTimeAgo(conv.updatedAt)}
                        </p>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conv.id);
                        }}
                        className={`flex-shrink-0 p-1.5 mr-2 rounded-md text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-all ${
                          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`}
                        aria-label="Delete conversation"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-3 border-t border-[var(--sidebar-border)]">
            <p className="text-[11px] text-[var(--muted-foreground)] text-center opacity-60">
              ⌘K new chat · ⌘B toggle sidebar
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
