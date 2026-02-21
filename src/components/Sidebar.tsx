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
import { useToast } from "./Toast";
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
  const { addToast } = useToast();

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
        addToast({
          type: "success",
          message: "Conversation renamed",
          duration: 2000,
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
          className="fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-sm animate-fade-in"
          onClick={onToggle}
        />
      )}

      {/* Mobile hamburger button */}
      <button
        onClick={onToggle}
        className="fixed top-3 left-3 z-50 p-2.5 rounded-xl bg-card/90 backdrop-blur-lg border border-border/60 text-foreground md:hidden shadow-md active:scale-95 transition-all"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 h-full flex flex-col bg-sidebar-bg border-r border-sidebar-border transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
          isOpen
            ? "w-72 translate-x-0"
            : "w-72 -translate-x-full md:w-0 md:translate-x-0 md:overflow-hidden"
        }`}
      >
        <div className="flex flex-col h-full w-72">
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-[60px] border-b border-sidebar-border">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2.5 tracking-tight">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--gradient-primary)" }}
              >
                <MessageSquare size={16} className="text-white" strokeWidth={2.5} />
              </div>
              <span>T3 Chat</span>
            </h1>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                onClick={onToggle}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors md:hidden"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* New Chat button */}
          <div className="px-3 pt-3 pb-2">
            <button
              onClick={() => {
                onNewChat();
                if (window.innerWidth < 768) onToggle();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-white hover:brightness-110 active:scale-[0.98] transition-all duration-200 font-semibold text-sm relative overflow-hidden group"
              style={{ background: "var(--gradient-primary)" }}
            >
              <span className="flex items-center gap-2 relative z-10">
                <MessageSquarePlus size={16} strokeWidth={2.5} />
                New Chat
              </span>
              <kbd className="hidden sm:inline-flex items-center text-[10px] font-medium opacity-80 bg-white/20 px-1.5 py-0.5 rounded font-mono border border-white/10 relative z-10">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Search */}
          <div className="px-3 pb-2">
            <div className="relative group">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200"
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-muted/50 border border-sidebar-border focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-card rounded-lg py-2 pl-9 pr-8 text-sm outline-none transition-all placeholder:text-muted-foreground/50 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded hover:bg-muted transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto px-2 pb-2">
            {conversations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm animate-fade-in">
                <MessageSquare
                  size={32}
                  className="mx-auto mb-3 opacity-30"
                />
                <p className="font-medium text-sm">No conversations yet</p>
                <p className="text-xs mt-1 opacity-60">Start a new chat to begin</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm animate-fade-in">
                <Search size={32} className="mx-auto mb-3 opacity-20" />
                <p className="font-medium text-sm">No results found</p>
                <p className="text-xs mt-1 opacity-60">Try a different search term</p>
              </div>
            ) : (
              <div className="space-y-4">
                {groupedConversations.map(([groupName, items]) => (
                  <div key={groupName} className="animate-fade-in">
                    <div className="flex items-center gap-2 px-2.5 mb-1.5">
                      <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {groupName}
                      </h2>
                      <div className="h-px flex-1 bg-sidebar-border/60" />
                    </div>
                    <div className="space-y-0.5">
                      {items.map((conv, index) => {
                        const isActive = conv.id === currentConversationId;
                        const isHovered = conv.id === hoveredId;
                        const isEditing = conv.id === editingId;

                        return (
                          <div
                            key={conv.id}
                            className={`group relative flex items-center rounded-lg cursor-pointer transition-all duration-200 ${
                              isActive
                                ? "bg-primary/8 dark:bg-primary/10 border-l-2 border-primary"
                                : "hover:bg-muted/60 border-l-2 border-transparent"
                            }`}
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
                            <div className="flex-1 min-w-0 px-3 py-2.5">
                              {isEditing ? (
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    ref={editInputRef}
                                    type="text"
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    onBlur={() => handleSaveEdit()}
                                    onKeyDown={handleKeyDown}
                                    className="w-full bg-card border border-primary/50 rounded-md px-2 py-1 text-sm outline-none ring-2 ring-primary/10"
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSaveEdit();
                                    }}
                                    className="p-1 rounded text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10"
                                  >
                                    <Check size={14} />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2">
                                    <ProviderBadge providerId={conv.provider} />
                                    <p className={`text-[13px] leading-tight font-medium truncate ${isActive ? "text-foreground" : "text-foreground/80"}`}>
                                      {conv.title}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground/70">
                                    <span className="flex items-center gap-1">
                                      <MessageSquare size={10} className="opacity-60" strokeWidth={2.5} />
                                      {conv.messages.length}
                                    </span>
                                    <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/30" />
                                    <span className="truncate">{formatTimeAgo(conv.updatedAt)}</span>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Actions */}
                            {!isEditing && (isHovered || isActive) && (
                              <div className="flex items-center pr-2 gap-0.5 animate-fade-in">
                                <button
                                  onClick={(e) => handleStartEdit(e, conv)}
                                  className="p-1.5 rounded-md text-muted-foreground/50 hover:text-primary hover:bg-muted transition-all"
                                  aria-label="Edit title"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteConversation(conv.id);
                                    addToast({
                                      type: "info",
                                      message: "Conversation deleted",
                                      duration: 3000,
                                    });
                                  }}
                                  className="p-1.5 rounded-md text-muted-foreground/50 hover:text-destructive hover:bg-muted transition-all"
                                  aria-label="Delete conversation"
                                >
                                  <Trash2 size={12} />
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
          <div className="px-3 py-3 border-t border-sidebar-border">
            <button
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="w-full flex items-center justify-center gap-2 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg active:scale-[0.98] transition-all py-2"
            >
              <Keyboard size={13} />
              Shortcuts
            </button>
            {showShortcuts && (
              <div className="mt-2 p-3 rounded-lg bg-muted/50 border border-sidebar-border text-[11px] space-y-2.5 animate-fade-in-down">
                {[
                  { label: "New chat", key: "⌘K" },
                  { label: "Toggle sidebar", key: "⌘B" },
                  { label: "Send message", key: "Enter" },
                  { label: "New line", key: "⇧Enter" },
                ].map((shortcut) => (
                  <div key={shortcut.key} className="flex justify-between items-center">
                    <span className="text-muted-foreground">{shortcut.label}</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-card border border-border font-mono text-foreground text-[10px] font-medium">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
