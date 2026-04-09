import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colorMap = {
  success: {
    icon: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
  },
  error: {
    icon: "text-status-red",
    bg: "bg-status-red/10",
    border: "border-status-red/20",
  },
  info: {
    icon: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
};

function ToastItem({ toast, onDismiss }: ToastProps) {
  const Icon = iconMap[toast.type];
  const colors = colorMap[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`
        flex items-start gap-3 w-80 p-4 rounded-xl
        ${colors.bg} border ${colors.border}
        backdrop-blur-md shadow-lg
      `}
    >
      <Icon className={`${colors.icon} shrink-0 mt-0.5`} size={18} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-text-muted mt-0.5">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-0.5 rounded text-text-muted hover:text-text-secondary transition-colors shrink-0"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
