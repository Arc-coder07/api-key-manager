// ─────────────────────────────────────────────────────────────────
// useVaultStore — The core Zustand store for Vaultic
// ─────────────────────────────────────────────────────────────────
// Manages:
//   - Vault lifecycle (setup → auto-unlock / password-unlock)
//   - Encryption key (CryptoKey) held in RAM only
//   - Keys and projects persisted via LocalForage
//   - Optional password protection (wrap/unwrap encryption key)
//   - Auto-lock timer (only when password is enabled)
// ─────────────────────────────────────────────────────────────────

import { create } from "zustand";
import localforage from "localforage";
import { v4 as uuidv4 } from "uuid";
import {
  generateEncryptionKey,
  exportKey,
  importKey,
  wrapKey,
  unwrapKey,
  createPasswordEnvelope,
  verifyAndDeriveKey,
  encrypt,
  decrypt,
} from "@vaultic/crypto";
import type {
  ApiKeyEntry,
  ApiCategory,
  ApiTier,
  Project,
  VaultConfig,
  LinkedExport,
} from "@vaultic/types";

// ─── LocalForage stores ─────────────────────────────────────────

const configStore = localforage.createInstance({
  name: "vaultic",
  storeName: "config",
});

const keysStore = localforage.createInstance({
  name: "vaultic",
  storeName: "keys",
});

const projectsStore = localforage.createInstance({
  name: "vaultic",
  storeName: "projects",
});

const linkedExportsStore = localforage.createInstance({
  name: "vaultic",
  storeName: "linked_exports",
});

/** Separate store for the raw encryption key (only used when password is NOT enabled) */
const keyStore = localforage.createInstance({
  name: "vaultic",
  storeName: "encryption_key",
});

// ─── Types ──────────────────────────────────────────────────────

export interface NewKeyInput {
  name: string;
  keyValue: string; // plaintext — will be encrypted before storage
  provider: string;
  category: ApiCategory;
  projectId: string;
  tier: ApiTier;
  expiryDate: string;
  dashboardUrl: string;
  notes: string;
}

interface VaultStoreState {
  // ── Lifecycle ──────────────────────────────────
  isInitialized: boolean; // Has the vault been set up?
  isUnlocked: boolean;    // Is the vault currently accessible?
  isLoading: boolean;     // Is an async operation in progress?
  isMigrating: boolean;   // Is a password change in progress?
  migrationProgress: { current: number; total: number } | null;
  error: string | null;   // Last error message

  // ── Security (RAM only — NEVER persisted) ──────
  derivedKey: CryptoKey | null;
  lastActivity: number;

  // ── Data (synced with LocalForage) ─────────────
  keys: ApiKeyEntry[];
  projects: Project[];
  config: VaultConfig | null;
  linkedExports: LinkedExport[];

  // ── UI State ───────────────────────────────────
  activeProjectId: string | null;

  // ── Actions ────────────────────────────────────
  /** Load config from LocalForage and determine initial state */
  initialize: () => Promise<void>;

  /** First-time setup: generates random encryption key, no password needed */
  setup: () => Promise<boolean>;

  /** Unlock vault with master password (only when passwordEnabled) */
  unlock: (password: string) => Promise<boolean>;

  /** Lock vault: wipe derived key from RAM (only meaningful when passwordEnabled) */
  lock: () => void;

  /** Enable password protection: wraps the encryption key with a password */
  enablePassword: (password: string) => Promise<boolean>;

  /** Disable password protection: unwraps the key and stores it raw */
  disablePassword: (currentPassword: string) => Promise<boolean>;

  /** Change master password: re-wraps the encryption key (no re-encryption needed!) */
  changeMasterPassword: (currentPass: string, newPass: string) => Promise<boolean>;

  /** Add a new API key (encrypts the value) */
  addKey: (input: NewKeyInput) => Promise<void>;

