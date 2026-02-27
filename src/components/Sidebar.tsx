"use client";

import React, { useState } from "react";
import { Plus, Trash2, X, Menu } from "lucide-react";
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
        className="fixed top-3 left-3 z-50 p-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors md:hidden"
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
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              T3 Chat
            </span>
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

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto sidebar-scroll px-2 pb-2">
            {conversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-sm text-[var(--muted-foreground)]">
                  No conversations
                </p>
              </div>
            ) : (
              <div className="space-y-px">
                {conversations.map((conv) => {
                  const isActive = conv.id === currentConversationId;
                  const isHovered = conv.id === hoveredId;

                  return (
                    <div
                      key={conv.id}
                      className={`group flex items-center rounded-md cursor-pointer transition-colors ${
                        isActive
                          ? "bg-[var(--sidebar-active)] text-[var(--foreground)]"
                          : "hover:bg-[var(--sidebar-hover)] text-[var(--muted-foreground)]"
                      }`}
                      onMouseEnter={() => setHoveredId(conv.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => {
                        onSelectConversation(conv.id);
                        if (window.innerWidth < 768) onToggle();
                      }}
                    >
                      <p className="flex-1 min-w-0 truncate text-sm px-3 py-2">
                        {conv.title}
                      </p>

                      {/* Delete button */}
                      {(isHovered || isActive) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conv.id);
                          }}
                          className="flex-shrink-0 p-1 mr-1.5 rounded text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--muted)] transition-colors"
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

          {/* Footer */}
          <div className="px-3 py-2">
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
