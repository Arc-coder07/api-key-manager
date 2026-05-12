import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  X,
  Download,
  FileText,
  FileJson,
  AlertTriangle,
  Check,
  Shield,
  Link2,
  Unlink2,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import type { Project, ApiKeyEntry, LinkedExport } from "@vaultic/types";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  keys: ApiKeyEntry[];
  linkedExports: LinkedExport[];
  onExport: (options: ExportOptions) => Promise<string | null>;
  onLinkExport?: (link: Omit<LinkedExport, "id" | "createdAt" | "lastSynced">) => Promise<void>;
  onUnlinkExport?: (id: string) => Promise<void>;
  onSyncExport?: (id: string) => Promise<void>;
}

export interface ExportOptions {
  format: "env" | "json";
  exportType: "full" | "metadata";
  scope: "all" | "project" | "unassigned";
  projectId?: string;
}

export function ExportModal({
  isOpen,
  onClose,
  projects,
  keys,
  linkedExports,
  onExport,
  onLinkExport,
  onUnlinkExport,
  onSyncExport,
}: ExportModalProps) {
  const [format, setFormat] = useState<"env" | "json">("env");
  const [exportType, setExportType] = useState<"full" | "metadata">("full");
  const [scope, setScope] = useState<"all" | "project" | "unassigned">("all");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);
  const [linkAfterExport, setLinkAfterExport] = useState(true);

  // Find existing linked export for current scope
  const existingLink = useMemo(() => {
    const scopeProjectId =
      scope === "project" ? selectedProjectId :
      scope === "all" ? null :
      "__unassigned__";
    return linkedExports.find((l) =>
      scope === "all" ? l.projectId === null :
      scope === "unassigned" ? l.projectId === "__unassigned__" :
      l.projectId === scopeProjectId
    );
  }, [linkedExports, scope, selectedProjectId]);

  const previewCount = useMemo(() => {
    if (scope === "all") return keys.length;
    if (scope === "unassigned") return keys.filter((k) => !k.projectId).length;
    if (scope === "project" && selectedProjectId)
      return keys.filter((k) => k.projectId === selectedProjectId).length;
    return 0;
  }, [keys, scope, selectedProjectId]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const savedPath = await onExport({
        format,
        exportType,
        scope,
        projectId: scope === "project" ? selectedProjectId : undefined,
      });

      // If user chose to link and export succeeded
      if (savedPath && linkAfterExport && onLinkExport) {
        await onLinkExport({
          projectId:
            scope === "project" ? selectedProjectId :
            scope === "unassigned" ? "__unassigned__" :
            null,
          filePath: savedPath,
          format,
          exportType,
          autoSync: true,
        });
      }

      if (savedPath) onClose();
    } catch {
      // Error handled in parent
    } finally {
      setIsExporting(false);
    }
  };

  const handleSyncExisting = async () => {
    if (!existingLink || !onSyncExport) return;
    setIsExporting(true);
    try {
      await onSyncExport(existingLink.id);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-bg-overlay backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg bg-sidebar border border-border-subtle rounded-2xl shadow-xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Download size={16} className="text-accent" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                Export Keys
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Save to your project folder
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-border-subtle/50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
          {/* Existing Linked File */}
          {existingLink && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/5 border border-accent/20">
              <Link2 size={14} className="text-accent shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text-primary">
                  Linked file exists
                </p>
                <p className="text-xxs text-text-muted truncate mt-0.5" title={existingLink.filePath}>
                  {existingLink.filePath}
                </p>
                <p className="text-xxs text-text-muted mt-0.5">
                  Last synced: {new Date(existingLink.lastSynced).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleSyncExisting}
                  disabled={isExporting}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-accent bg-accent/10 hover:bg-accent/20 transition-colors disabled:opacity-50"
                  title="Re-sync to existing file"
                >
                  <RefreshCw size={11} className={isExporting ? "animate-spin" : ""} />
                  Sync
                </button>
                {onUnlinkExport && (
                  <button
                    onClick={() => onUnlinkExport(existingLink.id)}
                    className="p-1 rounded-md text-text-muted hover:text-status-red hover:bg-status-red/10 transition-colors"
                    title="Unlink file"
                  >
                    <Unlink2 size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Export Type */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
              Export Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExportType("full")}
                className={`flex flex-col items-start gap-1.5 p-3 rounded-xl border transition-all text-left ${
                  exportType === "full"
                    ? "border-accent bg-accent/5"
                    : "border-border-subtle hover:border-border-active"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield
                    size={14}
                    className={exportType === "full" ? "text-accent" : "text-text-muted"}
                  />
                  <span
                    className={`text-sm font-medium ${
                      exportType === "full" ? "text-accent" : "text-text-secondary"
                    }`}
                  >
                    Full Export
                  </span>
                  {exportType === "full" && (
                    <Check size={12} className="text-accent ml-auto" />
                  )}
                </div>
                <span className="text-xxs text-text-muted leading-relaxed">
                  Export usable credentials — includes decrypted values in
                  ENV-ready format
                </span>
              </button>

              <button
                type="button"
                onClick={() => setExportType("metadata")}
                className={`flex flex-col items-start gap-1.5 p-3 rounded-xl border transition-all text-left ${
                  exportType === "metadata"
                    ? "border-accent bg-accent/5"
                    : "border-border-subtle hover:border-border-active"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText
                    size={14}
                    className={exportType === "metadata" ? "text-accent" : "text-text-muted"}
                  />
                  <span
                    className={`text-sm font-medium ${
                      exportType === "metadata" ? "text-accent" : "text-text-secondary"
                    }`}
                  >
                    Metadata Only
                  </span>
                  {exportType === "metadata" && (
                    <Check size={12} className="text-accent ml-auto" />
                  )}
                </div>
                <span className="text-xxs text-text-muted leading-relaxed">
                  Export structure without secrets — names, providers, categories
                </span>
              </button>
            </div>
          </div>

          {/* Format */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
              File Format
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormat("env")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  format === "env"
                    ? "border-accent bg-accent/5 text-accent"
                    : "border-border-subtle text-text-secondary hover:border-border-active"
                }`}
              >
                <FileText size={14} />
                .env
              </button>
              <button
                type="button"
                onClick={() => setFormat("json")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  format === "json"
                    ? "border-accent bg-accent/5 text-accent"
                    : "border-border-subtle text-text-secondary hover:border-border-active"
                }`}
              >
                <FileJson size={14} />
                .json
              </button>
            </div>
          </div>

          {/* Scope */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
              Scope
            </label>
            <div className="space-y-1.5">
              <label
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                  scope === "all"
                    ? "border-accent bg-accent/5"
                    : "border-border-subtle hover:bg-card"
                }`}
              >
                <input
                  type="radio"
                  name="scope"
                  checked={scope === "all"}
                  onChange={() => setScope("all")}
                  className="accent-accent"
                />
                <span className="text-sm text-text-primary">
                  All keys ({keys.length})
                </span>
              </label>

              {projects.length > 0 && (
                <label
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                    scope === "project"
                      ? "border-accent bg-accent/5"
                      : "border-border-subtle hover:bg-card"
                  }`}
                >
                  <input
                    type="radio"
                    name="scope"
                    checked={scope === "project"}
                    onChange={() => {
                      setScope("project");
                      if (!selectedProjectId && projects.length > 0) {
                        setSelectedProjectId(projects[0].id);
                      }
                    }}
                    className="accent-accent"
                  />
                  <span className="text-sm text-text-primary flex-1">
                    Specific project
                  </span>
                  {scope === "project" && (
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="ml-2 bg-card border border-border-subtle rounded-lg px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-accent"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  )}
                </label>
              )}

              <label
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                  scope === "unassigned"
                    ? "border-accent bg-accent/5"
                    : "border-border-subtle hover:bg-card"
                }`}
              >
                <input
                  type="radio"
                  name="scope"
                  checked={scope === "unassigned"}
                  onChange={() => setScope("unassigned")}
                  className="accent-accent"
                />
                <span className="text-sm text-text-primary">
                  Unassigned keys ({keys.filter((k) => !k.projectId).length})
                </span>
              </label>
            </div>
          </div>

          {/* Link after export toggle */}
          {!existingLink && (
            <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border-subtle cursor-pointer hover:bg-card transition-colors">
              <input
                type="checkbox"
                checked={linkAfterExport}
                onChange={(e) => setLinkAfterExport(e.target.checked)}
                className="accent-accent w-4 h-4"
              />
              <div className="flex items-center gap-2">
                <Link2 size={14} className="text-accent" />
                <div>
                  <span className="text-sm text-text-primary">Link this file</span>
                  <p className="text-xxs text-text-muted">Auto-update when keys change</p>
                </div>
              </div>
            </label>
          )}

          {/* Warning */}
          {exportType === "full" && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-status-amber/10 border border-status-amber/20">
              <AlertTriangle
                size={14}
                className="text-status-amber shrink-0 mt-0.5"
              />
              <p className="text-xxs text-text-secondary leading-relaxed">
                <strong className="text-text-primary">
                  Exported files contain sensitive credentials.
                </strong>{" "}
                Store them securely and add to your .gitignore. Never commit
                exported files to version control.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-subtle shrink-0 flex items-center justify-between bg-app/30">
          <p className="text-xs text-text-muted">
            {previewCount} {previewCount === 1 ? "key" : "keys"} will be
            exported
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || previewCount === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
            >
              {isExporting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FolderOpen size={14} />
              )}
              <span>Save to...</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
