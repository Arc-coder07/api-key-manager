import { motion } from "framer-motion";
import { Shield, Zap, Loader2 } from "lucide-react";
import { useVaultStore } from "../../stores/useVaultStore";

export function OnboardingScreen() {
  const setup = useVaultStore((s) => s.setup);
  const isLoading = useVaultStore((s) => s.isLoading);
  const error = useVaultStore((s) => s.error);

  const handleGetStarted = async () => {
    if (isLoading) return;
    await setup();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-app relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative w-full max-w-md mx-4 px-4 text-center"
      >
        {/* ─── Logo & Icon ─────────────────────────── */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-accent/15 border border-accent/20 mb-6 "
        >
          <Shield size={40} className="text-accent" />
        </motion.div>

        {/* ─── Header & Description ────────────────── */}
        <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-1">
          Vaultic
        </h1>
        <p className="text-sm font-medium text-accent mb-3">
          Your API Keys, Organized
        </p>
        <p className="text-sm text-text-muted max-w-sm mx-auto leading-relaxed mb-8">
          Encrypted locally on your device with AES-256-GCM. No accounts, no cloud, no passwords needed.
        </p>

        {/* ─── Action Card ─────────────────────────── */}
        <div className="p-6 rounded-2xl bg-card border border-border-subtle shadow-xl space-y-4">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-status-red text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="button"
            onClick={handleGetStarted}
            disabled={isLoading}
            className={`
              w-full py-3.5 px-6 rounded-xl text-sm font-semibold transition-all duration-200
              flex items-center justify-center gap-2.5
              ${
                isLoading
                  ? "bg-accent/50 text-white/70 cursor-not-allowed"
                  : "bg-accent text-white hover:bg-accent-hover active:scale-[0.99] cursor-pointer"
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Setting up...</span>
              </>
            ) : (
              <>
                <Zap size={18} className="fill-current" />
                <span>Get Started</span>
              </>
            )}
          </button>
        </div>

        {/* ─── Footer ──────────────────────────────── */}
        <p className="text-center text-xs text-text-muted mt-6">
          🔒 AES-256-GCM · Zero-knowledge · Local-only
        </p>
      </motion.div>
    </div>
  );
}
