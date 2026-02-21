"use client";

import React, { useEffect, useState, useCallback, createContext, useContext } from "react";
import { X, AlertCircle, CheckCircle, Info } from "lucide-react";

// Toast types
interface Toast {
  id: string;
  message: string;
  type: "error" | "success" | "info";
  duration?: number;
}

interface ToastContextValue {
  addToast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue>({
  addToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const [isExiting, setIsExiting] = useState(false);

  const handleRemove = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 200);
  }, [toast.id, onRemove]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleRemove();
    }, toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, handleRemove]);

  const icons = {
    error: <AlertCircle size={20} className="text-red-500 flex-shrink-0 animate-scale-in" />,
    success: <CheckCircle size={20} className="text-green-500 flex-shrink-0 animate-scale-in" />,
    info: <Info size={20} className="text-blue-500 flex-shrink-0 animate-scale-in" />,
  };

  const borderColors = {
    error: "border-red-500/40",
    success: "border-green-500/40",
    info: "border-blue-500/40",
  };

  const accentBg = {
    error: "border-l-red-500",
    success: "border-l-green-500",
    info: "border-l-blue-500",
  };

  return (
    <div
      className={`flex items-center gap-4 px-6 py-4 rounded-2xl border ${borderColors[toast.type]} bg-card/80 backdrop-blur-md text-foreground animate-in slide-in-from-right-10 fade-in duration-500 shadow-2xl ${isExiting ? 'opacity-0 scale-95 transition-all duration-300' : ''}`}
      style={{ boxShadow: "var(--shadow-xl)" }}
    >
      <div className="flex-shrink-0">
        {icons[toast.type]}
      </div>
      <p className="text-[0.9375rem] font-medium flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={handleRemove}
        className="p-1.5 rounded-lg hover:bg-[var(--muted)] hover:scale-110 active:scale-90 transition-all duration-150 text-[var(--muted-foreground)] flex-shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2.5 max-w-md">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
