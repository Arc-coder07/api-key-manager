// ─────────────────────────────────────────────────────────────────
// useVaultStore — The core Zustand store for Vaultic
// ─────────────────────────────────────────────────────────────────
// Manages:
//   - Vault lifecycle (setup → lock → unlock)
//   - Encryption key (CryptoKey) held in RAM only
//   - Keys and projects persisted via LocalForage
//   - Auto-lock timer
// ─────────────────────────────────────────────────────────────────

import { create } from "zustand";
import localforage from "localforage";
import { v4 as uuidv4 } from "uuid";
import {
  setupVault,
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
  isInitialized: boolean; // Has the user ever set a master password?
  isUnlocked: boolean;    // Is the vault currently accessible?
  isLoading: boolean;     // Is an async operation in progress?
  error: string | null;   // Last error message

  // ── Security (RAM only — NEVER persisted) ──────
  derivedKey: CryptoKey | null;
  lastActivity: number;

  // ── Data (synced with LocalForage) ─────────────
  keys: ApiKeyEntry[];
  projects: Project[];
  config: VaultConfig | null;

  // ── UI State ───────────────────────────────────
  activeProjectId: string | null;

  // ── Actions ────────────────────────────────────
  /** Load config from LocalForage and determine initial state */
  initialize: () => Promise<void>;

  /** First-time setup: create master password */
  setup: (password: string) => Promise<boolean>;

  /** Unlock vault with master password */
  unlock: (password: string) => Promise<boolean>;

  /** Lock vault: wipe derived key from RAM */
  lock: () => void;

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

  /** Delete a project, handling associated keys based on the strategy. 
   * Strategy can be 'orphan', 'delete', or 'reassign'. If 'reassign', reassignProjectId must be provided. */
  deleteProject: (id: string, cascadeStrategy: "orphan" | "delete" | "reassign", reassignProjectId?: string) => Promise<void>;

  /** Record user activity (for auto-lock timer) */
  touchActivity: () => void;

  /** Check if the auto-lock timeout has been exceeded */
  checkAutoLock: () => void;

  /** Set the active project for filtering in the Vault */
  setActiveProject: (projectId: string | null) => void;
}

// ─── Store Implementation ───────────────────────────────────────

export const useVaultStore = create<VaultStoreState>((set, get) => ({
  // ── Initial state ──────────────────────────────
  isInitialized: false,
  isUnlocked: false,
  isLoading: true,
  error: null,
  derivedKey: null,
  lastActivity: Date.now(),
  keys: [],
  projects: [],
  config: null,
  activeProjectId: null,

  // ── initialize ─────────────────────────────────
  // Called once on app startup to check if a vault exists
  initialize: async () => {
    try {
      const config = await configStore.getItem<VaultConfig>("vault_config");
      if (config && config.vaultInitialized) {
        set({ isInitialized: true, config, isLoading: false });
      } else {
        set({ isInitialized: false, isLoading: false });
      }
    } catch {
      set({ isLoading: false, error: "Failed to read vault configuration" });
    }
  },

  // ── setup ──────────────────────────────────────
  // First-time: creates salts, verification hash, and stores config
  setup: async (password: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await setupVault(password);

      const config: VaultConfig = {
        salt: result.salt,
        verificationSalt: result.verificationSalt,
        verificationHash: result.verificationHash,
        autoLockMinutes: 15,
        clipboardClearSeconds: 30,
        vaultInitialized: true,
      };

      await configStore.setItem("vault_config", config);

      // Load any existing keys/projects (should be empty on first setup)
      const keys = (await keysStore.getItem<ApiKeyEntry[]>("keys")) || [];
      const projects = (await projectsStore.getItem<Project[]>("projects")) || [];

      set({
        isInitialized: true,
        isUnlocked: true,
        isLoading: false,
        derivedKey: result.derivedKey,
        lastActivity: Date.now(),
        config,
        keys,
        projects,
      });

      return true;
    } catch {
      set({ isLoading: false, error: "Failed to create vault" });
      return false;
    }
  },

  // ── unlock ─────────────────────────────────────
  // Returning user: verify password and derive key
  unlock: async (password: string) => {
    const { config } = get();
    if (!config) {
      set({ error: "Vault configuration not found" });
      return false;
    }

    set({ isLoading: true, error: null });
    try {
      const derivedKey = await verifyAndDeriveKey(
        password,
        config.salt,
        config.verificationSalt,
        config.verificationHash
      );

      if (!derivedKey) {
        set({ isLoading: false, error: "Incorrect password" });
        return false;
      }

      // Load persisted data
      const keys = (await keysStore.getItem<ApiKeyEntry[]>("keys")) || [];
      const projects = (await projectsStore.getItem<Project[]>("projects")) || [];

      set({
        isUnlocked: true,
        isLoading: false,
        derivedKey,
        lastActivity: Date.now(),
        keys,
        projects,
        error: null,
      });

      return true;
    } catch {
      set({ isLoading: false, error: "Failed to unlock vault" });
      return false;
    }
  },

  // ── lock ───────────────────────────────────────
  // Wipe derived key from memory
  lock: () => {
    set({
      isUnlocked: false,
      derivedKey: null,
      keys: [],
      projects: [],
      error: null,
    });
  },

  // ── addKey ─────────────────────────────────────
  addKey: async (input: NewKeyInput) => {
    const { derivedKey, keys } = get();
    if (!derivedKey) throw new Error("Vault is locked");

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
    const { derivedKey, keys } = get();
    if (!derivedKey) throw new Error("Vault is locked");

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
    const { keys } = get();
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
  checkAutoLock: () => {
    const { isUnlocked, lastActivity, config, lock } = get();
    if (!isUnlocked || !config) return;

    const timeoutMs = config.autoLockMinutes * 60 * 1000;
    if (Date.now() - lastActivity > timeoutMs) {
      lock();
    }
  },

  // ── setActiveProject ───────────────────────────
  setActiveProject: (projectId: string | null) => {
    set({ activeProjectId: projectId });
  },
}));
