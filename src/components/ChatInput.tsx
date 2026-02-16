"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Square, Paperclip, X, FileText } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (
    e: React.FormEvent,
    options?: { experimental_attachments?: FileList }
  ) => void;
  onStop?: () => void;
  isLoading: boolean;
  placeholder?: string;
}

export default function ChatInput({
  input,
  setInput,
  onSubmit,
  onStop,
  isLoading,
  placeholder = "Send a message...",
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const [previews, setPreviews] = useState<
    Array<{ name: string; type: string; url: string }>
  >([]);
  const [isDragging, setIsDragging] = useState(false);

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [input, adjustHeight]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        if (p.url) URL.revokeObjectURL(p.url);
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (!selectedFiles || selectedFiles.length === 0) return;
      setFiles(selectedFiles);

      // Generate previews
      const newPreviews = Array.from(selectedFiles).map((file) => ({
        name: file.name,
        type: file.type,
        url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      }));
      setPreviews(newPreviews);
    },
    []
  );

  const handleRemoveFile = useCallback(
    (index: number) => {
      // Create a new DataTransfer to modify the FileList
      const dt = new DataTransfer();
      if (files) {
        Array.from(files).forEach((file, i) => {
          if (i !== index) dt.items.add(file);
        });
      }
      const newFiles = dt.files.length > 0 ? dt.files : undefined;
      setFiles(newFiles);

      // Clean up preview URL
      if (previews[index]?.url) URL.revokeObjectURL(previews[index].url);
      setPreviews((prev) => prev.filter((_, i) => i !== index));

      if (fileInputRef.current) {
        fileInputRef.current.files = newFiles || new DataTransfer().files;
      }
    },
    [files, previews]
  );

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!isLoading && (input.trim() || files)) {
        onSubmit(
          e,
          files ? { experimental_attachments: files } : undefined
        );
        // Clear files after submit
        setFiles(undefined);
        setPreviews((prev) => {
          prev.forEach((p) => {
            if (p.url) URL.revokeObjectURL(p.url);
          });
          return [];
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [isLoading, input, files, onSubmit]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send, Shift+Enter for newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && (input.trim() || files)) {
        handleFormSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the container (not entering a child)
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      setFiles(droppedFiles);

      // Generate previews (same logic as handleFileChange)
      const newPreviews = Array.from(droppedFiles).map((file) => ({
        name: file.name,
        type: file.type,
        url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      }));
      setPreviews(newPreviews);
    }
  }, []);

  return (
    <div
      className="border-t border-[var(--border)] bg-[var(--background)] px-4 py-5 md:px-6 relative"
      style={{ boxShadow: "0 -1px 3px rgba(0,0,0,0.04)" }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag-and-drop overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--primary)]/10 border-2 border-dashed border-[var(--primary)] rounded-2xl pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-[var(--primary)]">
            <Paperclip size={32} />
            <span className="font-medium text-sm">Drop files here to attach</span>
          </div>
        </div>
      )}

      {/* Attachment previews */}
      {previews.length > 0 && (
        <div className="max-w-[48rem] mx-auto px-4 md:px-6 pb-2 flex gap-2 flex-wrap">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="relative group flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              {preview.type.startsWith("image/") && preview.url ? (
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="w-10 h-10 object-cover rounded-lg"
                />
              ) : (
                <FileText
                  size={20}
                  className="text-[var(--muted-foreground)]"
                />
              )}
              <span className="max-w-[120px] truncate text-[var(--foreground)]">
                {preview.name}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="p-1 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors"
                aria-label={`Remove ${preview.name}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt,.csv,.json,.md"
        className="hidden"
      />

      <form
        onSubmit={handleFormSubmit}
        className="max-w-[48rem] mx-auto flex items-end gap-3.5"
      >
        {/* Attach button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 p-3.5 rounded-2xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-all"
          aria-label="Attach files"
          disabled={isLoading}
        >
          <Paperclip size={20} />
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={isLoading}
            className="w-full resize-none rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-5 py-3.5 pr-5 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              minHeight: "52px",
              maxHeight: "200px",
              boxShadow: "var(--shadow-sm)",
            }}
          />
        </div>

        {isLoading ? (
          <button
            type="button"
            onClick={onStop}
            className="flex-shrink-0 p-3.5 rounded-2xl bg-[var(--destructive)] text-white hover:opacity-90 transition-opacity"
            aria-label="Stop generating"
          >
            <Square size={20} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={(!input.trim() && !files) || isLoading}
            className="flex-shrink-0 p-3.5 rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              boxShadow:
                input.trim() || files
                  ? "0 2px 8px rgba(79, 70, 229, 0.2)"
                  : "none",
            }}
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        )}
      </form>

      <p className="text-center text-[0.6875rem] text-[var(--muted-foreground)] mt-3 max-w-[48rem] mx-auto opacity-75 tracking-wide">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
