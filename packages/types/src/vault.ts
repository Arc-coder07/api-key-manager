// ─── Vault Configuration ────────────────────────────────────────
// Persisted to LocalForage — contains encryption key metadata
// and security settings. The actual encryption key is stored
// separately (raw in keyStore, or wrapped in config when password
// is enabled).

export interface VaultConfig {
  /** Whether the vault has been initialized */
  vaultInitialized: boolean;

  // ── Password Mode (opt-in) ─────────────────────
  /** Whether a password is required to access the vault */
  passwordEnabled: boolean;
  /** Base64-encoded PBKDF2 salt for key derivation (only when passwordEnabled) */
  salt?: string;
  /** Base64-encoded salt used for verification hash (only when passwordEnabled) */
  verificationSalt?: string;
  /** Base64-encoded SHA-256 hash for password verification (only when passwordEnabled) */
  verificationHash?: string;
  /** The encryption key wrapped (encrypted) with the password-derived key (only when passwordEnabled) */
  wrappedKey?: { ciphertext: string; iv: string };

  // ── Settings ───────────────────────────────────
  /** Auto-lock timeout in minutes (default: 15, only relevant when passwordEnabled) */
  autoLockMinutes: number;
  /** Clipboard auto-clear timeout in seconds (default: 30) */
  clipboardClearSeconds: number;

  // ── Finder ─────────────────────────────────────
  /** Number of searches performed in the API finder today */
  finderSearchCount?: number;
  /** ISO Date string of the last search to dictate daily resets */
  finderSearchDate?: string;
}

// ─── Vault State ────────────────────────────────────────────────

export type VaultStatus = 'uninitialized' | 'locked' | 'unlocked';

export interface VaultState {
  status: VaultStatus;
  /** The AES-GCM CryptoKey for encryption — RAM only */
  derivedKey: CryptoKey | null;
  /** Timestamp of last user activity (for auto-lock) */
  lastActivity: number;
}

// ─── Filter Options ─────────────────────────────────────────────

export interface FilterOptions {
  search: string;
  category: string | null;
  tier: string | null;
  projectId: string | null;
  expiryStatus: 'all' | 'expiring' | 'expired' | null;
}

// ─── Drawer State ───────────────────────────────────────────────

export type DrawerMode = 'closed' | 'add' | 'edit' | 'view';

export interface DrawerState {
  mode: DrawerMode;
  /** The key ID being edited or viewed (null for 'add' mode) */
  keyId: string | null;
}

// ─── Linked Export ──────────────────────────────────────────────
// Represents a link between a project's keys and a file on disk.
// When autoSync is enabled, Vaultic updates the file on key changes.

export interface LinkedExport {
  /** Unique identifier (UUID v4) */
  id: string;
  /** The project this export is linked to (null = all keys / vault-wide) */
  projectId: string | null;
  /** Absolute OS file path where the export lives */
  filePath: string;
  /** Export format */
  format: 'env' | 'json';
  /** Whether to include decrypted values or metadata-only */
  exportType: 'full' | 'metadata';
  /** Whether to prompt for re-sync when keys change */
  autoSync: boolean;
  /** ISO 8601 timestamp of last successful sync */
  lastSynced: string;
  /** ISO 8601 timestamp when this link was created */
  createdAt: string;
}
