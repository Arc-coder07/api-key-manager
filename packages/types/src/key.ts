// ─── API Key Entry ──────────────────────────────────────────────
// The core data model for a stored API key in the vault.
// Only `encrypted` contains sensitive data — all other fields are
// plaintext metadata for fast searching and filtering.

export interface ApiKeyEntry {
  /** Unique identifier (UUID v4) */
  id: string;
  /** User-chosen label, e.g. "OpenAI — MedSage project" */
  name: string;
  /** Provider slug, e.g. "openai", "stripe" */
  provider: string;
  /** API category for filtering */
  category: ApiCategory;
  /** Associated project ID, or null if unassigned */
  projectId: string | null;
  /** Pricing tier */
  tier: ApiTier;
  /** ISO 8601 expiry date, or null if no expiry */
  expiryDate: string | null;
  /** Direct link to provider's key management dashboard */
  dashboardUrl: string | null;
  /** User notes */
  notes: string;
  /** The encrypted key value — AES-GCM ciphertext + IV */
  encrypted: EncryptedBlob;
  /** ISO 8601 creation timestamp */
  createdAt: string;
  /** ISO 8601 last update timestamp */
  updatedAt: string;
}

export interface EncryptedBlob {
  /** Base64-encoded AES-GCM ciphertext */
  ciphertext: string;
  /** Base64-encoded 12-byte initialization vector */
  iv: string;
}

// ─── Categories ─────────────────────────────────────────────────

export type ApiCategory =
  | 'ai'
  | 'payments'
  | 'maps'
  | 'auth'
  | 'storage'
  | 'messaging'
  | 'analytics'
  | 'email'
  | 'cloud'
  | 'database'
  | 'search'
  | 'devtools'
  | 'other';

export const API_CATEGORIES: { value: ApiCategory; label: string; icon: string }[] = [
  { value: 'ai', label: 'AI & ML', icon: '🤖' },
  { value: 'payments', label: 'Payments', icon: '💳' },
  { value: 'maps', label: 'Maps & Location', icon: '🗺️' },
  { value: 'auth', label: 'Authentication', icon: '🔐' },
  { value: 'storage', label: 'Storage', icon: '📦' },
  { value: 'messaging', label: 'Messaging', icon: '💬' },
  { value: 'analytics', label: 'Analytics', icon: '📊' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'cloud', label: 'Cloud', icon: '☁️' },
  { value: 'database', label: 'Database', icon: '🗄️' },
  { value: 'search', label: 'Search', icon: '🔍' },
  { value: 'devtools', label: 'Dev Tools', icon: '🛠️' },
  { value: 'other', label: 'Other', icon: '📌' },
];

// ─── Tiers ──────────────────────────────────────────────────────

export type ApiTier = 'free' | 'paid' | 'trial';

export const API_TIERS: { value: ApiTier; label: string; color: string }[] = [
  { value: 'free', label: 'Free', color: '#10b981' },
  { value: 'paid', label: 'Paid', color: '#8b5cf6' },
  { value: 'trial', label: 'Trial', color: '#f59e0b' },
];
