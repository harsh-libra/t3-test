"use client";

import React, { useState, useMemo } from "react";
import { Plus, Trash2, X, Menu, Search } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { searchConversations, type FuseResultMatch } from "@/lib/search";
import type { Conversation } from "@/types";

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

function HighlightedText({
  text,
  matches,
}: {
  text: string;
  matches?: readonly FuseResultMatch[];
}) {
  if (!matches || matches.length === 0) return <>{text}</>;

  const titleMatch = matches.find((m) => m.key === "title");
  if (!titleMatch || !titleMatch.indices) return <>{text}</>;

  const indices = [...titleMatch.indices].sort((a, b) => a[0] - b[0]);
  let lastIndex = 0;
  const parts: React.ReactNode[] = [];

  for (const [start, end] of indices) {
    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }
    parts.push(
      <span
        key={start}
        className="bg-[var(--accent)] text-[var(--accent-foreground)] rounded-sm px-0.5"
      >
        {text.slice(start, end + 1)}
      </span>
    );
    lastIndex = end + 1;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

export default function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isOpen,
  onToggle,
  searchInputRef,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return searchConversations(conversations, searchQuery);
  }, [conversations, searchQuery]);

  const displayedConversations = searchResults
    ? searchResults.map((r) => r.item)
    : conversations;

  const matchMap = useMemo(
    () =>
      new Map(
        searchResults?.map((r) => [r.item.id, r.matches]) ?? []
      ),
    [searchResults]
  );
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      {/* Mobile hamburger button */}
      <button
        onClick={onToggle}
        className="fixed top-3 left-3 z-50 p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors md:hidden"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 h-full flex flex-col bg-sidebar-bg border-r border-sidebar-border transition-all duration-300 ease-in-out will-change-transform transition-theme ${
          isOpen
            ? "w-64 translate-x-0"
            : "w-64 -translate-x-full md:w-0 md:translate-x-0 md:overflow-hidden"
        }`}
      >
        <div className="flex flex-col h-full w-64">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              T3 Chat
            </h1>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => {
                  onNewChat();
                  if (window.innerWidth < 768) onToggle();
                }}
                className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                aria-label="New chat"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors md:hidden"
                aria-label="Close sidebar"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Search input */}
          <div className="px-3 pb-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchQuery("");
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                placeholder="Search chats..."
                className="w-full pl-8 pr-8 py-1.5 text-sm rounded-md border border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto px-2 pb-2 sidebar-scroll">
            {displayedConversations.length === 0 && searchQuery.trim() ? (
              <div className="text-center py-12 px-4">
                <p className="text-sm text-[var(--muted-foreground)]">
                  No matching chats
                </p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-sm text-[var(--muted-foreground)]">
                  No conversations
                </p>
              </div>
            ) : (
              <div className="space-y-px">
                {displayedConversations.map((conv) => {
                  const isActive = conv.id === currentConversationId;
                  const matches = matchMap.get(conv.id);

                  return (
                    <div
                      key={conv.id}
                      className={`group flex items-center rounded-md cursor-pointer transition-colors ${
                        isActive
                          ? "bg-[var(--sidebar-active)] text-[var(--foreground)]"
                          : "hover:bg-[var(--sidebar-hover)] text-[var(--muted-foreground)]"
                      }`}
                      onClick={() => {
                        onSelectConversation(conv.id);
                        if (window.innerWidth < 768) {
                          onToggle();
                          setSearchQuery("");
                        }
                      }}
                    >
                      <p className="flex-1 min-w-0 truncate text-sm px-3 py-2">
                        {searchQuery.trim() && matches ? (
                          <HighlightedText
                            text={conv.title}
                            matches={matches}
                          />
                        ) : (
                          conv.title
                        )}
                      </p>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conv.id);
                        }}
                        className={`flex-shrink-0 p-1 mr-1.5 rounded text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-all ${
                          isActive
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
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
          <div className="px-3 py-2">
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
