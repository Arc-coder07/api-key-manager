import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Eye, EyeOff, MoreVertical, ExternalLink, Trash2, Pen, Check } from "lucide-react";
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



const getExpiryStyle = (days?: number | null) => {
  if (days === undefined || days === null) return null;
  if (days < 0) return "bg-red-500/10 text-red-500 border-red-500/20";
  if (days <= 7) return "bg-orange-500/10 text-orange-500 border-orange-500/20";
  if (days <= 30) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
  return "bg-text-muted/10 text-text-secondary border-border-subtle";
};

const tierStyles = {
  free: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  paid: "bg-green-500/10 text-green-500 border border-green-500/20",
  trial: "bg-purple-500/10 text-purple-500 border border-purple-500/20"
};

export const KeyCard = ({
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
  onEdit
}: KeyCardProps) => {
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup auto-hide timeout on unmount
  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCopy) {
      onCopy(id);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevealToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (revealedKey) {
      setRevealedKey(null);
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
      return;
    }

    if (onReveal) {
      setIsRevealing(true);
      try {
        const key = await onReveal(id);
        if (key) {
          setRevealedKey(key);
          // Auto-hide after 15s
          revealTimeoutRef.current = setTimeout(() => {
            setRevealedKey(null);
          }, 15000);
        }
      } finally {
        setIsRevealing(false);
      }
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const displayKey = revealedKey || maskedKey;
  const expiryStyle = getExpiryStyle(expiryDays);
  const relativeDate = formatRelativeDate(createdAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => onClick?.(id)}
      className="group relative flex flex-col gap-4 bg-card border border-border-subtle rounded-xl p-5 hover:bg-card-hover hover:border-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 overflow-visible cursor-pointer"
    >
      {/* 2px left border accent on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-xl" />

      {/* Top Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-app/50 rounded-lg border border-border-subtle">
            <ProviderIcon provider={provider} size={20} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-medium text-text-primary leading-tight">
              {name}
            </h3>
            <div className="flex items-center text-xs text-text-muted mt-0.5">
              <span>{provider}</span>
              {relativeDate && (
                <>
                  <span className="mx-1.5 opacity-50">•</span>
                  <span>{relativeDate}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Context Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={handleMenuClick}
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-app/50 transition-colors"
          >
            <MoreVertical size={16} />
          </button>
          
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, transformOrigin: 'top right' }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-1 w-44 bg-card border border-border-subtle rounded-lg shadow-xl z-20 overflow-hidden"
              >
                <div className="p-1 flex flex-col">
                  {onEdit && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(id); }}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-text-primary hover:bg-app/50 rounded-md transition-colors"
                    >
                      <Pen size={14} className="text-text-muted" />
                      Edit Key
                    </button>
                  )}
                  {dashboardUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        window.open(dashboardUrl, '_blank', 'noopener,noreferrer');
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-text-primary hover:bg-app/50 rounded-md transition-colors"
                    >
                      <ExternalLink size={14} className="text-text-muted" />
                      Open Dashboard
                    </button>
                  )}
                  {onDelete && (
                    <>
                      <div className="h-px bg-border-subtle my-1 mx-2" />
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(id); }}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                      >
                        <Trash2 size={14} />
                        Delete Key
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Middle Row - Key Display */}
      <div className="flex items-center justify-between bg-app/50 border border-border-subtle rounded-lg p-2 pl-3 gap-2">
        <code className="text-sm font-mono text-text-primary tracking-tight truncate flex-1 pt-0.5">
          {displayKey}
        </code>
        
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleRevealToggle}
            disabled={isRevealing}
            className="flex items-center justify-center w-8 h-8 rounded-md text-text-muted hover:text-text-primary hover:bg-card-hover transition-colors disabled:opacity-50"
            title={revealedKey ? "Hide key" : "Reveal key"}
          >
            {revealedKey ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
          
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium transition-all ${
              copied 
                ? "bg-green-500/10 text-green-500" 
                : "bg-accent/10 text-accent hover:bg-accent/15"
            }`}
          >
            {copied ? (
              <>
                <Check size={14} />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Row - Project & Badges */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2">
          {projectName && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-app/50 rounded-md border border-border-subtle">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: projectColor || 'rgb(var(--accent))' }}
              />
              <span className="text-xs text-text-secondary max-w-[120px] truncate">
                {projectName}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase font-semibold px-2 py-1 rounded-md tracking-wider ${tierStyles[tier]}`}>
            {tier}
          </span>
          
          {expiryDays !== null && expiryDays !== undefined && (
            <span className={`text-[10px] font-medium px-2 py-1 rounded-md border ${expiryStyle}`}>
              {expiryDays < 0 ? 'Expired' : `${expiryDays}d left`}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
