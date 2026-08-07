import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useVaultStore } from "../stores/useVaultStore";
import { ChangePasswordModal } from "../components/vault/ChangePasswordModal";
import { ToastContainer } from "../components/ui/Toast";
import { useToast } from "../hooks/useToast";
import {
  Shield,
  Upload,
  Info,
  ChevronRight,
  Lock,
  LockOpen,
  Clock,
  Clipboard,
  FileDown,
  FileUp,
  Zap,
  Eye,
  EyeOff,
  Loader2,
  Check,
  History,
} from "lucide-react";

// Animated settings row
function SettingRow({
  icon,
  label,
  description,
  value,
  action,
  onAction,
  danger,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  value?: string;
  action?: string;
  onAction?: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <motion.div
      whileHover={disabled ? {} : { backgroundColor: "rgba(26, 26, 31, 0.8)" }}
      className={`flex items-center justify-between p-4 rounded-xl bg-card border border-border-subtle transition-colors ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
      onClick={disabled ? undefined : onAction}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${danger ? "bg-status-red/10" : "bg-accent/10"}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">{label}</p>
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {value && (
          <span className="text-sm text-text-secondary font-mono px-2 py-1 rounded-md bg-border-subtle/30">
            {value}
          </span>
        )}
        {action && (
          <button className="px-3 py-1.5 rounded-lg bg-border-subtle/50 text-xs font-medium text-text-secondary hover:bg-card-hover hover:text-text-primary transition-colors">
            {action}
          </button>
        )}
        <ChevronRight size={14} className="text-text-muted" />
      </div>
    </motion.div>
  );
}

// Password enable modal
function EnablePasswordModal({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const enablePassword = useVaultStore((s) => s.enablePassword);

  const passwordsMatch = password === confirmPassword;
  const canSubmit = password.length >= 8 && passwordsMatch && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    const ok = await enablePassword(password);
    if (ok) {
      onClose();
    } else {
      setError("Failed to enable password");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bg-overlay/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-sm bg-sidebar border border-border-subtle rounded-2xl shadow-xl"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-accent/10">
              <Lock size={18} className="text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Enable Password Lock</h3>
              <p className="text-xxs text-text-muted mt-0.5">Your keys will stay encrypted — the password adds an extra layer</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters..."
                autoFocus
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-app border border-border-subtle text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password..."
              className="w-full px-4 py-2.5 rounded-xl bg-app border border-border-subtle text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-xs text-status-red mt-1">Passwords do not match</p>
            )}
            {confirmPassword.length > 0 && passwordsMatch && (
              <p className="flex items-center gap-1 text-xs text-accent mt-1">
                <Check size={12} /> Passwords match
              </p>
            )}
          </div>

          {error && <p className="text-xs text-status-red text-center">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border-subtle text-sm font-medium text-text-secondary hover:bg-card-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                canSubmit && !isSubmitting
                  ? "bg-accent text-white hover:bg-accent-hover "
                  : "bg-border-subtle text-text-muted cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <><Loader2 size={14} className="animate-spin" /> Enabling...</>
              ) : (
                <><Lock size={14} /> Enable</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Password disable modal
function DisablePasswordModal({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const disablePassword = useVaultStore((s) => s.disablePassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    const ok = await disablePassword(password);
    if (ok) {
      onClose();
    } else {
      setError("Incorrect password");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bg-overlay/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-sm bg-sidebar border border-border-subtle rounded-2xl shadow-xl"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-status-amber/10">
              <LockOpen size={18} className="text-status-amber" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Disable Password Lock</h3>
              <p className="text-xxs text-text-muted mt-0.5">Enter your current password to confirm</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Current Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password..."
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl bg-app border border-border-subtle text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          {error && <p className="text-xs text-status-red text-center">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border-subtle text-sm font-medium text-text-secondary hover:bg-card-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password.trim() || isSubmitting}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                password.trim() && !isSubmitting
                  ? "bg-status-amber text-white hover:bg-status-amber/80"
                  : "bg-border-subtle text-text-muted cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <><Loader2 size={14} className="animate-spin" /> Disabling...</>
              ) : (
                <><LockOpen size={14} /> Disable</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export function SettingsPage() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEnablingPassword, setIsEnablingPassword] = useState(false);
  const [isDisablingPassword, setIsDisablingPassword] = useState(false);
  const navigate = useNavigate();
  const { toasts, dismissToast } = useToast();

  const config = useVaultStore((s) => s.config);
  const updateConfig = useVaultStore((s) => s.updateConfig);
  const isMigrating = useVaultStore((s) => s.isMigrating);
  const migrationProgress = useVaultStore((s) => s.migrationProgress);

  const sessionHistory = useVaultStore((s) => s.sessionHistory);
  const sessionStartedAt = useVaultStore((s) => s.sessionStartedAt);
  const loadSessionHistory = useVaultStore((s) => s.loadSessionHistory);
  const loadSecurityState = useVaultStore((s) => s.loadSecurityState);

  useEffect(() => {
    loadSessionHistory();
    loadSecurityState();
  }, [loadSessionHistory, loadSecurityState]);

  const passwordEnabled = config?.passwordEnabled ?? false;
  const autoLock = config?.autoLockMinutes ?? 15;
  const clipboardClear = config?.clipboardClearSeconds ?? 30;

  const handleAutoLockCycle = () => {
    if (isMigrating) return;
    const options = [0, 5, 15, 30, 60];
    const currentIndex = options.indexOf(autoLock);
    const nextVal = options[(currentIndex + 1) % options.length];
    updateConfig({ autoLockMinutes: nextVal });
  };

  const handleClipboardCycle = () => {
    if (isMigrating) return;
    const options = [10, 30, 60, 120];
    const currentIndex = options.indexOf(clipboardClear);
    const nextVal = options[(currentIndex + 1) % options.length];
    updateConfig({ clipboardClearSeconds: nextVal });
  };

  return (
    <div className="flex flex-col h-full">
      <header className="px-8 py-5 border-b border-border-subtle">
        <h2 className="text-lg font-semibold text-text-primary">Settings</h2>
        <p className="text-sm text-text-muted mt-0.5">
          Configure your vault and preferences
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-6 relative">
        {/* Migration Lock Overlay */}
        <AnimatePresence>
          {isMigrating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-app/60 backdrop-blur-sm"
            >
              <div className="bg-card border border-accent/20 p-8 rounded-2xl max-w-sm w-full shadow-2xl text-center">
                <Lock size={32} className="text-accent mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-bold text-text-primary mb-2">Updating Password</h3>
                <p className="text-sm text-text-secondary mb-6">
                  Applying new security envelope. This should be instant.
                </p>
                {migrationProgress && (
                  <div className="w-full bg-border-subtle rounded-full h-2 overflow-hidden mb-2">
                    <motion.div
                      className="bg-accent h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${migrationProgress.total > 0 ? (migrationProgress.current / migrationProgress.total) * 100 : 0}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
                <p className="text-xs text-text-muted font-mono">
                  {migrationProgress
                    ? `Processing ${migrationProgress.current} / ${migrationProgress.total}`
                    : "Initializing..."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`space-y-8 max-w-2xl transition-all duration-300 ${
            isMigrating ? "blur-[2px] opacity-40 pointer-events-none select-none" : ""
          }`}
        >
          {/* ─── Security Section ──────────────────────── */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-widest">
              <Shield size={14} className="text-accent" />
              Security
            </h3>
            <div className="space-y-2">
              {/* Password Lock Toggle */}
              <SettingRow
                icon={passwordEnabled
                  ? <Lock size={16} className="text-accent" />
                  : <LockOpen size={16} className="text-accent" />
                }
                label="Password lock"
                description={passwordEnabled
                  ? "Password required on app launch and after inactivity"
                  : "No password needed — keys are still encrypted"
                }
                value={passwordEnabled ? "On" : "Off"}
                action={passwordEnabled ? "Disable" : "Enable"}
                onAction={() => {
                  if (passwordEnabled) {
                    setIsDisablingPassword(true);
                  } else {
                    setIsEnablingPassword(true);
                  }
                }}
              />

              {/* Auto-lock — only when password is enabled */}
              <SettingRow
                icon={<Clock size={16} className={passwordEnabled ? "text-accent" : "text-text-muted"} />}
                label="Auto-lock timeout"
                description={passwordEnabled ? "Lock the vault after inactivity" : "Enable password lock to use auto-lock"}
                value={passwordEnabled ? (autoLock === 0 ? "Never" : `${autoLock} min`) : "—"}
                action={passwordEnabled ? "Change" : undefined}
                onAction={passwordEnabled ? handleAutoLockCycle : undefined}
                disabled={!passwordEnabled}
              />

              {/* Clipboard auto-clear */}
              <SettingRow
                icon={<Clipboard size={16} className="text-accent" />}
                label="Clipboard auto-clear"
                description="Clear clipboard after copying a key"
                value={`${clipboardClear}s`}
                action="Change"
                onAction={handleClipboardCycle}
              />

              {/* Change password — only when password is enabled */}
              {passwordEnabled && (
                <SettingRow
                  icon={<Lock size={16} className="text-accent" />}
                  label="Change password"
                  description="Update your vault password — no re-encryption needed"
                  action="Change"
                  onAction={() => setIsChangingPassword(true)}
                />
              )}
            </div>
          </section>

          {/* ─── Import/Export Section ──────────────────── */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-widest">
              <Upload size={14} className="text-accent" />
              Import & Export
            </h3>
            <div className="space-y-2">
              <SettingRow
                icon={<FileUp size={16} className="text-accent" />}
                label="Import from .env"
                description="Parse and import keys from an environment file"
                action="Import"
                onAction={() => navigate("/vault", { state: { openImport: true } })}
              />
              <SettingRow
                icon={<FileDown size={16} className="text-accent" />}
                label="Export keys"
                description="Export project keys as .env or JSON"
                action="Export"
                onAction={() => navigate("/vault", { state: { openExport: true } })}
              />
            </div>
          </section>

          {/* ─── Plan Section ──────────────────────────── */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-widest">
              <Zap size={14} className="text-accent" />
              Plan
            </h3>
            <div className="p-5 rounded-xl bg-gradient-to-br from-accent/5 to-tier-paid/5 border border-accent/15">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Free Plan</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    15 keys · 3 projects · 5 API searches/day
                  </p>
                </div>
                <button className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors">
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </section>

          {/* ─── About Section ─────────────────────────── */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-widest">
              <Info size={14} className="text-accent" />
              About
            </h3>
            <div className="p-5 rounded-xl bg-card border border-border-subtle">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/15">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Vaultic</p>
                  <p className="text-xs text-text-muted">v0.1.0</p>
                </div>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Encrypted API key vault for developers.
                Your keys are always encrypted locally with AES-256-GCM.
                {passwordEnabled
                  ? " Your encryption key is protected by your master password."
                  : " No password needed — your encryption key is managed automatically."}
              </p>
            </div>
          </section>

          {/* ─── Session History Section ──────────────── */}
          {passwordEnabled && (
            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-widest">
                <History size={14} className="text-accent" />
                Session History
              </h3>
              <div className="p-5 rounded-xl bg-card border border-border-subtle space-y-3">
                {/* Current session info */}
                {sessionStartedAt && (
                  <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Current Session</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        Started {new Date(sessionStartedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xxs font-medium bg-accent/10 text-accent">Active</span>
                  </div>
                )}

                {/* Recent events */}
                {sessionHistory.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {[...sessionHistory].reverse().slice(0, 20).map((event, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-border-subtle/30 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            event.type === 'unlock' ? 'bg-accent' :
                            event.type === 'failed_attempt' ? 'bg-status-red' :
                            event.type === 'lock' || event.type === 'auto_lock' ? 'bg-status-amber' :
                            'bg-text-muted'
                          }`} />
                          <span className="text-xs text-text-secondary">
                            {event.type === 'unlock' ? 'Unlocked' :
                             event.type === 'lock' ? 'Locked' :
                             event.type === 'auto_lock' ? 'Auto-locked' :
                             event.type === 'failed_attempt' ? 'Failed attempt' :
                             event.type === 'password_changed' ? 'Password changed' :
                             event.type === 'password_enabled' ? 'Password enabled' :
                             event.type === 'password_disabled' ? 'Password disabled' :
                             event.type}
                          </span>
                        </div>
                        <span className="text-xxs text-text-muted font-mono">
                          {new Date(event.timestamp).toLocaleString(undefined, {
                            month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted text-center py-2">
                    No session events yet
                  </p>
                )}
              </div>
            </section>
          )}
        </motion.div>
      </div>

      {/* Change Password Modal */}
      {isChangingPassword && (
        <ChangePasswordModal onClose={() => setIsChangingPassword(false)} />
      )}

      {/* Enable Password Modal */}
      <AnimatePresence>
        {isEnablingPassword && (
          <EnablePasswordModal onClose={() => setIsEnablingPassword(false)} />
        )}
      </AnimatePresence>

      {/* Disable Password Modal */}
      <AnimatePresence>
        {isDisablingPassword && (
          <DisablePasswordModal onClose={() => setIsDisablingPassword(false)} />
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
