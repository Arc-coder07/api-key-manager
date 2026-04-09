import { useState, useMemo } from "react";
import { Search, Plus, Filter, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { KeyCard } from "../components/vault/KeyCard";
import { AddKeyForm } from "../components/vault/AddKeyForm";
import { DrawerOverlay } from "../components/ui/DrawerOverlay";
import { ToastContainer } from "../components/ui/Toast";
import { useToast } from "../hooks/useToast";
import type { ApiCategory, ApiTier } from "@vaultic/types";

import { useVaultStore } from "../stores/useVaultStore";
import { getDaysUntil } from "../utils/date";

const FILTER_CATEGORIES: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ai", label: "AI" },
  { value: "payments", label: "Payments" },
  { value: "auth", label: "Auth" },
  { value: "messaging", label: "Messaging" },
  { value: "email", label: "Email" },
  { value: "maps", label: "Maps" },
  { value: "devtools", label: "Dev Tools" },
  { value: "storage", label: "Storage" },
  { value: "other", label: "Other" },
];

export function VaultPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTier, setActiveTier] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const { toasts, dismissToast, success, info } = useToast();

  const keys = useVaultStore((s) => s.keys);
  const projects = useVaultStore((s) => s.projects);
  const addKey = useVaultStore((s) => s.addKey);
  const deleteKey = useVaultStore((s) => s.deleteKey);
  const decryptKey = useVaultStore((s) => s.decryptKey);
  const activeProjectId = useVaultStore((s) => s.activeProjectId);

  // Filtered keys
  const filteredKeys = useMemo(() => {
    return keys
      .filter((key) => {
        // Project filter
        if (activeProjectId && key.projectId !== activeProjectId) return false;
        // Search filter
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const project = projects.find(p => p.id === key.projectId);
          const matchesSearch =
            key.name.toLowerCase().includes(q) ||
            key.provider.toLowerCase().includes(q) ||
            (project && project.name.toLowerCase().includes(q)) ||
            key.category.toLowerCase().includes(q);
          if (!matchesSearch) return false;
        }

        // Category filter
        if (activeCategory !== "all" && key.category !== activeCategory) return false;

        // Tier filter
        if (activeTier !== "all" && key.tier !== activeTier) return false;

        return true;
      })
      .map((key) => {
        const project = projects.find((p) => p.id === key.projectId);
        return {
          ...key,
          expiryDays: getDaysUntil(key.expiryDate),
          projectName: project?.name,
          projectColor: project?.color,
        };
      });
  }, [keys, projects, searchQuery, activeCategory, activeTier, activeProjectId]);

  const handleCopy = async (id: string) => {
    const plaintext = await decryptKey(id);
    if (plaintext) {
      await navigator.clipboard.writeText(plaintext);
      success("Copied to clipboard", "Key will be cleared in 30 seconds");
      setTimeout(() => {
        navigator.clipboard.writeText("");
      }, 30000);
    }
  };

  const handleReveal = async (id: string) => {
    return await decryptKey(id);
  };

  const handleAddKey = async (data: any) => {
    try {
      await addKey({
        ...data,
      });
      setIsDrawerOpen(false);
      success("Key saved", "Encrypted with AES-256-GCM and stored locally");
    } catch {
      // handled by store/toast later if needed
    }
  };

  const handleDelete = async (id: string) => {
    await deleteKey(id);
    info("Key deleted", "Key has been removed from your vault");
  };

  const hasActiveFilters = activeCategory !== "all" || activeTier !== "all";

  const clearFilters = () => {
    setActiveCategory("all");
    setActiveTier("all");
    setShowFilters(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* ─── Header ──────────────────────────────────── */}
      <header className="flex items-center justify-between gap-4 px-8 py-5 border-b border-border-subtle shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Vault</h2>
          <p className="text-sm text-text-muted">
            {filteredKeys.length} keys
            {searchQuery && (
              <span className="text-accent"> · searching "{searchQuery}"</span>
            )}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors shadow-glow"
        >
          <Plus size={16} />
          <span>Add Key</span>
        </motion.button>
      </header>

      {/* ─── Search & Filters ────────────────────────── */}
      <div className="px-8 py-4 border-b border-border-subtle/50 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keys, providers, projects..."
              className="
                w-full pl-10 pr-4 py-2.5 rounded-lg
                bg-card border border-border-subtle
                text-sm text-text-primary placeholder-text-muted
                focus:outline-none focus:border-accent/50 focus:shadow-glow
                transition-all duration-200
              "
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-colors
              ${
                hasActiveFilters
                  ? "border-accent/30 bg-accent/5 text-accent"
                  : "border-border-subtle text-text-secondary hover:bg-card hover:text-text-primary"
              }
            `}
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            )}
          </button>
        </div>

        {/* Filter Chips */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2.5 pb-1">
                {/* Category chips */}
                <div className="flex items-center gap-2">
                  <span className="text-xxs text-text-muted uppercase tracking-wider w-16 shrink-0">Category</span>
                  <div className="flex flex-wrap gap-1.5">
                    {FILTER_CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setActiveCategory(cat.value)}
                        className={`
                          px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150
                          ${
                            activeCategory === cat.value
                              ? "bg-accent/15 text-accent border border-accent/30"
                              : "bg-card text-text-muted border border-border-subtle hover:text-text-secondary hover:border-border-active"
                          }
                        `}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tier chips */}
                <div className="flex items-center gap-2">
                  <span className="text-xxs text-text-muted uppercase tracking-wider w-16 shrink-0">Tier</span>
                  <div className="flex gap-1.5">
                    {["all", "free", "paid", "trial"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setActiveTier(t)}
                        className={`
                          px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150
                          ${
                            activeTier === t
                              ? "bg-accent/15 text-accent border border-accent/30"
                              : "bg-card text-text-muted border border-border-subtle hover:text-text-secondary hover:border-border-active"
                          }
                        `}
                      >
                        {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-accent hover:text-accent-hover transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Key Grid ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {filteredKeys.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-64 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-border-subtle/30 flex items-center justify-center mb-4">
              <Filter size={24} className="text-text-muted" />
            </div>
            <p className="text-sm font-medium text-text-secondary">No keys found</p>
            <p className="text-xs text-text-muted mt-1">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : "Try adjusting your filters"}
            </p>
            {(searchQuery || hasActiveFilters) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  clearFilters();
                }}
                className="mt-3 text-xs text-accent hover:text-accent-hover transition-colors"
              >
                Clear all filters
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredKeys.map((key, index) => (
              <KeyCard
                key={key.id}
                {...key}
                index={index}
                onCopy={handleCopy}
                onReveal={handleReveal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── Add Key Drawer ──────────────────────────── */}
      <DrawerOverlay
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Add New Key"
        subtitle="Encrypted with zero-knowledge AES-256-GCM"
      >
        <AddKeyForm
          onSubmit={handleAddKey}
          onCancel={() => setIsDrawerOpen(false)}
          projects={projects}
        />
      </DrawerOverlay>

      {/* ─── Toast Notifications ─────────────────────── */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
