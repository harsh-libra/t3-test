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
      <main className="h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[var(--primary)] flex items-center justify-center animate-pulse">
            <span className="text-white text-lg font-bold">T3</span>
          </div>
          <p className="text-[var(--muted-foreground)] text-sm animate-pulse">
            Loading T3 Chat...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen flex bg-[var(--background)] overflow-hidden">
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
