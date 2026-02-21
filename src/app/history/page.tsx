"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search, 
  Trash2, 
  ExternalLink, 
  MessageSquare,
  Clock,
  MessageCircle,
  Plus
} from "lucide-react";
import { listConversations, deleteConversation } from "@/lib/conversations";
import type { Conversation } from "@/types";
import ProviderBadge from "@/components/ProviderBadge";
import { formatTimeAgo } from "@/lib/utils";

export default function HistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load conversations from localStorage
    const loaded = listConversations();
    setConversations(loaded);
    setIsLoading(false);
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this conversation?")) {
      deleteConversation(id);
      setConversations(listConversations());
    }
  };

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    const query = searchQuery.toLowerCase();
    return conversations.filter((conv) => {
      const titleMatch = (conv.title || "").toLowerCase().includes(query);
      const messageMatch = (conv.messages || []).some((msg) => 
        (msg.content || "").toLowerCase().includes(query)
      );
      return titleMatch || messageMatch;
    });
  }, [conversations, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-theme">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-sidebar-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              aria-label="Back to Chat"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Chat History</h1>
          </div>
          <Link
            href="/"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={18} />
            Back to Chat
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Search */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search conversations by title or message content..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-sidebar-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search conversations"
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className="group relative flex flex-col p-5 rounded-xl bg-card border border-sidebar-border hover:border-primary/50 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <ProviderBadge providerId={conv.provider} />
                    <h3 className="font-semibold truncate text-foreground">
                      {conv.title || "Untitled Chat"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(conv.id, e)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 md:opacity-0 md:group-hover:opacity-100 transition-all"
                    title="Delete Conversation"
                    aria-label="Delete conversation"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5">
                  <div className="flex items-center gap-1.5">
                    <MessageCircle size={14} />
                    <span>{(conv.messages || []).length} messages</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>{formatTimeAgo(conv.updatedAt)}</span>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Model
                    </span>
                    <span className="text-[13px] font-mono text-foreground truncate">
                      {conv.model}
                    </span>
                  </div>
                  <Link
                    href={`/?id=${conv.id}`}
                    className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground text-sm font-medium transition-colors"
                  >
                    Open <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-sidebar-border shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted text-muted-foreground mb-4">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">No conversations found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              {searchQuery 
                ? `No results for "${searchQuery}". Try a different search term.` 
                : "You haven't started any conversations yet."}
            </p>
            {!searchQuery && (
              <Link
                href="/"
                className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                <Plus size={18} />
                Start your first chat
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
