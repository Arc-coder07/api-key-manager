import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Filter,
  SlidersHorizontal,
  X,
  Upload,
  Download,
  FolderPlus,
  Key,
  LayoutGrid,
  List,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { KeyCard } from "../components/vault/KeyCard";
import { AddKeyForm } from "../components/vault/AddKeyForm";
import { DrawerOverlay } from "../components/ui/DrawerOverlay";
import { EnvImportModal, type ImportKeyData } from "../components/vault/EnvImportModal";
import { DeleteKeyConfirmation } from "../components/vault/DeleteKeyConfirmation";
import { ExportModal, type ExportOptions } from "../components/vault/ExportModal";
import { ProjectCardsView } from "../components/vault/ProjectCardsView";
import { ProjectModal } from "../components/projects/ProjectModal";
import { ToastContainer } from "../components/ui/Toast";
import { useToast } from "../hooks/useToast";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

import { useVaultStore, type NewKeyInput } from "../stores/useVaultStore";
import { getDaysUntil } from "../utils/date";
import {
  generateEnvContent,
  generateJsonFullExport,
  generateJsonMetadataExport,
} from "../utils/envParser";

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
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTier, setActiveTier] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"keys" | "projects">("keys");
  const [syncPrompt, setSyncPrompt] = useState<{ linkId: string; filePath: string } | null>(null);
  const { toasts, dismissToast, success, info, error: toastError } = useToast();

  // Edit key state
  const [editKeyId, setEditKeyId] = useState<string | null>(null);
  const [editKeyData, setEditKeyData] = useState<any>(null);

  // Delete confirmation state
  const [deleteKeyId, setDeleteKeyId] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Consume location state once and clean up
  useEffect(() => {
    if (location.state?.draftProvider) {
      setIsDrawerOpen(true);
      navigate("/vault", { replace: true, state: {} });
    }
    if (location.state?.openImport) {
      setIsImportOpen(true);
      navigate("/vault", { replace: true, state: {} });
    }
    if (location.state?.openExport) {
      setIsExportOpen(true);
      navigate("/vault", { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditKeyId(null);
    setEditKeyData(null);
  };

  const keys_raw = useVaultStore((s) => s.keys);
  const projects = useVaultStore((s) => s.projects);
  const addKey = useVaultStore((s) => s.addKey);
  const updateKey = useVaultStore((s) => s.updateKey);
  const deleteKey = useVaultStore((s) => s.deleteKey);
  const decryptKey = useVaultStore((s) => s.decryptKey);
  const lockVault = useVaultStore((s) => s.lock);
  const activeProjectId = useVaultStore((s) => s.activeProjectId);
  const setActiveProject = useVaultStore((s) => s.setActiveProject);
  const config = useVaultStore((s) => s.config);
  const linkedExports = useVaultStore((s) => s.linkedExports);
  const addLinkedExport = useVaultStore((s) => s.addLinkedExport);
  const removeLinkedExport = useVaultStore((s) => s.removeLinkedExport);
  const updateLinkedExport = useVaultStore((s) => s.updateLinkedExport);

  const clipboardClearMs = (config?.clipboardClearSeconds ?? 30) * 1000;

  // ─── Keyboard Shortcuts ─────────────────────────────
  useKeyboardShortcuts({
    onNewKey: useCallback(() => setIsDrawerOpen(true), []),
    onSearch: useCallback(() => searchInputRef.current?.focus(), []),
    onLockVault: useCallback(() => lockVault(), [lockVault]),
  });

  // ─── Filtered Keys ──────────────────────────────────
  const filteredKeys = useMemo(() => {
    return keys_raw
      .filter((key) => {
        if (activeProjectId && key.projectId !== activeProjectId) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const project = projects.find((p) => p.id === key.projectId);
          const matchesSearch =
            key.name.toLowerCase().includes(q) ||
            key.provider.toLowerCase().includes(q) ||
            (project && project.name.toLowerCase().includes(q)) ||
            key.category.toLowerCase().includes(q);
          if (!matchesSearch) return false;
        }
        if (activeCategory !== "all" && key.category !== activeCategory) return false;
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
  }, [keys_raw, projects, searchQuery, activeCategory, activeTier, activeProjectId]);

  // ─── Handlers ───────────────────────────────────────
  const handleCopy = async (id: string) => {
    const plaintext = await decryptKey(id);
    if (plaintext) {
      await navigator.clipboard.writeText(plaintext);
      success(
        "Copied to clipboard",
        `Key will be cleared in ${config?.clipboardClearSeconds ?? 30} seconds`
      );
      setTimeout(() => {
        navigator.clipboard.writeText("");
      }, clipboardClearMs);
    }
  };

  const handleReveal = async (id: string) => {
    return await decryptKey(id);
  };

  const handleAddKey = async (data: NewKeyInput) => {
    try {
      if (editKeyId) {
        // Update existing key
        await updateKey(editKeyId, {
          name: data.name,
          provider: data.provider,
          category: data.category,
          projectId: data.projectId || "",
          tier: data.tier,
          expiryDate: data.expiryDate || "",
          dashboardUrl: data.dashboardUrl || "",
          notes: data.notes,
          keyValue: data.keyValue,
        });
        handleCloseDrawer();
        success("Key updated", "Changes saved and re-encrypted");
      } else {
        await addKey(data);
        handleCloseDrawer();
        success("Key saved", "Encrypted with AES-256-GCM and stored locally");
      }
    } catch {
      // handled by store
    }
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteKeyId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteKeyId) return;
    await deleteKey(deleteKeyId);
    info("Key deleted", "Key has been removed from your vault");
    setDeleteKeyId(null);
  };

  const handleEdit = async (id: string) => {
    const key = keys_raw.find((k) => k.id === id);
    if (!key) return;

    // Decrypt the key value for editing
    const plaintext = await decryptKey(id);

    setEditKeyId(id);
    setEditKeyData({
      id: key.id,
      name: key.name,
      keyValue: plaintext || "",
      provider: key.provider,
      category: key.category,
      projectId: key.projectId || "",
      tier: key.tier,
      expiryDate: key.expiryDate || "",
      dashboardUrl: key.dashboardUrl || "",
      notes: key.notes || "",
    });
    setIsDrawerOpen(true);
  };

  const handleBatchImport = async (importedKeys: ImportKeyData[]) => {
    try {
      for (const k of importedKeys) {
        await addKey({
          name: k.name,
          keyValue: k.keyValue,
          provider: k.provider,
          category: k.category,
          projectId: k.projectId || "",
          tier: "free",
          expiryDate: "",
          dashboardUrl: "",
          notes: "",
        });
      }
      success("Import successful", `${importedKeys.length} keys saved securely`);
    } catch {
      // handled by store
    }
  };

  // ─── Build export content (shared by export + sync) ────
  const buildExportContent = async (options: ExportOptions) => {
    let targetKeys = keys_raw;
    if (options.scope === "project" && options.projectId) {
      targetKeys = keys_raw.filter((k) => k.projectId === options.projectId);
    } else if (options.scope === "unassigned") {
      targetKeys = keys_raw.filter((k) => !k.projectId);
    }
    if (targetKeys.length === 0) return null;

    const scopeLabel =
      options.scope === "project"
        ? projects.find((p) => p.id === options.projectId)?.name.toLowerCase().replace(/\s+/g, "_") || "project"
        : options.scope === "unassigned" ? "unassigned" : "vault";

    let content: string;
    let filename: string;

    if (options.exportType === "metadata") {
      const items = targetKeys.map((k) => ({
        name: k.name, provider: k.provider, category: k.category,
        notes: k.notes, projectName: projects.find((p) => p.id === k.projectId)?.name,
      }));
      if (options.format === "json") {
        content = generateJsonMetadataExport(items);
        filename = `${scopeLabel}_metadata.json`;
      } else {
        content = items.map((i) => `# ${i.provider} — ${i.name}${i.projectName ? ` [${i.projectName}]` : ""}`).join("\n");
        filename = `${scopeLabel}_metadata.env`;
      }
    } else {
      const decryptedItems = await Promise.all(
        targetKeys.map(async (k) => {
          const pt = await decryptKey(k.id);
          return { name: k.name, provider: k.provider, category: k.category, notes: k.notes, projectName: projects.find((p) => p.id === k.projectId)?.name, value: pt || "" };
        })
      );
      if (options.format === "json") {
        content = generateJsonFullExport(decryptedItems);
        filename = `${scopeLabel}_keys.json`;
      } else {
        content = generateEnvContent(decryptedItems.map((i) => ({ key: i.name, value: i.value })));
        filename = `${scopeLabel}.env`;
      }
    }
    return { content, filename };
  };

  // ─── Export: native save dialog ───────────────────
  const handleExport = async (options: ExportOptions): Promise<string | null> => {
    try {
      const result = await buildExportContent(options);
      if (!result) { info("Nothing to export", "No keys match the selected scope"); return null; }

      // Open native OS save dialog
      const filePath = await save({
        defaultPath: result.filename,
        filters: [{ name: options.format === "json" ? "JSON" : "Environment", extensions: [options.format === "json" ? "json" : "env"] }],
      });
      if (!filePath) return null; // user cancelled

      // Write via Tauri backend
      await invoke("write_file_to_path", { path: filePath, content: result.content });
      success("Saved", `Exported to ${filePath.split("/").pop()}`);
      return filePath;
    } catch (err) {
      toastError("Export failed", String(err));
      return null;
    }
  };

  // ─── Linked export handlers ──────────────────────
  const handleLinkExport = async (link: Parameters<typeof addLinkedExport>[0]) => {
    await addLinkedExport(link);
    success("File linked", "This file will stay in sync with your keys");
  };

  const handleUnlinkExport = async (id: string) => {
    await removeLinkedExport(id);
    info("Unlinked", "File will no longer be updated automatically");
  };

  const handleSyncExport = async (id: string) => {
    const link = linkedExports.find((l) => l.id === id);
    if (!link) return;
    try {
      const scopeProjectId = link.projectId === "__unassigned__" ? undefined : (link.projectId || undefined);
      const scope = !link.projectId ? "all" as const : link.projectId === "__unassigned__" ? "unassigned" as const : "project" as const;
      const result = await buildExportContent({ format: link.format, exportType: link.exportType, scope, projectId: scopeProjectId });
      if (!result) { info("Nothing to sync", "No keys for this scope"); return; }
      await invoke("write_file_to_path", { path: link.filePath, content: result.content });
      await updateLinkedExport(id, { lastSynced: new Date().toISOString() });
      success("Synced", `Updated ${link.filePath.split("/").pop()}`);
    } catch (err) {
      toastError("Sync failed", String(err));
    }
  };

  // ─── Sync prompt after key mutations ─────────────
  const checkSyncPrompt = useCallback(() => {
    const affected = linkedExports.filter((l) => l.autoSync);
    if (affected.length > 0) {
      setSyncPrompt({ linkId: affected[0].id, filePath: affected[0].filePath });
    }
  }, [linkedExports]);

  // Override handlers to trigger sync check after mutations
  const originalHandleAddKey = handleAddKey;
  const handleAddKeyWithSync = async (data: NewKeyInput) => {
    await originalHandleAddKey(data);
    checkSyncPrompt();
  };
  const handleDeleteConfirmWithSync = async () => {
    await handleDeleteConfirm();
    checkSyncPrompt();
  };

  const hasActiveFilters = activeCategory !== "all" || activeTier !== "all";
  const clearFilters = () => {
    setActiveCategory("all");
    setActiveTier("all");
    setShowFilters(false);
  };

  // Is the vault completely empty?
  const isVaultEmpty = keys_raw.length === 0;

  // Fix: compute deleteKeyName properly (after keys_raw is defined)
  const currentDeleteKeyName = useMemo(() => {
    if (!deleteKeyId) return "";
    const key = keys_raw.find((k) => k.id === deleteKeyId);
    return key?.name || "this key";
  }, [deleteKeyId, keys_raw]);

  return (
    <div className="flex flex-col h-full">
      {/* ─── Header ──────────────────────────────────── */}
      <header className="flex items-center justify-between gap-4 px-8 py-5 border-b border-border-subtle shrink-0">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setActiveProject(null); setViewMode(viewMode); }}
              className={`text-lg font-semibold transition-colors ${
                activeProjectId ? "text-text-muted hover:text-text-primary" : "text-text-primary"
              }`}
            >
              Vault
            </button>
            {activeProjectId && (
              <>
                <ChevronRight size={16} className="text-text-muted" />
                <span className="text-lg font-semibold text-text-primary">
                  {projects.find(p => p.id === activeProjectId)?.name || "Project"}
                </span>
              </>
            )}
          </div>
          <p className="text-sm text-text-muted">
            {viewMode === "projects" ? `${projects.length} projects` : `${filteredKeys.length} ${filteredKeys.length === 1 ? "key" : "keys"}`}
            {searchQuery && <span className="text-accent"> · searching "{searchQuery}"</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-card border border-border-subtle rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("keys")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === "keys" ? "bg-accent/10 text-accent" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <List size={14} />
              Keys
            </button>
            <button
              onClick={() => setViewMode("projects")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === "projects" ? "bg-accent/10 text-accent" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <LayoutGrid size={14} />
              Projects
            </button>
          </div>
          {/* Export */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border-subtle text-text-secondary text-sm font-medium hover:bg-card-hover hover:text-text-primary transition-colors"
          >
            <Download size={16} />
            <span>Export</span>
          </motion.button>
          {/* + Add Project */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsProjectModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border-subtle text-text-secondary text-sm font-medium hover:bg-card-hover hover:text-text-primary transition-colors"
          >
            <FolderPlus size={16} />
            <span>Add Project</span>
          </motion.button>
          {/* Import */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border-subtle text-text-primary text-sm font-medium hover:bg-border-subtle/50 transition-colors"
          >
            <Upload size={16} />
            <span>Import</span>
          </motion.button>
          {/* + Add Key */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditKeyId(null);
              setEditKeyData(null);
              setIsDrawerOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors shadow-glow"
          >
            <Plus size={16} />
            <span>Add Key</span>
          </motion.button>
        </div>
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
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keys, providers, projects... (⌘K)"
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
                <div className="flex items-center gap-2">
                  <span className="text-xxs text-text-muted uppercase tracking-wider w-16 shrink-0">
                    Category
                  </span>
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

                <div className="flex items-center gap-2">
                  <span className="text-xxs text-text-muted uppercase tracking-wider w-16 shrink-0">
                    Tier
                  </span>
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

      {/* ─── Content Area ───────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {viewMode === "projects" ? (
          <ProjectCardsView
            projects={projects}
            keys={keys_raw}
            linkedExports={linkedExports}
            onSelectProject={(pid) => {
              if (pid === null) {
                // "Unassigned" card — show unassigned keys
                setActiveProject(null);
                setViewMode("keys");
                // Filter to unassigned via search? Or use activeProjectId convention
              } else {
                setActiveProject(pid);
                setViewMode("keys");
              }
            }}
            onAddKey={() => {
              setEditKeyId(null);
              setEditKeyData(null);
              setIsDrawerOpen(true);
            }}
            onAddProject={() => setIsProjectModalOpen(true)}
          />
        ) : isVaultEmpty ? (
          /* ─── First-time user empty state ─── */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-80 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
              <Key size={28} className="text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary">
              Welcome to Vaultic
            </h3>
            <p className="text-sm text-text-secondary mt-2 max-w-md leading-relaxed">
              Your vault is empty. Add your first API key to get started — it'll be encrypted
              with AES-256-GCM and stored securely on your device.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setIsImportOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card border border-border-subtle text-text-primary text-sm font-medium hover:bg-card-hover transition-colors"
              >
                <Upload size={16} />
                Import .env
              </button>
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors shadow-glow"
              >
                <Plus size={16} />
                Add your first key
              </button>
            </div>
          </motion.div>
        ) : filteredKeys.length === 0 ? (
          /* ─── Filtered empty state ─── */
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
                onDelete={handleDeleteRequest}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── Add/Edit Key Drawer ──────────────────────── */}
      <DrawerOverlay
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={editKeyId ? "Edit Key" : "Add New Key"}
        subtitle={editKeyId ? "Modify and re-encrypt this key" : "Encrypted with zero-knowledge AES-256-GCM"}
      >
        <AddKeyForm
          onSubmit={handleAddKeyWithSync}
          onCancel={handleCloseDrawer}
          projects={projects}
          initialProvider={location.state?.draftProvider}
          initialProjectId={activeProjectId || ""}
          onCreateProject={() => setIsProjectModalOpen(true)}
          editData={editKeyData}
        />
      </DrawerOverlay>

      {/* ─── Delete Confirmation ──────────────────────── */}
      <DeleteKeyConfirmation
        isOpen={!!deleteKeyId}
        onClose={() => setDeleteKeyId(null)}
        onConfirm={handleDeleteConfirmWithSync}
        keyName={currentDeleteKeyName}
      />

      {/* ─── Export Modal ─────────────────────────────── */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        projects={projects}
        keys={keys_raw}
        linkedExports={linkedExports}
        onExport={handleExport}
        onLinkExport={handleLinkExport}
        onUnlinkExport={handleUnlinkExport}
        onSyncExport={handleSyncExport}
      />

      {/* ─── Project Modal (inline create) ────────────── */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />

      {/* ─── Import Env Modal ─────────────────────────── */}
      <EnvImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleBatchImport}
        projects={projects}
      />

      {/* ─── Sync Prompt Dialog ────────────────────────── */}
      {syncPrompt && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-bg-overlay/60 backdrop-blur-sm" onClick={() => setSyncPrompt(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-sm bg-sidebar border border-border-subtle rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-accent/10">
                <RefreshCw size={16} className="text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Update linked file?</h3>
                <p className="text-xxs text-text-muted mt-0.5">Keys have changed since last sync</p>
              </div>
            </div>
            <p className="text-xs text-text-secondary mb-4 truncate" title={syncPrompt.filePath}>
              {syncPrompt.filePath}
            </p>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setSyncPrompt(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Skip
              </button>
              <button
                onClick={async () => {
                  await handleSyncExport(syncPrompt.linkId);
                  setSyncPrompt(null);
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-accent text-white hover:bg-accent-hover transition-colors shadow-glow"
              >
                <RefreshCw size={12} />
                Update file
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ─── Toast Notifications ─────────────────────── */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
