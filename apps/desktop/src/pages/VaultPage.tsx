import { Search, Plus, Filter } from "lucide-react";
import { KeyCard } from "../components/vault/KeyCard";

// Dummy data for visual scaffolding — will be replaced with LocalForage data in Phase 3
const DUMMY_KEYS = [
  {
    id: "1",
    name: "OpenAI — MedSage Project",
    provider: "openai",
    category: "ai",
    tier: "paid" as const,
    expiryDays: null,
    projectName: "MedSage",
    projectColor: "#10b981",
  },
  {
    id: "2",
    name: "Stripe — E-commerce",
    provider: "stripe",
    category: "payments",
    tier: "free" as const,
    expiryDays: 5,
    projectName: "E-commerce",
    projectColor: "#3b82f6",
  },
  {
    id: "3",
    name: "Supabase — MedSage",
    provider: "supabase",
    category: "auth",
    tier: "free" as const,
    expiryDays: 22,
    projectName: "MedSage",
    projectColor: "#10b981",
  },
  {
    id: "4",
    name: "Twilio — SMS Service",
    provider: "twilio",
    category: "messaging",
    tier: "trial" as const,
    expiryDays: 3,
    projectName: "Hackathon Nov",
    projectColor: "#8b5cf6",
  },
  {
    id: "5",
    name: "Google Maps — Client App",
    provider: "google-maps",
    category: "maps",
    tier: "free" as const,
    expiryDays: null,
    projectName: "E-commerce",
    projectColor: "#3b82f6",
  },
  {
    id: "6",
    name: "Resend — Email Notifications",
    provider: "resend",
    category: "email",
    tier: "free" as const,
    expiryDays: 12,
    projectName: "MedSage",
    projectColor: "#10b981",
  },
  {
    id: "7",
    name: "GitHub — Personal Token",
    provider: "github",
    category: "devtools",
    tier: "free" as const,
    expiryDays: null,
  },
  {
    id: "8",
    name: "Anthropic — Claude API",
    provider: "anthropic",
    category: "ai",
    tier: "paid" as const,
    expiryDays: null,
    projectName: "MedSage",
    projectColor: "#10b981",
  },
];

export function VaultPage() {
  return (
    <div className="flex flex-col h-full">
      {/* ─── Header ──────────────────────────────────── */}
      <header className="flex items-center justify-between gap-4 px-8 py-5 border-b border-border-subtle shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Vault</h2>
          <p className="text-sm text-text-muted">
            {DUMMY_KEYS.length} keys stored securely
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors shadow-glow">
          <Plus size={16} />
          <span>Add Key</span>
        </button>
      </header>

      {/* ─── Search & Filters ────────────────────────── */}
      <div className="flex items-center gap-3 px-8 py-4 border-b border-border-subtle/50">
        <div className="relative flex-1 max-w-lg">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="Search keys, providers, projects..."
            className="
              w-full pl-10 pr-4 py-2.5 rounded-lg
              bg-card border border-border-subtle
              text-sm text-text-primary placeholder-text-muted
              focus:outline-none focus:border-accent/50 focus:shadow-glow
              transition-all duration-200
            "
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border-subtle text-sm text-text-secondary hover:bg-card hover:text-text-primary transition-colors">
          <Filter size={14} />
          <span>Filter</span>
        </button>
      </div>

      {/* ─── Key Grid ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {DUMMY_KEYS.map((key) => (
            <KeyCard
              key={key.id}
              {...key}
              onCopy={(id) => {
                // Phase 3: decrypt + clipboard + toast
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
