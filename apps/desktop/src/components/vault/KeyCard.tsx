import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Eye, EyeOff, MoreVertical, ExternalLink, Trash2, Pen } from "lucide-react";
import { ProviderIcon } from "../ui/ProviderIcon";
import { formatRelativeDate } from "../../utils/date";

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
  createdAt?: string;
  index?: number;
  onCopy?: (id: string) => void;
  onReveal?: (id: string) => Promise<string | null>;
  onClick?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const tierStyles: Record<string, { bg: string; text: string }> = {
  free: { bg: "bg-tier-free/10", text: "text-tier-free" },
  paid: { bg: "bg-tier-paid/10", text: "text-tier-paid" },
  trial: { bg: "bg-tier-trial/10", text: "text-tier-trial" },
};

function getExpiryStyle(days: number | null | undefined) {
  if (days == null) return null;
  if (days <= 0) return { bg: "bg-status-red/10", text: "text-status-red", label: "Expired" };
  if (days <= 7) return { bg: "bg-status-red/10", text: "text-status-red", label: `${days}d left` };
  if (days <= 14) return { bg: "bg-status-amber/10", text: "text-status-amber", label: `${days}d left` };
  if (days <= 30) return { bg: "bg-status-yellow/10", text: "text-status-yellow", label: `${days}d left` };
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
  createdAt,
  index = 0,
  onCopy,
  onReveal,
  onClick,
  onDelete,
  onEdit,
}: KeyCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  const badgeStyle = tierStyles[tier] ?? tierStyles.free;
  const expiryStyle = getExpiryStyle(expiryDays);
  const relativeDate = formatRelativeDate(createdAt);

  // Close menu on scroll or window resize
  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = () => setShowMenu(false);
    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("resize", closeMenu);
    return () => {
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, [showMenu]);

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
          setTimeout(() => {
            setIsRevealed(false);
            setRevealedKey(null);
          }, 15000);
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("Reveal error:", err);
        }
      } finally {
        setIsRevealing(false);
      }
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{
        duration: 0.2,
        delay: index * 0.03,
        ease: "easeOut",
      }}
      onClick={() => onClick?.(id)}
      className="
        group relative flex flex-col gap-4 p-4
        bg-card border border-border-subtle rounded-2xl
        hover:bg-card-hover hover:border-border-active
        transition-colors cursor-pointer shadow-sm hover:shadow-md
      "
    >
      {/* Top Row: Provider, Name, Date, Badges */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-app/50 border border-border-subtle rounded-xl shadow-sm">
            <ProviderIcon provider={provider} size={24} />
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <h3 className="text-sm font-semibold text-text-primary truncate">
              {name}
            </h3>
            <p className="text-xs text-text-muted truncate">
              <span className="capitalize">{provider.replace(/-/g, " ")}</span>
              {relativeDate && (
                <span className="opacity-75"> · {relativeDate}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border border-current/10 ${badgeStyle.bg} ${badgeStyle.text}`}
          >
            {tier}
          </span>
          {expiryStyle && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border border-current/10 ${expiryStyle.bg} ${expiryStyle.text}`}
            >
              {expiryStyle.label}
            </span>
          )}
        </div>
      </div>

      {/* Middle: Key Display */}
      <div className="flex items-center">
        <div className="flex-1 flex items-center px-3 py-2 rounded-lg bg-app/30 border border-border-subtle/30 font-mono text-xs text-text-secondary overflow-hidden">
          <span className="truncate">
            {isRevealing ? "Decrypting..." : isRevealed ? revealedKey : maskedKey}
          </span>
        </div>
      </div>

      {/* Bottom Row: Project Info and Hover Actions */}
      <div className="flex items-center justify-between h-8">
        <div className="flex items-center">
          {projectName ? (
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-app/30 border border-border-subtle/30">
              <div
                className="w-1.5 h-1.5 rounded-full shadow-sm"
                style={{ backgroundColor: projectColor || "#71717a" }}
              />
              <span className="text-[11px] font-medium text-text-secondary">{projectName}</span>
            </div>
          ) : (
            <div /> // Empty placeholder to maintain flex-between
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 transition-opacity duration-200">
          <button
            onClick={handleReveal}
            className="p-1.5 rounded-md text-text-muted hover:bg-border-subtle hover:text-text-primary transition-colors flex items-center justify-center"
            title={isRevealed ? "Hide key" : "Reveal key"}
          >
            {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>

          <button
            onClick={handleCopy}
            className={`
              flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium
              transition-all duration-200
              ${
                isCopied
                  ? "bg-accent/10 text-accent"
                  : "text-text-muted hover:bg-border-subtle hover:text-text-primary"
              }
            `}
            title="Copy key"
          >
            <Copy size={13} />
            <span>{isCopied ? "Copied" : "Copy"}</span>
          </button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 rounded-md text-text-muted hover:bg-border-subtle hover:text-text-primary transition-colors"
              title="More options"
            >
              <MoreVertical size={14} />
            </button>

            <AnimatePresence>
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
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-1.5 z-50 w-44 py-1.5 rounded-xl bg-sidebar border border-border-subtle shadow-lg"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onEdit?.(id);
                      }}
                      className="flex items-center gap-2.5 w-full px-3 py-1.5 text-xs text-text-secondary hover:bg-card hover:text-text-primary transition-colors"
                    >
                      <Pen size={13} />
                      Edit Key
                    </button>
                    {dashboardUrl && (
                      <a
                        href={dashboardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-text-secondary hover:bg-card hover:text-text-primary transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={13} />
                        Open Dashboard
                      </a>
                    )}
                    <div className="my-1 border-t border-border-subtle/50" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onDelete?.(id);
                      }}
                      className="flex items-center gap-2.5 w-full px-3 py-1.5 text-xs text-status-red hover:bg-status-red/10 transition-colors"
                    >
                      <Trash2 size={13} />
                      Delete Key
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
