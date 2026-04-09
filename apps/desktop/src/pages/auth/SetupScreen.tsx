import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, AlertTriangle, Check, Loader2 } from "lucide-react";
import { useVaultStore } from "../../stores/useVaultStore";

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "#ef4444" };
  if (score <= 2) return { score, label: "Fair", color: "#f59e0b" };
  if (score <= 3) return { score, label: "Good", color: "#eab308" };
  if (score <= 4) return { score, label: "Strong", color: "#10b981" };
  return { score, label: "Excellent", color: "#059669" };
}

export function SetupScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [step, setStep] = useState<"create" | "confirm">("create");

  const setup = useVaultStore((s) => s.setup);
  const isLoading = useVaultStore((s) => s.isLoading);
  const error = useVaultStore((s) => s.error);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const passwordsMatch = password === confirmPassword;
  const canProceed = password.length >= 8 && strength.score >= 2;
  const canSubmit =
    canProceed && passwordsMatch && acknowledged && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    await setup(password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-app">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md mx-4"
      >
        {/* ─── Logo & Welcome ──────────────────────── */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/15 mb-4"
          >
            <Shield size={32} className="text-accent" />
          </motion.div>
          <h1 className="text-2xl font-bold text-text-primary">
            Welcome to Vaultic
          </h1>
          <p className="text-sm text-text-muted mt-2 max-w-sm mx-auto">
            Create a master password to encrypt your API keys.
            This password is never stored — only you can unlock your vault.
          </p>
        </div>

        {/* ─── Form Card ───────────────────────────── */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 rounded-2xl bg-card border border-border-subtle space-y-5">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <div
                className={`flex items-center gap-1.5 text-xs font-medium ${
                  step === "create" ? "text-accent" : "text-text-muted"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xxs font-bold ${
                    step === "create"
                      ? "bg-accent text-white"
                      : "bg-accent/20 text-accent"
                  }`}
                >
                  {step === "confirm" ? <Check size={12} /> : "1"}
                </span>
                Create
              </div>
              <div className="w-8 h-px bg-border-subtle" />
              <div
                className={`flex items-center gap-1.5 text-xs font-medium ${
                  step === "confirm" ? "text-accent" : "text-text-muted"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xxs font-bold ${
                    step === "confirm"
                      ? "bg-accent text-white"
                      : "bg-border-subtle text-text-muted"
                  }`}
                >
                  2
                </span>
                Confirm
              </div>
            </div>

            {step === "create" ? (
              <>
                {/* ─── Password Input ──────────────────── */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Master Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Choose a strong password..."
                      autoFocus
                      className="w-full px-4 py-3 pr-10 rounded-xl bg-app border border-border-subtle text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* ─── Strength Meter ──────────────────── */}
                {password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-muted">Strength</span>
                      <span
                        className="text-xs font-medium"
                        style={{ color: strength.color }}
                      >
                        {strength.label}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                          style={{
                            backgroundColor:
                              i <= strength.score ? strength.color : "#2a2a30",
                          }}
                        />
                      ))}
                    </div>
                    <ul className="space-y-1">
                      {[
                        { check: password.length >= 8, text: "At least 8 characters" },
                        { check: /[a-z]/.test(password) && /[A-Z]/.test(password), text: "Mix of upper & lowercase" },
                        { check: /\d/.test(password), text: "Contains a number" },
                        { check: /[^a-zA-Z0-9]/.test(password), text: "Contains a symbol" },
                      ].map((rule) => (
                        <li
                          key={rule.text}
                          className={`flex items-center gap-1.5 text-xxs ${
                            rule.check ? "text-accent" : "text-text-muted"
                          }`}
                        >
                          {rule.check ? (
                            <Check size={10} />
                          ) : (
                            <div className="w-2.5 h-2.5 rounded-full border border-border-subtle" />
                          )}
                          {rule.text}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Next button */}
                <button
                  type="button"
                  disabled={!canProceed}
                  onClick={() => setStep("confirm")}
                  className={`
                    w-full py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${
                      canProceed
                        ? "bg-accent text-white hover:bg-accent-hover shadow-glow"
                        : "bg-border-subtle text-text-muted cursor-not-allowed"
                    }
                  `}
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                {/* ─── Confirm Password ────────────────── */}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Confirm Master Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password..."
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-app border border-border-subtle text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                  />
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-status-red mt-1.5"
                    >
                      Passwords do not match
                    </motion.p>
                  )}
                  {confirmPassword.length > 0 && passwordsMatch && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-1 text-xs text-accent mt-1.5"
                    >
                      <Check size={12} />
                      Passwords match
                    </motion.p>
                  )}
                </div>

                {/* ─── Acknowledgment ──────────────────── */}
                <div className="p-3 rounded-xl bg-status-amber/5 border border-status-amber/15">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle
                      size={16}
                      className="text-status-amber shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        <strong className="text-status-amber">
                          No password recovery.
                        </strong>{" "}
                        If you forget this password, your encrypted keys
                        cannot be recovered. We never store your password.
                      </p>
                      <label className="flex items-center gap-2 mt-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={acknowledged}
                          onChange={(e) => setAcknowledged(e.target.checked)}
                          className="rounded border-border-subtle text-accent focus:ring-accent/30 bg-app"
                        />
                        <span className="text-xs text-text-secondary">
                          I understand this cannot be recovered
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <p className="text-xs text-status-red text-center">{error}</p>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("create")}
                    className="flex-1 py-3 rounded-xl border border-border-subtle text-sm font-medium text-text-secondary hover:bg-card-hover transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={!canSubmit || isLoading}
                    className={`
                      flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200
                      flex items-center justify-center gap-2
                      ${
                        canSubmit && !isLoading
                          ? "bg-accent text-white hover:bg-accent-hover shadow-glow"
                          : "bg-border-subtle text-text-muted cursor-not-allowed"
                      }
                    `}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Encrypting...
                      </>
                    ) : (
                      "Create Vault"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </form>

        {/* ─── Footer ──────────────────────────────── */}
        <p className="text-center text-xxs text-text-muted mt-6">
          🔒 Encrypted with AES-256-GCM · PBKDF2 100,000 iterations
        </p>
      </motion.div>
    </div>
  );
}
