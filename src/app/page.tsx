"use client";

import React, { useState, useCallback, useEffect } from "react";
import ChatWindow from "@/components/ChatWindow";
import Sidebar from "@/components/Sidebar";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import {
  listConversations,
  createConversation,
  updateConversation,
  deleteConversation,
  generateId,
} from "@/lib/conversations";
import type { Conversation } from "@/types";

function createNewConversation(): Conversation {
  return {
    id: generateId(),
    title: "New Chat",
    messages: [],
    provider: "openai",
    model: "gpt-4o-mini",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Load conversations from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const stored = listConversations();
    setConversations(stored);

    if (stored.length > 0) {
      setCurrentConversationId(stored[0].id);
    } else {
      // Create initial conversation
      const initial = createNewConversation();
      createConversation(initial);
      setConversations([initial]);
      setCurrentConversationId(initial.id);
    }

    // Default sidebar to closed on mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  const currentConversation =
    conversations.find((c) => c.id === currentConversationId) || null;

  const handleNewChat = useCallback(() => {
    const newConv = createNewConversation();
    createConversation(newConv);
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
  }, []);

  const handleSelectConversation = useCallback((id: string) => {
    setCurrentConversationId(id);
  }, []);

  const handleUpdateConversation = useCallback((updated: Conversation) => {
    updateConversation(updated);
    setConversations((prev) =>
      prev
        .map((c) => (c.id === updated.id ? updated : c))
        .sort((a, b) => b.updatedAt - a.updatedAt)
    );
  }, []);

  const handleDeleteConversation = useCallback(
    (id: string) => {
      deleteConversation(id);
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== id);

        // If we deleted the current conversation, switch to another or create new
        if (id === currentConversationId) {
          if (filtered.length > 0) {
            setCurrentConversationId(filtered[0].id);
          } else {
            const newConv = createNewConversation();
            createConversation(newConv);
            filtered.unshift(newConv);
            setCurrentConversationId(newConv.id);
          }
        }

        return filtered;
      });
    },
    [currentConversationId]
  );

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  // Avoid hydration mismatch — don't render until mounted
  if (!mounted) {
    return (
      <main className="h-screen flex bg-background overflow-hidden">
        {/* Sidebar skeleton */}
        <div className="hidden md:flex w-80 flex-col bg-sidebar-bg border-r border-sidebar-border">
          <div className="px-5 py-4 border-b border-[var(--sidebar-border)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--muted)] animate-pulse" />
            <div className="h-5 w-20 rounded bg-[var(--muted)] animate-pulse" />
          </div>
          <div className="px-4 py-3">
            <div className="h-11 rounded-xl bg-[var(--muted)] animate-pulse" />
          </div>
          <div className="px-3 space-y-2 mt-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-[var(--muted)] animate-pulse opacity-70"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
        {/* Chat area skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="h-14 border-b border-border bg-background animate-pulse" />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[var(--muted)] animate-pulse" />
              <div className="h-4 w-32 rounded bg-[var(--muted)] animate-pulse" />
            </div>
          </div>
          <div className="h-20 border-t border-border bg-background animate-pulse" />
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen flex bg-background overflow-hidden animate-fade-in-up">
      {/* Keyboard shortcuts handler */}
      <KeyboardShortcuts
        onNewChat={handleNewChat}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
      />

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatWindow
          conversation={currentConversation}
          onUpdateConversation={handleUpdateConversation}
          onNewChat={handleNewChat}
          onToggleSidebar={handleToggleSidebar}
        />
      </div>
    </main>
  );
}
