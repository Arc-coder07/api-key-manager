import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface DeleteKeyConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  keyName: string;
}

export function DeleteKeyConfirmation({
  isOpen,
  onClose,
  onConfirm,
  keyName,
}: DeleteKeyConfirmationProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="delete-key-modal"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-app/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative z-10 bg-card w-full max-w-sm rounded-[1.25rem] border border-border-subtle shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border-subtle/50 bg-status-red/5">
              <AlertTriangle className="text-status-red" size={20} />
              <h2 className="text-base font-semibold text-text-primary">Delete Key</h2>
              <button
                onClick={onClose}
                className="p-1 ml-auto text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-border-subtle/50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-text-secondary leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <strong className="text-text-primary">{keyName}</strong>?
                This action cannot be undone.
              </p>

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-status-red/5 border border-status-red/15">
                <AlertTriangle size={14} className="text-status-red shrink-0 mt-0.5" />
                <p className="text-xxs text-text-secondary leading-relaxed">
                  The encrypted key data will be permanently removed from your vault.
                  Make sure you have a backup if you still need this key.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="px-4 py-2 bg-status-red text-white rounded-lg text-sm font-medium hover:bg-status-red/90 transition-colors"
                >
                  Delete Key
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
