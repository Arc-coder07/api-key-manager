# Vaultic

**Encrypted API key vault for developers.**

Vaultic is a desktop application that stores and manages your API keys with military-grade encryption. Your keys never leave your device — everything is encrypted locally with AES-256-GCM. No accounts, no cloud, no telemetry.

## Features

- **AES-256-GCM Encryption** — Every key is encrypted with industry-standard authenticated encryption
- **Zero-Knowledge Architecture** — Your master password is never stored; only a verification hash is kept
- **Project Organization** — Group API keys by project with color-coded labels
- **Provider Recognition** — 30+ built-in API provider metadata (icons, categories, docs links)
- **Smart Import/Export** — Import from `.env` files, export as `.env` or JSON with linked file sync
- **Expiry Tracking** — Set expiration dates on keys and get notified before they expire
- **Optional Password Lock** — Add a master password for extra protection, or run password-free
- **Auto-Lock** — Configurable inactivity timeout when password is enabled
- **Clipboard Auto-Clear** — Automatically clears copied keys from the clipboard
- **Session Security** — Failed attempt lockout with exponential backoff
- **Cross-Platform** — Built with Tauri for macOS, Windows, and Linux

## Architecture

Vaultic is a monorepo managed with [pnpm workspaces](https://pnpm.io/workspaces):

```
vaultic/
├── apps/
│   └── desktop/          # Tauri + React desktop application
│       ├── src/          # React frontend (TypeScript)
│       └── src-tauri/    # Rust backend (Tauri v2)
└── packages/
    ├── crypto/           # @vaultic/crypto — Encryption engine
    ├── providers/        # @vaultic/providers — API provider database
    └── types/            # @vaultic/types — Shared TypeScript definitions
```

### Package Responsibilities

| Package | Description |
|---------|-------------|
| `@vaultic/crypto` | Zero-knowledge encryption engine using the Web Crypto API. Handles key generation, PBKDF2 derivation, AES-GCM encrypt/decrypt, and key wrapping. |
| `@vaultic/providers` | Database of 30+ API provider metadata — icons, categories, documentation URLs, and key format patterns. |
| `@vaultic/types` | Shared TypeScript type definitions for keys, projects, vault configuration, and security state. |
| `@vaultic/desktop` | The Tauri desktop app with React frontend. Manages the vault lifecycle, UI, and native file system integration. |

### Reserved Types

The following types in `@vaultic/types` are exported but not currently used by the desktop app. They are reserved for future clients (web, mobile, CLI):

- `FilterOptions` — Vault filter state for UI frameworks
- `DrawerState` / `DrawerMode` — Side-panel state management
- `VaultState` / `VaultStatus` — Top-level vault lifecycle state

## Security Model

### Encryption

All API keys are encrypted using **AES-256-GCM** (Galois/Counter Mode), which provides both confidentiality and authenticity. Each encryption operation uses a unique, cryptographically random 12-byte IV (initialization vector).

### Key Derivation

When password protection is enabled, the master password is processed through **PBKDF2-HMAC-SHA-256** with **600,000 iterations** and a random 16-byte salt, following [OWASP recommendations](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

### Password Verification

A **verification hash** is computed by SHA-256 hashing the derived key material combined with a separate random salt. This allows password verification without storing the password or the derived key.

### Key Wrapping

In password mode, the encryption key is wrapped (encrypted) using **AES-KW** (Key Wrap) with the password-derived key. The wrapped key blob is stored in LocalForage. To decrypt any API key, the user must first unwrap the encryption key with their password.

### No-Password Mode

When running without a password, the raw encryption key is stored directly in the browser's IndexedDB (via LocalForage). The key is still an AES-256 key — your API keys are always encrypted at rest.

### Tauri Security

- **Content Security Policy (CSP)** restricts script and resource loading
- **File system access** is scoped to app data, downloads, and documents directories
- **File write operations** require prior path registration via native dialog selection
- **No remote code execution** — the app runs entirely locally

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 9
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- Tauri v2 system dependencies — see the [Tauri prerequisites guide](https://v2.tauri.app/start/prerequisites/)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/your-org/vaultic.git
cd vaultic

# Install dependencies
pnpm install

# Start the desktop app in development mode
pnpm dev:desktop
```

This launches both the Vite dev server (frontend) and the Tauri development window.

## Build

```bash
# Type-check all packages
pnpm typecheck

# Build the desktop app for production
pnpm build:desktop
```

The production build output will be in `apps/desktop/src-tauri/target/release/bundle/`.

## Development Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev:desktop` | Start the desktop app in dev mode |
| `pnpm build:desktop` | Build the desktop app for production |
| `pnpm build:packages` | Build all shared packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm lint` | Lint all packages |

## Tech Stack

- **Frontend**: React 19, TypeScript, Zustand, Framer Motion, Tailwind CSS
- **Backend**: Rust, Tauri v2
- **Crypto**: Web Crypto API (SubtleCrypto)
- **Storage**: LocalForage (IndexedDB)
- **Build**: Vite, pnpm workspaces

## License

MIT — see [LICENSE](./LICENSE) for details.
