import { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { KeyCard } from "../components/vault/KeyCard";
import { useVaultStore } from "../stores/useVaultStore";
import { getDaysUntil } from "../utils/date";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/Toast";

function ExpirySection({
  title,
  icon,
  color,
  keys,
  onCopy,
  onReveal,
  onDelete
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  keys: any[];
  onCopy: (id: string) => void;
  onReveal: (id: string) => Promise<string | null>;
  onDelete: (id: string) => void;
}) {
  if (keys.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold" style={{ color }}>
          {title}
        </h3>
        <span className="text-xs text-text-muted">({keys.length})</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {keys.map((key, index) => (
          <KeyCard
            key={key.id}
            {...key}
            index={index}
            onCopy={onCopy}
            onReveal={onReveal}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

export function ExpiringPage() {
  const keys = useVaultStore((s) => s.keys);
  const projects = useVaultStore((s) => s.projects);
  const decryptKey = useVaultStore((s) => s.decryptKey);
  const deleteKey = useVaultStore((s) => s.deleteKey);
  const config = useVaultStore((s) => s.config);
  const { toasts, dismissToast, success, info } = useToast();

  const clipboardClearMs = (config?.clipboardClearSeconds ?? 30) * 1000;

  const handleCopy = async (id: string) => {
    const plaintext = await decryptKey(id);
    if (plaintext) {
      await navigator.clipboard.writeText(plaintext);
      success("Copied to clipboard", `Key will be cleared in ${config?.clipboardClearSeconds ?? 30} seconds`);
      setTimeout(() => {
        navigator.clipboard.writeText("");
      }, clipboardClearMs);
    }
  };

  const handleReveal = async (id: string) => {
    return await decryptKey(id);
  };

  const handleDelete = async (id: string) => {
    await deleteKey(id);
    info("Key deleted", "Key has been removed from your vault");
  };

  const processedKeys = useMemo(() => {
    return keys
      .map((key) => {
        const project = projects.find((p) => p.id === key.projectId);
        return {
          ...key,
          expiryDays: getDaysUntil(key.expiryDate),
          projectName: project?.name,
          projectColor: project?.color,
        };
      })
      .filter((k) => k.expiryDays !== null && k.expiryDays <= 30);
  }, [keys, projects]);

  const expired = processedKeys.filter((k) => k.expiryDays! <= 0).sort((a, b) => a.expiryDays! - b.expiryDays!);
  const critical = processedKeys.filter((k) => k.expiryDays! > 0 && k.expiryDays! <= 7).sort((a, b) => a.expiryDays! - b.expiryDays!);
  const warning = processedKeys.filter((k) => k.expiryDays! > 7 && k.expiryDays! <= 14).sort((a, b) => a.expiryDays! - b.expiryDays!);
  const upcoming = processedKeys.filter((k) => k.expiryDays! > 14 && k.expiryDays! <= 30).sort((a, b) => a.expiryDays! - b.expiryDays!);

  const totalExpiringSoon = critical.length + warning.length + upcoming.length;
  // Technically expired are already dead, so "expiring soon" applies to >0 and <=30.
  const total = processedKeys.length;

  return (
    <div className="flex flex-col h-full">
      <header className="px-8 py-5 border-b border-border-subtle shrink-0">
        <h2 className="text-lg font-semibold text-text-primary">Expiring Keys</h2>
        <p className="text-sm text-text-muted mt-0.5">
          {expired.length > 0 ? `${expired.length} expired, ` : ''}{totalExpiringSoon} {totalExpiringSoon === 1 ? "key" : "keys"} expiring within 30 days
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {total === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-64 text-center"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
              <CheckCircle size={28} className="text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary">All clear</h3>
            <p className="text-sm text-text-muted mt-1">
              No keys are expired or expiring soon. You're all set!
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 max-w-4xl"
          >
            {/* Summary cards */}
            <div className={`grid gap-3 ${expired.length > 0 ? "grid-cols-4" : "grid-cols-3"}`}>
              {expired.length > 0 && (
                <div className="p-4 rounded-xl bg-status-red/10 border border-status-red/30">
                  <p className="text-2xl font-bold text-status-red">{expired.length}</p>
                  <p className="text-xs text-text-muted mt-0.5">Expired (Past Due)</p>
                </div>
              )}
              <div className="p-4 rounded-xl bg-status-red/5 border border-status-red/15">
                <p className="text-2xl font-bold text-status-red">{critical.length}</p>
                <p className="text-xs text-text-muted mt-0.5">Critical (≤7 days)</p>
              </div>
              <div className="p-4 rounded-xl bg-status-amber/5 border border-status-amber/15">
                <p className="text-2xl font-bold text-status-amber">{warning.length}</p>
                <p className="text-xs text-text-muted mt-0.5">Warning (8-14 days)</p>
              </div>
              <div className="p-4 rounded-xl bg-status-yellow/5 border border-status-yellow/15">
                <p className="text-2xl font-bold text-status-yellow">{upcoming.length}</p>
                <p className="text-xs text-text-muted mt-0.5">Upcoming (15-30 days)</p>
              </div>
            </div>

            {/* Grouped key lists */}
            <ExpirySection
              title="Expired — Past Due"
              icon={<XCircle size={16} className="text-status-red" />}
              color="#ef4444"
              keys={expired}
              onCopy={handleCopy}
              onReveal={handleReveal}
              onDelete={handleDelete}
            />
            <ExpirySection
              title="Critical — Expiring within 7 days"
              icon={<AlertTriangle size={16} className="text-status-red" />}
              color="#ef4444"
              keys={critical}
              onCopy={handleCopy}
              onReveal={handleReveal}
              onDelete={handleDelete}
            />
            <ExpirySection
              title="Warning — Expiring within 14 days"
              icon={<Clock size={16} className="text-status-amber" />}
              color="#f59e0b"
              keys={warning}
              onCopy={handleCopy}
              onReveal={handleReveal}
              onDelete={handleDelete}
            />
            <ExpirySection
              title="Upcoming — Expiring within 30 days"
              icon={<Clock size={16} className="text-status-yellow" />}
              color="#eab308"
              keys={upcoming}
              onCopy={handleCopy}
              onReveal={handleReveal}
              onDelete={handleDelete}
            />
          </motion.div>
        )}
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