  /** Update an existing API key */
  updateKey: (id: string, updates: Partial<NewKeyInput>) => Promise<void>;

  /** Delete a key by ID */
  deleteKey: (id: string) => Promise<void>;

  /** Decrypt and return a key value (for clipboard copy) */
  decryptKey: (id: string) => Promise<string | null>;

  /** Add a new project */
  addProject: (name: string, description: string, color: string) => Promise<Project>;

  /** Update an existing project */
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;

  /** Delete a project, handling associated keys based on the strategy. */
  deleteProject: (id: string, cascadeStrategy: "orphan" | "delete" | "reassign", reassignProjectId?: string) => Promise<void>;

  /** Record user activity (for auto-lock timer) */
  touchActivity: () => void;

  /** Check if the auto-lock timeout has been exceeded */
  checkAutoLock: () => void;

  /** Set the active project for filtering in the Vault */
  setActiveProject: (projectId: string | null) => void;

  /** Update configurable vault settings safely */
  updateConfig: (updates: Partial<VaultConfig>) => Promise<void>;

  /** Increment the finder search count for today, resetting if a new day. */
  incrementSearchCount: () => Promise<number>;

  /** Linked Export CRUD */
  addLinkedExport: (link: Omit<LinkedExport, 'id' | 'createdAt' | 'lastSynced'>) => Promise<LinkedExport>;
  removeLinkedExport: (id: string) => Promise<void>;
  updateLinkedExport: (id: string, updates: Partial<LinkedExport>) => Promise<void>;
  getLinkedExportsForProject: (projectId: string | null) => LinkedExport[];
}

// ─── Helper: Load all vault data from LocalForage ───────────────

async function loadVaultData() {
  const keys = (await keysStore.getItem<ApiKeyEntry[]>("keys")) || [];
  const projects = (await projectsStore.getItem<Project[]>("projects")) || [];
  const linkedExports = (await linkedExportsStore.getItem<LinkedExport[]>("linked_exports")) || [];
  return { keys, projects, linkedExports };
}

// ─── Store Implementation ───────────────────────────────────────

