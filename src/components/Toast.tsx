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
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const icons = {
    error: <AlertCircle size={18} className="text-red-500" />,
    success: <CheckCircle size={18} className="text-green-500" />,
    info: <Info size={18} className="text-blue-500" />,
  };

  const borderColors = {
    error: "border-red-500/30",
    success: "border-green-500/30",
    info: "border-blue-500/30",
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${borderColors[toast.type]} bg-[var(--card)] text-[var(--card-foreground)] shadow-lg animate-in slide-in-from-right fade-in duration-300`}
    >
      {icons[toast.type]}
      <p className="text-sm flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-1 rounded-lg hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)]"
      >
        <X size={14} />
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
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
