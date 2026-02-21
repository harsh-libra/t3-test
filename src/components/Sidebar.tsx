"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
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
  Search,
  Edit2,
  Check,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import type { Conversation } from "@/types";
import { groupConversations } from "@/lib/conversations";

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onUpdateConversation: (conversation: Conversation) => void;
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
  onUpdateConversation,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    return conversations.filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const groupedConversations = useMemo(() => {
    return groupConversations(filteredConversations);
  }, [filteredConversations]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleStartEdit = (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const handleSaveEdit = (e?: React.FormEvent | React.FocusEvent) => {
    if (e) e.preventDefault();
    if (editingId) {
      const conv = conversations.find((c) => c.id === editingId);
      if (conv && editingTitle.trim() && editingTitle !== conv.title) {
        onUpdateConversation({
          ...conv,
          title: editingTitle.trim(),
          updatedAt: Date.now(),
        });
      }
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-md animate-fade-in"
          onClick={onToggle}
        />
      )}

      {/* Mobile hamburger button */}
      <button
        onClick={onToggle}
        className="fixed top-3 left-3 z-50 p-2.5 rounded-xl bg-card/90 backdrop-blur-lg border border-border text-foreground md:hidden shadow-lg active:scale-95 transition-all"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 h-full flex flex-col bg-sidebar-bg/95 md:bg-sidebar-bg backdrop-blur-xl border-r border-sidebar-border transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] transition-theme ${
          isOpen
            ? "w-80 translate-x-0"
            : "w-80 -translate-x-full md:w-0 md:translate-x-0 md:overflow-hidden"
        }`}
      >
        <div className="flex flex-col h-full w-80">
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-5 border-b border-[var(--sidebar-border)]"
          >
            <h1 className="text-xl font-extrabold text-[var(--foreground)] flex items-center gap-3 tracking-tighter">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-indigo-500/20 shadow-lg"
                style={{ background: "var(--gradient-primary)" }}
              >
                <MessageSquare size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <span>T3 Chat</span>
            </h1>
            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <button
                onClick={onToggle}
                className="p-2 rounded-xl hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors md:hidden"
                aria-label="Close sidebar"
              >
                <X size={20} />
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
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-white hover:brightness-110 active:scale-[0.98] transition-all duration-300 font-bold text-sm relative overflow-hidden group border border-white/20 shadow-[0_8px_20px_-4px_rgba(79,70,229,0.4)] dark:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.5)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none" />
              <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
              <span className="flex items-center gap-2.5 relative z-10">
                <MessageSquarePlus size={19} strokeWidth={2.5} className="group-hover:rotate-6 transition-transform duration-500" />
                New Chat
              </span>
              <kbd className="hidden sm:inline-flex items-center text-[10px] font-bold opacity-90 bg-white/20 dark:bg-black/20 px-2 py-0.5 rounded-md font-mono border border-white/20 relative z-10 shadow-sm backdrop-blur-sm">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative group px-1">
              <Search
                size={14}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-all duration-200"
              />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--muted)]/50 border border-[var(--sidebar-border)] focus:border-[var(--primary)]/50 focus:ring-4 focus:ring-[var(--primary)]/5 focus:bg-[var(--card)] rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-[var(--muted-foreground)]/60 font-medium shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-full hover:bg-[var(--muted)] transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            {conversations.length === 0 ? (
              <div className="text-center py-10 text-[var(--muted-foreground)] text-sm animate-fade-in">
                <MessageSquare
                  size={36}
                  className="mx-auto mb-3 opacity-40"
                />
                <p className="font-medium">No conversations yet</p>
                <p className="text-xs mt-1.5 opacity-75">Start a new chat to begin</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-10 text-[var(--muted-foreground)] text-sm animate-fade-in">
                <Search size={36} className="mx-auto mb-3 opacity-20" />
                <p className="font-medium">No results found</p>
                <p className="text-xs mt-1.5 opacity-75">Try a different search term</p>
              </div>
            ) : (
              <div className="space-y-5">
                {groupedConversations.map(([groupName, items]) => (
                  <div key={groupName} className="space-y-1 animate-fade-in mb-4 last:mb-0">
                    <div className="flex items-center gap-2 px-3 mb-2">
                      <h2 className="text-[11px] font-extrabold text-[var(--muted-foreground)] uppercase tracking-[0.15em]">
                        {groupName}
                      </h2>
                      <div className="h-[1px] flex-1 bg-[var(--sidebar-border)]/50" />
                    </div>
                    <div className="space-y-1.5">
                      {items.map((conv, index) => {
                        const isActive = conv.id === currentConversationId;
                        const isHovered = conv.id === hoveredId;
                        const isEditing = conv.id === editingId;

                        return (
                          <div
                            key={conv.id}
                            className={`group relative flex items-center rounded-xl cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] animate-fade-in-up border ${
                              isActive
                                ? "bg-white dark:bg-slate-900 shadow-md border-[var(--sidebar-border)] scale-[1.02] z-10"
                                : "hover:bg-[var(--muted)]/60 border-transparent hover:border-[var(--sidebar-border)]/50"
                            }`}
                            style={{ 
                              animationDelay: `${Math.min(index * 40, 300)}ms`,
                            }}
                            onMouseEnter={() => setHoveredId(conv.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            onClick={() => {
                              if (!isEditing) {
                                onSelectConversation(conv.id);
                                if (window.innerWidth < 768) onToggle();
                              }
                            }}
                            onDoubleClick={(e) => handleStartEdit(e, conv)}
                          >
                            {/* Active indicator */}
                            {isActive && (
                              <div className="absolute left-0 top-2 bottom-2 w-1 bg-[var(--primary)] rounded-r-full shadow-[2px_0_8px_var(--primary)] z-10" />
                            )}

                            <div className="flex-1 min-w-0 px-4 py-3">
                              {isEditing ? (
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    ref={editInputRef}
                                    type="text"
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    onBlur={() => handleSaveEdit()}
                                    onKeyDown={handleKeyDown}
                                    className="w-full bg-[var(--card)] border border-[var(--primary)] rounded-md px-2 py-1 text-sm outline-none shadow-[0_0_0_2px_rgba(79,70,229,0.1)]"
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSaveEdit();
                                    }}
                                    className="p-1 rounded-md text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10"
                                  >
                                    <Check size={14} />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2.5">
                                    <ProviderBadge providerId={conv.provider} />
                                    <p className={`text-[14px] leading-tight font-semibold truncate ${isActive ? "text-[var(--foreground)]" : "text-[var(--foreground)]/85"}`}>
                                      {conv.title}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2.5 mt-1.5 text-[11px] font-medium text-[var(--muted-foreground)]/80 tracking-tight">
                                    <span className="flex items-center gap-1 shrink-0">
                                      <MessageSquare size={11} className="opacity-70" strokeWidth={2.5} />
                                      {conv.messages.length}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-[var(--muted-foreground)]/30 shrink-0" />
                                    <span className="truncate">{formatTimeAgo(conv.updatedAt)}</span>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Actions */}
                            {!isEditing && (isHovered || isActive) && (
                              <div className="flex items-center pr-2.5 animate-fade-in">
                                <button
                                  onClick={(e) => handleStartEdit(e, conv)}
                                  className="p-1.5 rounded-lg text-[var(--muted-foreground)]/60 hover:text-[var(--primary)] hover:bg-[var(--muted)] transition-all duration-150"
                                  aria-label="Edit title"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteConversation(conv.id);
                                  }}
                                  className="p-1.5 rounded-lg text-[var(--muted-foreground)]/60 hover:text-[var(--destructive)] hover:bg-[var(--muted)] transition-all duration-150"
                                  aria-label="Delete conversation"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with shortcuts */}
          <div className="px-4 py-4 border-t border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]/50 backdrop-blur-md">
            <button
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-xl active:scale-[0.98] transition-all duration-200 py-2.5 border border-transparent hover:border-[var(--sidebar-border)]"
            >
              <Keyboard size={15} strokeWidth={2} />
              Keyboard shortcuts
            </button>
            {showShortcuts && (
              <div className="mt-3 p-4 rounded-xl bg-[var(--muted)]/50 border border-[var(--sidebar-border)] text-xs space-y-3 animate-fade-in-down shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="tracking-wide">New chat</span>
                  <kbd
                    className="px-2 py-0.5 rounded-md bg-[var(--card)] border border-[var(--border)] font-mono text-[var(--foreground)] font-bold shadow-sm"
                  >
                    ⌘K
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="tracking-wide">Toggle sidebar</span>
                  <kbd
                    className="px-2 py-0.5 rounded-md bg-[var(--card)] border border-[var(--border)] font-mono text-[var(--foreground)] font-bold shadow-sm"
                  >
                    ⌘B
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="tracking-wide">Send message</span>
                  <kbd
                    className="px-2 py-0.5 rounded-md bg-[var(--card)] border border-[var(--border)] font-mono text-[var(--foreground)] font-bold shadow-sm"
                  >
                    Enter
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="tracking-wide">New line</span>
                  <kbd
                    className="px-2 py-0.5 rounded-md bg-[var(--card)] border border-[var(--border)] font-mono text-[var(--foreground)] font-bold shadow-sm"
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
