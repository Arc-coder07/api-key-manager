import {
  Shield,
  Clock,
  Upload,
  Download,
  Info,
} from "lucide-react";

export function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="px-8 py-5 border-b border-border-subtle">
        <h2 className="text-lg font-semibold text-text-primary">Settings</h2>
        <p className="text-sm text-text-muted mt-0.5">
          Configure your vault and preferences
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 max-w-2xl">
        {/* ─── Security Section ──────────────────────── */}
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Shield size={16} className="text-accent" />
            Security
          </h3>
          <div className="space-y-3">
            <SettingRow
              label="Auto-lock timeout"
              description="Lock the vault after inactivity"
              value="15 minutes"
            />
            <SettingRow
              label="Clipboard clear"
              description="Clear clipboard after copying a key"
              value="30 seconds"
            />
            <SettingRow
              label="Change master password"
              description="Update your vault encryption password"
              action="Change"
            />
          </div>
        </section>

        {/* ─── Import/Export Section ──────────────────── */}
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Upload size={16} className="text-accent" />
            Import & Export
          </h3>
          <div className="space-y-3">
            <SettingRow
              label="Import from .env"
              description="Parse and import keys from an environment file"
              action="Import"
            />
            <SettingRow
              label="Export keys"
              description="Export keys as .env or JSON file"
              action="Export"
            />
          </div>
        </section>

        {/* ─── About Section ─────────────────────────── */}
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Info size={16} className="text-accent" />
            About
          </h3>
          <div className="p-4 rounded-xl bg-card border border-border-subtle">
            <p className="text-sm text-text-secondary">
              <span className="font-semibold text-text-primary">Vaultic</span>{" "}
              v0.1.0
            </p>
            <p className="text-xs text-text-muted mt-1">
              Zero-knowledge encrypted API key vault.
              <br />
              Your keys never leave your device.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  value,
  action,
}: {
  label: string;
  description: string;
  value?: string;
  action?: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border-subtle">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-muted mt-0.5">{description}</p>
      </div>
      {value && (
        <span className="text-sm text-text-secondary font-mono">{value}</span>
      )}
      {action && (
        <button className="px-3 py-1.5 rounded-lg bg-border-subtle/50 text-sm text-text-secondary hover:bg-card-hover hover:text-text-primary transition-colors">
          {action}
        </button>
      )}
    </div>
  );
}
