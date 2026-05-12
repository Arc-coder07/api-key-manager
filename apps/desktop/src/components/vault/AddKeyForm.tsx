import { useState, useEffect, useCallback } from "react";
import { Eye, EyeOff, Calendar, Link, FileText } from "lucide-react";
import { SearchableSelect } from "../ui/SearchableSelect";
import { ProviderIcon } from "../ui/ProviderIcon";
import { PROVIDERS } from "@vaultic/providers";
import { API_CATEGORIES, API_TIERS } from "@vaultic/types";
import type { ApiCategory, ApiTier } from "@vaultic/types";

interface AddKeyFormData {
  name: string;
  keyValue: string;
  provider: string;
  category: ApiCategory;
  projectId: string;
  tier: ApiTier;
  expiryDate: string;
  dashboardUrl: string;
  notes: string;
}

interface AddKeyFormProps {
  onSubmit: (data: AddKeyFormData) => void;
  onCancel: () => void;
  projects: { id: string; name: string; color: string }[];
  initialProvider?: string;
  /** Pre-select project (e.g. from active sidebar filter) */
  initialProjectId?: string;
  /** Called when user clicks "+ Create Project" inline */
  onCreateProject?: () => void;
  /** Edit mode: pre-fill all fields */
  editData?: {
    id: string;
    name: string;
    keyValue: string;
    provider: string;
    category: ApiCategory;
    projectId: string;
    tier: ApiTier;
    expiryDate: string;
    dashboardUrl: string;
    notes: string;
  } | null;
}

function getInitialFormState(
  initialProvider?: string,
  initialProjectId?: string,
  editData?: AddKeyFormProps["editData"]
): AddKeyFormData {
  if (editData) {
    return {
      name: editData.name,
      keyValue: editData.keyValue,
      provider: editData.provider,
      category: editData.category,
      projectId: editData.projectId,
      tier: editData.tier,
      expiryDate: editData.expiryDate,
      dashboardUrl: editData.dashboardUrl,
      notes: editData.notes,
    };
  }
  return {
    name: "",
    keyValue: "",
    provider: initialProvider || "",
    category: "other",
    projectId: initialProjectId || "",
    tier: "free",
    expiryDate: "",
    dashboardUrl: "",
    notes: "",
  };
}

