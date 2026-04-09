import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Upload,
  Info,
  ChevronRight,
  Lock,
  Clock,
  Clipboard,
  FileDown,
  FileUp,
  Zap,
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
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  value?: string;
  action?: string;
  onAction?: () => void;
  danger?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ backgroundColor: "rgba(26, 26, 31, 0.8)" }}
      className="flex items-center justify-between p-4 rounded-xl bg-card border border-border-subtle cursor-pointer transition-colors"
      onClick={onAction}
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

export function SettingsPage() {
  const [autoLock] = useState(15);
  const [clipboardClear] = useState(30);

  return (
    <div className="flex flex-col h-full">
      <header className="px-8 py-5 border-b border-border-subtle">
        <h2 className="text-lg font-semibold text-text-primary">Settings</h2>
        <p className="text-sm text-text-muted mt-0.5">
          Configure your vault and preferences
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 max-w-2xl"
        >
          {/* ─── Security Section ──────────────────────── */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-widest">
              <Shield size={14} className="text-accent" />
              Security
            </h3>
            <div className="space-y-2">
              <SettingRow
                icon={<Clock size={16} className="text-accent" />}
                label="Auto-lock timeout"
                description="Lock the vault after inactivity"
                value={`${autoLock} min`}
              />
              <SettingRow
                icon={<Clipboard size={16} className="text-accent" />}
                label="Clipboard auto-clear"
                description="Clear clipboard after copying a key"
                value={`${clipboardClear}s`}
              />
              <SettingRow
                icon={<Lock size={16} className="text-accent" />}
                label="Change master password"
                description="Update your vault encryption password"
                action="Change"
              />
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
              />
              <SettingRow
                icon={<FileDown size={16} className="text-accent" />}
                label="Export keys"
                description="Export project keys as .env or JSON"
                action="Export"
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
                  <p className="text-xs text-text-muted">v0.1.0 · Phase 1</p>
                </div>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Zero-knowledge encrypted API key vault for developers.
                Your keys are encrypted locally with AES-256-GCM and never leave your device.
                The master password is never stored — only you can unlock your vault.
              </p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
