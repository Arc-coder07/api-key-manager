import { useState } from "react";
import { motion } from "framer-motion";
import { X, Eye, EyeOff, Shield, Loader2, AlertTriangle } from "lucide-react";
import { useVaultStore } from "../../stores/useVaultStore";

interface ChangePasswordModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function ChangePasswordModal({ onClose, onSuccess }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [localError, setLocalError] = useState("");

  const changeMasterPassword = useVaultStore((s) => s.changeMasterPassword);
  const isMigrating = useVaultStore((s) => s.isMigrating);
  const storeError = useVaultStore((s) => s.error);

  const passwordsMatch = newPassword === confirmPassword;
  const newIsStrong = newPassword.length >= 8;
  const isValid =
    currentPassword.trim() &&
    newPassword.trim() &&
    confirmPassword.trim() &&
    passwordsMatch &&
    newIsStrong &&
    !isMigrating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLocalError("");

    if (newPassword === currentPassword) {
      setLocalError("New password must be different from current password.");
      return;
    }

    const success = await changeMasterPassword(currentPassword, newPassword);

    if (success) {
      onSuccess?.();
      onClose();
    }
  };

  const displayError = localError || storeError;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isMigrating ? onClose : undefined}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-md mx-4 bg-card border border-border-subtle rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Shield size={18} className="text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Change Master Password
              </h3>
              <p className="text-xxs text-text-muted">
                All keys will be re-encrypted
              </p>
            </div>
          </div>
          {!isMigrating && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-border-subtle/50 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Warning Banner */}
        <div className="mx-5 mt-4 flex items-start gap-2.5 p-3 rounded-lg bg-status-amber/10 border border-status-amber/20">
          <AlertTriangle size={14} className="text-status-amber shrink-0 mt-0.5" />
          <p className="text-xxs text-text-secondary leading-relaxed">
            This will re-encrypt every API key in your vault with a new
            security envelope. Do not close the app during this process.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password..."
                disabled={isMigrating}
                autoFocus
                className="w-full px-3 py-2.5 pr-10 rounded-lg bg-app border border-border-subtle text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
              >
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters..."
                disabled={isMigrating}
                className="w-full px-3 py-2.5 pr-10 rounded-lg bg-app border border-border-subtle text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
              >
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {newPassword && !newIsStrong && (
              <p className="text-xxs text-status-red mt-1">
                Password must be at least 8 characters
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password..."
              disabled={isMigrating}
              className="w-full px-3 py-2.5 rounded-lg bg-app border border-border-subtle text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors disabled:opacity-50"
            />
            {confirmPassword && !passwordsMatch && (
              <p className="text-xxs text-status-red mt-1">
                Passwords do not match
              </p>
            )}
          </div>

          {/* Error */}
          {displayError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-status-red flex items-center gap-1.5 p-2.5 rounded-lg bg-status-red/10"
            >
              {displayError}
            </motion.p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isMigrating}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border-subtle text-sm font-medium text-text-secondary hover:bg-card-hover hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className={`
                flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                flex items-center justify-center gap-2
                ${
                  isValid
                    ? "bg-accent text-white hover:bg-accent-hover shadow-glow"
                    : "bg-border-subtle text-text-muted cursor-not-allowed"
                }
              `}
            >
              {isMigrating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Migrating...
                </>
              ) : (
                "Change Password"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