export function AddKeyForm({
  onSubmit,
  onCancel,
  projects,
  initialProvider,
  initialProjectId,
  onCreateProject,
  editData,
}: AddKeyFormProps) {
  const [form, setForm] = useState<AddKeyFormData>(() =>
    getInitialFormState(initialProvider, initialProjectId, editData)
  );
  const [showKey, setShowKey] = useState(false);

  // Reset form when editData or drawer open state changes
  useEffect(() => {
    setForm(getInitialFormState(initialProvider, initialProjectId, editData));
    setShowKey(false);
  }, [initialProvider, initialProjectId, editData]);

  const providerOptions = PROVIDERS.map((p) => ({
    value: p.id,
    label: p.name,
    icon: <ProviderIcon provider={p.id} size={24} />,
    description: p.category,
  }));

  const categoryOptions = API_CATEGORIES.map((c) => ({
    value: c.value,
    label: `${c.icon} ${c.label}`,
  }));

  const projectOptions = [
    { value: "", label: "No project" },
    ...projects.map((p) => ({
      value: p.id,
      label: p.name,
      icon: (
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: p.color }}
        />
      ),
    })),
  ];

  const handleProviderChange = useCallback((providerId: string) => {
    const provider = PROVIDERS.find((p) => p.id === providerId);
    setForm((prev) => ({
      ...prev,
      provider: providerId,
      category: provider?.category ?? prev.category,
      dashboardUrl: provider?.dashboardUrl ?? prev.dashboardUrl,
      name: prev.name || (provider ? `${provider.name} API Key` : ""),
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.keyValue.trim()) return;
    onSubmit(form);
  };

  const isValid = form.name.trim() && form.keyValue.trim();
  const isEditMode = !!editData;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Provider */}
      <SearchableSelect
        label="Provider"
        options={providerOptions}
        value={form.provider}
        onChange={handleProviderChange}
        placeholder="Select a provider..."
        searchPlaceholder="Search providers..."
      />

      {/* Key Name */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          Key Name *
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder='e.g. "OpenAI — MedSage project"'
          className="w-full px-3 py-2.5 rounded-lg bg-card border border-border-subtle text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
        />
      </div>

      {/* Key Value */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          API Key Value *
        </label>
        <div className="relative">
          <input
            type={showKey ? "text" : "password"}
            value={form.keyValue}
            onChange={(e) => setForm((prev) => ({ ...prev, keyValue: e.target.value }))}
            placeholder="Paste your API key here..."
            className="w-full px-3 py-2.5 pr-10 rounded-lg bg-card border border-border-subtle text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Category & Tier Row */}
      <div className="grid grid-cols-2 gap-3">
        <SearchableSelect
          label="Category"
          options={categoryOptions}
          value={form.category}
          onChange={(v) => setForm((prev) => ({ ...prev, category: v as ApiCategory }))}
          placeholder="Select..."
        />
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Tier
          </label>
          <div className="flex gap-1">
            {API_TIERS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, tier: t.value }))}
                className={`
                  flex-1 px-2 py-2 rounded-lg text-xs font-medium
                  transition-all duration-150 border
                  ${
                    form.tier === t.value
                      ? "border-current"
                      : "border-border-subtle hover:border-border-active"
                  }
                `}
                style={{
                  color: form.tier === t.value ? t.color : "#71717a",
                  backgroundColor:
                    form.tier === t.value ? `${t.color}15` : "transparent",
                  borderColor: form.tier === t.value ? `${t.color}40` : undefined,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Project */}
      <SearchableSelect
        label="Project"
        options={projectOptions}
        value={form.projectId}
        onChange={(v) => setForm((prev) => ({ ...prev, projectId: v }))}
        placeholder="Assign to a project..."
        inlineAction={
          onCreateProject
            ? { label: "Create Project", onClick: onCreateProject }
            : undefined
        }
      />

      {/* Expiry Date */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
          <Calendar size={12} />
          Expiry Date
          <span className="text-text-muted">(optional)</span>
        </label>
        <input
          type="date"
          value={form.expiryDate}
          onChange={(e) => setForm((prev) => ({ ...prev, expiryDate: e.target.value }))}
          className="w-full px-3 py-2.5 rounded-lg bg-card border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors [color-scheme:dark]"
        />
      </div>

      {/* Dashboard URL */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
          <Link size={12} />
          Dashboard URL
          <span className="text-text-muted">(optional)</span>
        </label>
        <input
          type="url"
          value={form.dashboardUrl}
          onChange={(e) => setForm((prev) => ({ ...prev, dashboardUrl: e.target.value }))}
          placeholder="https://provider.com/dashboard/api-keys"
          className="w-full px-3 py-2.5 rounded-lg bg-card border border-border-subtle text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
          <FileText size={12} />
          Notes
          <span className="text-text-muted">(optional)</span>
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="What is this key for?"
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg bg-card border border-border-subtle text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-lg border border-border-subtle text-sm font-medium text-text-secondary hover:bg-card hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className={`
            flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
            ${
              isValid
                ? "bg-accent text-white hover:bg-accent-hover shadow-glow"
                : "bg-border-subtle text-text-muted cursor-not-allowed"
            }
          `}
        >
          {isEditMode ? "Save Changes" : "Encrypt & Save"}
        </button>
      </div>

      {/* Security Notice */}
      <p className="text-xxs text-text-muted text-center pt-1">
        🔒 Your key will be encrypted with AES-256-GCM before storage
      </p>
    </form>
  );
}