export const useVaultStore = create<VaultStoreState>((set, get) => ({
  // ── Initial state ──────────────────────────────
  isInitialized: false,
  isUnlocked: false,
  isLoading: true,
  isMigrating: false,
  migrationProgress: null,
  error: null,
  derivedKey: null,
  lastActivity: Date.now(),
  keys: [],
  projects: [],
  config: null,
  linkedExports: [],
  activeProjectId: null,

  // ── initialize ─────────────────────────────────
  // Called once on app startup to check if a vault exists
  // and auto-unlock if no password is required
  initialize: async () => {
    try {
      const config = await configStore.getItem<VaultConfig>("vault_config");

      if (!config || !config.vaultInitialized) {
        // First-time user — show onboarding
        set({ isInitialized: false, isLoading: false });
        return;
      }

      // Vault exists — check if we can auto-unlock
      if (!config.passwordEnabled) {
        // No password — load the raw key and auto-unlock
        const rawKeyBase64 = await keyStore.getItem<string>("raw_key");
        if (rawKeyBase64) {
          const encryptionKey = await importKey(rawKeyBase64);
          const data = await loadVaultData();
          set({
            isInitialized: true,
            isUnlocked: true,
            isLoading: false,
            derivedKey: encryptionKey,
            lastActivity: Date.now(),
            config,
            ...data,
          });
          return;
        }
        // Key missing — something went wrong, treat as uninitialized
        set({ isInitialized: false, isLoading: false });
        return;
      }

      // Password enabled — user must unlock manually
      set({ isInitialized: true, config, isLoading: false });
    } catch {
      set({ isLoading: false, error: "Failed to read vault configuration" });
    }
  },

  // ── setup ──────────────────────────────────────
  // First-time: generates random encryption key, no password needed
  setup: async () => {
    set({ isLoading: true, error: null });
    try {
      // Generate a random AES-256-GCM encryption key
      const encryptionKey = await generateEncryptionKey();
      const rawKeyBase64 = await exportKey(encryptionKey);

      // Store the raw key in a separate LocalForage instance
      await keyStore.setItem("raw_key", rawKeyBase64);

      // Create vault config — no password by default
      const config: VaultConfig = {
        vaultInitialized: true,
        passwordEnabled: false,
        autoLockMinutes: 15,
        clipboardClearSeconds: 30,
      };

      await configStore.setItem("vault_config", config);

      // Load any existing keys/projects (should be empty on first setup)
      const data = await loadVaultData();

      set({
        isInitialized: true,
        isUnlocked: true,
        isLoading: false,
        derivedKey: encryptionKey,
        lastActivity: Date.now(),
        config,
        ...data,
      });

      return true;
    } catch {
      set({ isLoading: false, error: "Failed to create vault" });
      return false;
    }
  },

  // ── unlock ─────────────────────────────────────
  // Returning user with password enabled: verify password and unwrap key
  unlock: async (password: string) => {
    const { config } = get();
    if (!config || !config.passwordEnabled) {
      set({ error: "Password is not enabled" });
      return false;
    }
    if (!config.salt || !config.verificationSalt || !config.verificationHash || !config.wrappedKey) {
      set({ error: "Invalid vault configuration" });
      return false;
    }

    set({ isLoading: true, error: null });
    try {
      // Verify password
      const passwordKey = await verifyAndDeriveKey(
        password,
        config.salt,
        config.verificationSalt,
        config.verificationHash
      );

      if (!passwordKey) {
        set({ isLoading: false, error: "Incorrect password" });
        return false;
      }

      // Unwrap the encryption key
      const encryptionKey = await unwrapKey(
        config.wrappedKey.ciphertext,
        config.wrappedKey.iv,
        passwordKey
      );

      // Load persisted data
      const data = await loadVaultData();

      set({
        isUnlocked: true,
        isLoading: false,
        derivedKey: encryptionKey,
        lastActivity: Date.now(),
        ...data,
        error: null,
      });

      return true;
    } catch {
      set({ isLoading: false, error: "Failed to unlock vault" });
      return false;
    }
  },

  // ── lock ───────────────────────────────────────
  // Wipe derived key from memory (only useful when password is enabled)
  lock: () => {
    set({
      isUnlocked: false,
      derivedKey: null,
      keys: [],
      projects: [],
      linkedExports: [],
      error: null,
    });
  },

  // ── enablePassword ─────────────────────────────
  // Wraps the current encryption key with a password-derived key
  enablePassword: async (password: string) => {
    const { derivedKey, config } = get();
    if (!derivedKey || !config) {
      set({ error: "Vault must be unlocked" });
      return false;
    }

    set({ isLoading: true, error: null });
    try {
      // Create password envelope (salt, verification hash, derived key)
      const envelope = await createPasswordEnvelope(password);

      // Wrap the encryption key with the password-derived key
      const wrapped = await wrapKey(derivedKey, envelope.derivedKey);

      // Delete the raw key from storage
      await keyStore.removeItem("raw_key");

      // Update config with password artifacts
      const newConfig: VaultConfig = {
        ...config,
        passwordEnabled: true,
        salt: envelope.salt,
        verificationSalt: envelope.verificationSalt,
        verificationHash: envelope.verificationHash,
        wrappedKey: wrapped,
      };

      await configStore.setItem("vault_config", newConfig);
      set({ config: newConfig, isLoading: false });

      return true;
    } catch {
      set({ isLoading: false, error: "Failed to enable password" });
      return false;
    }
  },

  // ── disablePassword ────────────────────────────
  // Unwraps the key and stores it raw, removing password requirement
  disablePassword: async (currentPassword: string) => {
    const { config, derivedKey } = get();
    if (!config || !config.passwordEnabled || !derivedKey) {
      set({ error: "Password is not enabled or vault is locked" });
      return false;
    }
    if (!config.salt || !config.verificationSalt || !config.verificationHash) {
      set({ error: "Invalid vault configuration" });
      return false;
    }

    set({ isLoading: true, error: null });
    try {
      // Verify current password
      const passwordKey = await verifyAndDeriveKey(
        currentPassword,
        config.salt,
        config.verificationSalt,
        config.verificationHash
      );

      if (!passwordKey) {
        set({ isLoading: false, error: "Incorrect password" });
        return false;
      }

      // Export the encryption key and store it raw
      const rawKeyBase64 = await exportKey(derivedKey);
      await keyStore.setItem("raw_key", rawKeyBase64);

      // Remove password artifacts from config
      const newConfig: VaultConfig = {
        vaultInitialized: config.vaultInitialized,
        passwordEnabled: false,
        autoLockMinutes: config.autoLockMinutes,
        clipboardClearSeconds: config.clipboardClearSeconds,
        finderSearchCount: config.finderSearchCount,
        finderSearchDate: config.finderSearchDate,
      };

      await configStore.setItem("vault_config", newConfig);
      set({ config: newConfig, isLoading: false });

      return true;
    } catch {
      set({ isLoading: false, error: "Failed to disable password" });
      return false;
    }
  },

  // ── changeMasterPassword ──────────────────────────
  // Simply re-wraps the encryption key with a new password.
  // No re-encryption of individual keys needed!
  changeMasterPassword: async (currentPass: string, newPass: string) => {
    const { config, derivedKey } = get();
    if (!config || !config.passwordEnabled || !derivedKey) {
      set({ error: "Password must be enabled and vault unlocked" });
      return false;
    }
    if (!config.salt || !config.verificationSalt || !config.verificationHash) {
      set({ error: "Invalid vault configuration" });
      return false;
    }

    set({ isMigrating: true, error: null });

    try {
      // 1. Verify current password
      const currentPasswordKey = await verifyAndDeriveKey(
        currentPass,
        config.salt,
        config.verificationSalt,
        config.verificationHash
      );
      if (!currentPasswordKey) {
        set({ isMigrating: false, error: "Incorrect current password" });
        return false;
      }

      // 2. Create new password envelope
      const newEnvelope = await createPasswordEnvelope(newPass);

      // 3. Re-wrap the encryption key with the new password key
      const newWrapped = await wrapKey(derivedKey, newEnvelope.derivedKey);

      // 4. Update config
      const newConfig: VaultConfig = {
        ...config,
        salt: newEnvelope.salt,
        verificationSalt: newEnvelope.verificationSalt,
        verificationHash: newEnvelope.verificationHash,
        wrappedKey: newWrapped,
      };

      await configStore.setItem("vault_config", newConfig);

      set({
        config: newConfig,
        isMigrating: false,
      });

      return true;
    } catch {
      set({
        isMigrating: false,
        error: "Password change failed. Your old password is still active.",
      });
      return false;
    }
  },

  // ── addKey ─────────────────────────────────────
  addKey: async (input: NewKeyInput) => {
    const { derivedKey, keys, isMigrating } = get();
    if (!derivedKey) throw new Error("Vault is locked");
    if (isMigrating) throw new Error("Cannot modify vault during migration");

    // Encrypt the plaintext key value
    const { ciphertext, iv } = await encrypt(input.keyValue, derivedKey);

    const now = new Date().toISOString();
    const newKey: ApiKeyEntry = {
      id: uuidv4(),
      name: input.name,
      provider: input.provider,
      category: input.category,
      projectId: input.projectId || null,
      tier: input.tier,
      expiryDate: input.expiryDate || null,
      dashboardUrl: input.dashboardUrl || null,
      notes: input.notes || "",
      encrypted: { ciphertext, iv },
      createdAt: now,
      updatedAt: now,
    };

    const updatedKeys = [...keys, newKey];
    await keysStore.setItem("keys", updatedKeys);
    set({ keys: updatedKeys });
  },

  // ── updateKey ──────────────────────────────────
  updateKey: async (id: string, updates: Partial<NewKeyInput>) => {
    const { derivedKey, keys, isMigrating } = get();
    if (!derivedKey) throw new Error("Vault is locked");
    if (isMigrating) throw new Error("Cannot modify vault during migration");

    const keyIndex = keys.findIndex((k) => k.id === id);
    if (keyIndex === -1) throw new Error("Key not found");

    const existingKey = keys[keyIndex];
    let newEncrypted = existingKey.encrypted;

    // If key value is updated, re-encrypt it
    if (updates.keyValue !== undefined) {
      const { ciphertext, iv } = await encrypt(updates.keyValue, derivedKey);
      newEncrypted = { ciphertext, iv };
    }

    const updatedKey: ApiKeyEntry = {
      ...existingKey,
      name: updates.name ?? existingKey.name,
      provider: updates.provider ?? existingKey.provider,
      category: updates.category ?? existingKey.category,
      projectId: updates.projectId !== undefined ? updates.projectId || null : existingKey.projectId,
      tier: updates.tier ?? existingKey.tier,
      expiryDate: updates.expiryDate !== undefined ? updates.expiryDate || null : existingKey.expiryDate,
      dashboardUrl: updates.dashboardUrl !== undefined ? updates.dashboardUrl || null : existingKey.dashboardUrl,
      notes: updates.notes ?? existingKey.notes,
      encrypted: newEncrypted,
      updatedAt: new Date().toISOString(),
    };

    const updatedKeys = [...keys];
    updatedKeys[keyIndex] = updatedKey;
    await keysStore.setItem("keys", updatedKeys);
    set({ keys: updatedKeys });
  },

  // ── deleteKey ──────────────────────────────────
  deleteKey: async (id: string) => {
    const { keys, isMigrating } = get();
    if (isMigrating) throw new Error("Cannot modify vault during migration");
    const updatedKeys = keys.filter((k) => k.id !== id);
    await keysStore.setItem("keys", updatedKeys);
    set({ keys: updatedKeys });
  },

  // ── decryptKey ─────────────────────────────────
  // Returns the plaintext key value (for copy-to-clipboard)
  decryptKey: async (id: string) => {
    const { derivedKey, keys } = get();
    if (!derivedKey) return null;

    const key = keys.find((k) => k.id === id);
    if (!key) return null;

    try {
      const plaintext = await decrypt(
        key.encrypted.ciphertext,
        key.encrypted.iv,
        derivedKey
      );
      return plaintext;
    } catch {
      return null;
    }
  },

  // ── addProject ─────────────────────────────────
  addProject: async (name: string, description: string, color: string) => {
    const { projects } = get();
    const now = new Date().toISOString();
    const newProject: Project = {
      id: uuidv4(),
      name,
      description,
      color,
      createdAt: now,
      updatedAt: now,
    };

    const updatedProjects = [...projects, newProject];
    await projectsStore.setItem("projects", updatedProjects);
    set({ projects: updatedProjects });
    return newProject;
  },

  // ── updateProject ──────────────────────────────
  updateProject: async (id: string, updates: Partial<Project>) => {
    const { projects } = get();
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Project not found");

    const updatedProject = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updatedProjects = [...projects];
    updatedProjects[index] = updatedProject;

    await projectsStore.setItem("projects", updatedProjects);
    set({ projects: updatedProjects });
  },

  // ── deleteProject ──────────────────────────────
  deleteProject: async (id: string, cascadeStrategy: "orphan" | "delete" | "reassign", reassignProjectId?: string) => {
    const { projects, keys } = get();

    const updatedProjects = projects.filter((p) => p.id !== id);
    await projectsStore.setItem("projects", updatedProjects);

    let updatedKeys = [...keys];
    let keysChanged = false;

    if (cascadeStrategy === "orphan") {
      updatedKeys = updatedKeys.map((k) =>
        k.projectId === id ? { ...k, projectId: null, updatedAt: new Date().toISOString() } : k
      );
      keysChanged = true;
    } else if (cascadeStrategy === "delete") {
      updatedKeys = updatedKeys.filter((k) => k.projectId !== id);
      keysChanged = true;
    } else if (cascadeStrategy === "reassign") {
      if (!reassignProjectId) throw new Error("reassignProjectId is required when using reassign strategy");
      updatedKeys = updatedKeys.map((k) =>
        k.projectId === id ? { ...k, projectId: reassignProjectId, updatedAt: new Date().toISOString() } : k
      );
      keysChanged = true;
    }

    if (keysChanged) {
      await keysStore.setItem("keys", updatedKeys);
      set({ projects: updatedProjects, keys: updatedKeys });
    } else {
      set({ projects: updatedProjects });
    }
  },

  // ── touchActivity ──────────────────────────────
  touchActivity: () => {
    set({ lastActivity: Date.now() });
  },

  // ── checkAutoLock ──────────────────────────────
  // Only locks when password is enabled
  checkAutoLock: () => {
    const { isUnlocked, lastActivity, config, lock } = get();
    if (!isUnlocked || !config) return;
    // Only auto-lock if password is enabled
    if (!config.passwordEnabled) return;
    if (config.autoLockMinutes === 0) return;

    const timeoutMs = config.autoLockMinutes * 60 * 1000;
    if (Date.now() - lastActivity > timeoutMs) {
      lock();
    }
  },

  // ── setActiveProject ───────────────────────────
  setActiveProject: (projectId: string | null) => {
    set({ activeProjectId: projectId });
  },

  // ── incrementSearchCount ───────────────────────
  incrementSearchCount: async () => {
    const { config } = get();
    if (!config) return 0;

    // YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];
    let newCount = (config.finderSearchCount || 0) + 1;

    // Reset if it's a new day
    if (config.finderSearchDate !== today) {
      newCount = 1;
    }

    const newConfig = {
      ...config,
      finderSearchCount: newCount,
      finderSearchDate: today,
    };

    await configStore.setItem("vault_config", newConfig);
    set({ config: newConfig });
    return newCount;
  },

  // ── updateConfig ───────────────────────────────────
  updateConfig: async (updates: Partial<VaultConfig>) => {
    const { config } = get();
    if (!config) return;
    const newConfig = { ...config, ...updates };
    await configStore.setItem("vault_config", newConfig);
    set({ config: newConfig });
  },

  // ── Linked Exports ─────────────────────────────

  addLinkedExport: async (link) => {
    const now = new Date().toISOString();
    const newLink: LinkedExport = {
      ...link,
      id: uuidv4(),
      createdAt: now,
      lastSynced: now,
    };
    const updated = [...get().linkedExports, newLink];
    await linkedExportsStore.setItem("linked_exports", updated);
    set({ linkedExports: updated });
    return newLink;
  },

  removeLinkedExport: async (id: string) => {
    const updated = get().linkedExports.filter((l) => l.id !== id);
    await linkedExportsStore.setItem("linked_exports", updated);
    set({ linkedExports: updated });
  },

  updateLinkedExport: async (id: string, updates: Partial<LinkedExport>) => {
    const links = get().linkedExports;
    const idx = links.findIndex((l) => l.id === id);
    if (idx === -1) return;
    const updated = [...links];
    updated[idx] = { ...updated[idx], ...updates };
    await linkedExportsStore.setItem("linked_exports", updated);
    set({ linkedExports: updated });
  },

  getLinkedExportsForProject: (projectId: string | null) => {
    return get().linkedExports.filter((l) => l.projectId === projectId);
  },
}));
