import { useState } from "react";
import { Copy, Eye, EyeOff, ExternalLink, MoreVertical } from "lucide-react";

interface KeyCardProps {
  id: string;
  name: string;
  provider: string;
  category: string;
  tier: "free" | "paid" | "trial";
  maskedKey?: string;
  expiryDays?: number | null;
  projectName?: string;
  projectColor?: string;
  onCopy?: (id: string) => void;
  onReveal?: (id: string) => void;
  onClick?: (id: string) => void;
}

const tierStyles: Record<string, { bg: string; text: string }> = {
  free: { bg: "bg-tier-free/15", text: "text-tier-free" },
  paid: { bg: "bg-tier-paid/15", text: "text-tier-paid" },
  trial: { bg: "bg-tier-trial/15", text: "text-tier-trial" },
};

function getExpiryStyle(days: number | null | undefined) {
  if (days == null) return null;
  if (days <= 0) return { bg: "bg-status-red/15", text: "text-status-red", label: "Expired" };
  if (days <= 7) return { bg: "bg-status-red/15", text: "text-status-red", label: `${days}d left` };
  if (days <= 14) return { bg: "bg-status-amber/15", text: "text-status-amber", label: `${days}d left` };
  if (days <= 30) return { bg: "bg-status-yellow/15", text: "text-status-yellow", label: `${days}d left` };
  return null;
}

export function KeyCard({
  id,
  name,
  provider,
  tier,
  maskedKey = "••••••••••••••••",
  expiryDays,
  projectName,
  projectColor,
  onCopy,
  onClick,
}: KeyCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const badgeStyle = tierStyles[tier] ?? tierStyles.free;
  const expiryStyle = getExpiryStyle(expiryDays);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCopied(true);
    onCopy?.(id);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReveal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRevealed(!isRevealed);
  };

  return (
    <div
      onClick={() => onClick?.(id)}
      className="
        group relative flex flex-col gap-3 p-4
        bg-card border border-border-subtle rounded-xl
        hover:bg-card-hover hover:border-border-active
        hover:shadow-card-hover
        card-transition cursor-pointer
      "
    >
      {/* ─── Top Row: Provider + Badges ──────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Provider icon placeholder — will use Simple Icons in Phase 1+ */}
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-border-subtle/50 shrink-0">
            <span className="text-xs font-semibold text-text-secondary uppercase">
              {provider.slice(0, 2)}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-text-primary truncate">
              {name}
            </h3>
            <p className="text-xs text-text-muted capitalize">{provider}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Tier badge */}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-medium ${badgeStyle.bg} ${badgeStyle.text}`}
          >
            {tier}
          </span>
          {/* Expiry badge */}
          {expiryStyle && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-medium ${expiryStyle.bg} ${expiryStyle.text}`}
            >
              {expiryStyle.label}
            </span>
          )}
        </div>
      </div>

      {/* ─── Key Display ─────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-app/50 border border-border-subtle/50">
        <code className="key-display flex-1 truncate">
          {isRevealed ? "sk-proj-abc...xyz123" : maskedKey}
        </code>
        <button
          onClick={handleReveal}
          className="p-1 rounded text-text-muted hover:text-text-secondary transition-colors"
          title={isRevealed ? "Hide key" : "Reveal key"}
        >
          {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>

      {/* ─── Bottom Row: Project + Actions ────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {projectName && (
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: projectColor || "#71717a" }}
              />
              <span className="text-xs text-text-muted">{projectName}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className={`
              flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium
              transition-all duration-150
              ${
                isCopied
                  ? "bg-accent/20 text-accent"
                  : "bg-border-subtle/50 text-text-secondary hover:bg-accent/15 hover:text-accent"
              }
            `}
            title="Copy key"
          >
            <Copy size={12} />
            <span>{isCopied ? "Copied!" : "Copy"}</span>
          </button>
          <button
            className="p-1.5 rounded-md text-text-muted hover:bg-border-subtle/50 hover:text-text-secondary transition-colors"
            title="More options"
          >
            <MoreVertical size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
