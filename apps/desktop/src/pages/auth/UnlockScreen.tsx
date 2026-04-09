import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useVaultStore } from "../../stores/useVaultStore";

export function UnlockScreen() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const unlock = useVaultStore((s) => s.unlock);
  const isLoading = useVaultStore((s) => s.isLoading);
  const error = useVaultStore((s) => s.error);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || isLoading) return;
    await unlock(password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-app">
      {/* Subtle background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative w-full max-w-sm mx-4"
      >
        {/* ─── Logo ────────────────────────────────── */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.1,
            }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-card border border-border-subtle mb-4"
          >
            <div className="relative">
              <Shield size={36} className="text-accent" />
              <Lock
                size={14}
                className="absolute -bottom-0.5 -right-0.5 text-text-muted bg-card rounded-full p-0.5"
              />
            </div>
          </motion.div>
          <h1 className="text-xl font-bold text-text-primary">Vault Locked</h1>
          <p className="text-sm text-text-muted mt-1">
            Enter your master password to continue
          </p>
        </div>

        {/* ─── Unlock Form ─────────────────────────── */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 rounded-2xl bg-card border border-border-subtle space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Master Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password..."
                  autoFocus
                  className={`
                    w-full px-4 py-3 pr-10 rounded-xl bg-app border text-sm
                    text-text-primary placeholder-text-muted
                    focus:outline-none transition-colors
                    ${
                      error
                        ? "border-status-red/50 focus:border-status-red/70"
                        : "border-border-subtle focus:border-accent/50"
                    }
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-status-red mt-2 flex items-center gap-1"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              disabled={!password.trim() || isLoading}
              className={`
                w-full py-3 rounded-xl text-sm font-medium transition-all duration-200
                flex items-center justify-center gap-2
                ${
                  password.trim() && !isLoading
                    ? "bg-accent text-white hover:bg-accent-hover shadow-glow"
                    : "bg-border-subtle text-text-muted cursor-not-allowed"
                }
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Unlocking...
                </>
              ) : (
                <>
                  <Lock size={14} />
                  Unlock Vault
                </>
              )}
            </button>
          </div>
        </form>

        {/* ─── Footer ──────────────────────────────── */}
        <p className="text-center text-xxs text-text-muted mt-6">
          Your vault is encrypted locally on this device
        </p>
      </motion.div>
    </div>
  );
}
