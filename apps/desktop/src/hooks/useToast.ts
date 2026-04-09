import { useState, useCallback } from "react";
import type { ToastData, ToastType } from "../components/ui/Toast";

let toastCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback(
    (type: ToastType, title: string, description?: string, duration?: number) => {
      const id = `toast-${++toastCounter}`;
      const toast: ToastData = { id, type, title, description, duration };
      setToasts((prev) => [...prev, toast]);
      return id;
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (title: string, description?: string) => addToast("success", title, description),
    [addToast]
  );

  const error = useCallback(
    (title: string, description?: string) => addToast("error", title, description),
    [addToast]
  );

  const info = useCallback(
    (title: string, description?: string) => addToast("info", title, description),
    [addToast]
  );

  return { toasts, addToast, dismissToast, success, error, info };
}
