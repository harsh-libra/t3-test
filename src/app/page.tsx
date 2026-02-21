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
      <main className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center animate-scale-in">
            <span className="text-white text-xl font-bold">T3</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-foreground font-medium text-sm animate-fade-in-up animation-delay-150">
              T3 Chat
            </p>
            <div className="flex gap-1.5 animate-fade-in-up animation-delay-300">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-typing-dot" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-typing-dot animation-delay-150" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-typing-dot animation-delay-300" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen flex bg-background overflow-hidden animate-fade-in">
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
        onUpdateConversation={handleUpdateConversation}
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
