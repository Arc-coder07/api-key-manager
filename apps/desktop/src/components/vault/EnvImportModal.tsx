import { useState, useMemo } from "react";
import { X, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { parseEnvContent, ParsedEnvItem } from "../../utils/envParser";
import { guessProviderFromEnvKey, PROVIDERS } from "@vaultic/providers";
import type { Project, ApiCategory } from "@vaultic/types";

interface EnvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (keys: ImportKeyData[]) => Promise<void>;
  projects: Project[];
}

export interface ImportKeyData {
  name: string;
  keyValue: string;
  provider: string;
  category: ApiCategory;
  projectId: string | null;
}

interface PreviewItem extends ParsedEnvItem {
  id: string; // temp id
  providerSlug: string;
  category: ApiCategory;
}

export function EnvImportModal({ isOpen, onClose, onImport, projects }: EnvImportModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [rawEnv, setRawEnv] = useState("");
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal is opened/closed
  useMemo(() => {
    if (!isOpen) {
      setStep(1);
      setRawEnv("");
      setPreviewItems([]);
      setSelectedProjectId("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleParse = () => {
    const rawParsed = parseEnvContent(rawEnv);
    if (rawParsed.length === 0) return;

    const items: PreviewItem[] = rawParsed.map((item, idx) => {
      const provider = guessProviderFromEnvKey(item.key);
      return {
        ...item,
        id: `import-${idx}`,
        providerSlug: provider?.id || "other",
        category: provider?.category || "other",
      };
    });

    setPreviewItems(items);
    setStep(2);
  };

  const handleProviderChange = (itemId: string, newProviderSlug: string) => {
    const provider = PROVIDERS.find((p) => p.id === newProviderSlug);
    setPreviewItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            providerSlug: newProviderSlug,
            category: provider?.category || "other",
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setPreviewItems((prev) => prev.filter((item) => item.id !== itemId));
    if (previewItems.length <= 1) {
      setStep(1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const keysToImport: ImportKeyData[] = previewItems.map((item) => ({
      name: item.key, // Default to the ENV key name
      keyValue: item.value,
      provider: item.providerSlug,
      category: item.category,
      projectId: selectedProjectId || null,
    }));

    await onImport(keysToImport);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
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
        className="relative w-full max-w-3xl max-h-[85vh] bg-sidebar border border-border-subtle rounded-2xl shadow-xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Import .env Keys
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              {step === 1 ? "Paste your .env file contents" : "Review and assign providers"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-border-subtle/50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
              >
                <div className="flex-1 min-h-[250px]">
                  <textarea
                    value={rawEnv}
                    onChange={(e) => setRawEnv(e.target.value)}
                    placeholder={`STRIPE_SECRET_KEY=sk_test_12345\nNEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co\n# Add your keys here`}
                    className="w-full h-full p-4 bg-app rounded-xl border border-border-subtle font-mono text-sm leading-relaxed text-text-primary focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 resize-none"
                    spellCheck={false}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="bg-app border border-border-subtle rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-border-subtle/30 text-xs uppercase text-text-muted font-medium">
                      <tr>
                        <th className="px-4 py-3 border-b border-border-subtle/50">Key Name</th>
                        <th className="px-4 py-3 border-b border-border-subtle/50">Provider</th>
                        <th className="px-4 py-3 border-b border-border-subtle/50 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle/50">
                      {previewItems.map((item) => (
                        <tr key={item.id} className="hover:bg-border-subtle/10 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                            {item.key}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={item.providerSlug}
                              onChange={(e) => handleProviderChange(item.id, e.target.value)}
                              className="bg-card border border-border-subtle rounded-md px-2 py-1 text-xs text-text-secondary focus:outline-none focus:border-accent w-48"
                            >
                              <option value="other">Unknown / Other</option>
                              {PROVIDERS.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 rounded text-text-muted hover:text-status-red hover:bg-status-red/10 transition-colors"
                              title="Ignore this key"
                            >
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center gap-4 bg-app/50 p-4 rounded-xl border border-border-subtle">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-text-muted mb-1.5">
                      Assign to Project (Optional)
                    </label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full bg-card border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                    >
                      <option value="">No Project</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 flex items-center justify-end">
                    <p className="text-xs text-text-muted mt-4">
                      {previewItems.length} keys will be encrypted
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-subtle shrink-0 flex items-center justify-end gap-3 bg-app/30">
          {step === 1 ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleParse}
                disabled={!rawEnv.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
              >
                <span>Parse Keys</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || previewItems.length === 0}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Upload size={16} />
                )}
                <span>Save to Vault</span>
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
