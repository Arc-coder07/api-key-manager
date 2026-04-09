import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Eye, EyeOff, MoreVertical, ExternalLink, Trash2 } from "lucide-react";
import { ProviderIcon } from "../ui/ProviderIcon";

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
  dashboardUrl?: string | null;
  index?: number;
  onCopy?: (id: string) => void;
  onReveal?: (id: string) => Promise<string | null>;
  onClick?: (id: string) => void;
  onDelete?: (id: string) => void;
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
  dashboardUrl,
  index = 0,
  onCopy,
  onReveal,
  onClick,
  onDelete,
}: KeyCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  const badgeStyle = tierStyles[tier] ?? tierStyles.free;
  const expiryStyle = getExpiryStyle(expiryDays);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCopied(true);
    onCopy?.(id);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReveal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRevealed) {
      setIsRevealed(false);
      setRevealedKey(null);
    } else {
      setIsRevealing(true);
      try {
        const plaintext = await onReveal?.(id);
        if (plaintext) {
          setRevealedKey(plaintext);
          setIsRevealed(true);
          // Auto-hide after 15 seconds
          setTimeout(() => {
            setIsRevealed(false);
            setRevealedKey(null);
          }, 15000);
        }
      } catch (err) {
        console.error("Reveal error:", err);
      } finally {
        setIsRevealing(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
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
          <ProviderIcon provider={provider} size={36} />
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-text-primary truncate">
              {name}
            </h3>
            <p className="text-xs text-text-muted capitalize">{provider.replace(/-/g, " ")}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-medium ${badgeStyle.bg} ${badgeStyle.text}`}
          >
            {tier}
          </span>
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
          {isRevealing ? "Decrypting..." : isRevealed ? revealedKey : maskedKey}
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

          {/* Context Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 rounded-md text-text-muted hover:bg-border-subtle/50 hover:text-text-secondary transition-colors"
              title="More options"
            >
              <MoreVertical size={14} />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute right-0 top-full mt-1 z-50 w-40 py-1 rounded-xl bg-sidebar border border-border-subtle shadow-xl"
                >
                  {dashboardUrl && (
                    <a
                      href={dashboardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-text-secondary hover:bg-card hover:text-text-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={12} />
                      Open Dashboard
                    </a>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onDelete?.(id);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-status-red hover:bg-status-red/10 transition-colors"
                  >
                    <Trash2 size={12} />
                    Delete Key
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
