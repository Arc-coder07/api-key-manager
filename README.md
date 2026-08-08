<div align="center">
  
  # 🔒 Vaultic

  **Encrypted API key vault for developers.**
  
  <p>
    <a href="https://github.com/your-org/vaultic/releases/latest"><img alt="Release" src="https://img.shields.io/github/v/release/your-org/vaultic?style=flat-square&color=10b981"></a>
    <a href="https://github.com/your-org/vaultic/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/your-org/vaultic?style=flat-square&color=10b981"></a>
    <img alt="Platform" src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey?style=flat-square">
  </p>
  
  <p>
    Vaultic is an offline-first desktop application that stores and manages your API keys with military-grade encryption. Your keys never leave your device — everything is encrypted locally with AES-256-GCM. No accounts, no cloud, no telemetry.
  </p>
  
</div>

---

## ✨ Features

- **AES-256-GCM Encryption** — Every key is encrypted with industry-standard authenticated encryption.
- **Zero-Knowledge Architecture** — Your master password is never stored; only a verification hash is kept using PBKDF2-HMAC-SHA-256.
- **Project Organization** — Group API keys by project with color-coded labels.
- **Provider Recognition** — 30+ built-in API provider metadata (icons, categories, docs links).
- **Smart Import/Export** — Import from `.env` files, export as `.env` or JSON with linked file sync.
- **Expiry Tracking** — Set expiration dates on keys and get notified before they expire.
- **Cross-Platform** — Built with Tauri for macOS, Windows, and Linux.

## 🚀 Downloads & Installation

Download the latest release for your platform from our [Releases page](https://github.com/your-org/vaultic/releases):

- **macOS**: Download the `.dmg` or `.app` and drag to Applications.
- **Windows**: Download and run the `.msi` installer.
- **Linux**: Download the `.AppImage` and make it executable (`chmod +x`).

## 🏗 Architecture

Vaultic is a monorepo managed with [pnpm workspaces](https://pnpm.io/workspaces), leveraging **Tauri v2**, **Rust**, and **React 19**.

```text
vaultic/
├── apps/
│   ├── desktop/          # Tauri + React desktop application
│   └── website/          # Marketing & Docs website
└── packages/
    ├── crypto/           # @vaultic/crypto — Encryption engine
    ├── providers/        # @vaultic/providers — API provider database
    └── types/            # @vaultic/types — Shared TypeScript definitions
```

### Security Model

All API keys are encrypted using **AES-256-GCM** (Galois/Counter Mode). When password protection is enabled, the encryption key is wrapped (encrypted) using **AES-KW** (Key Wrap) with a key derived from your master password using **PBKDF2-HMAC-SHA-256** (600,000 iterations). 

The app enforces a strict **Content Security Policy (CSP)** and runs 100% locally with no remote code execution possibilities.

## 💻 Development

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 9
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- Tauri v2 system dependencies — see the [Tauri prerequisites guide](https://v2.tauri.app/start/prerequisites/)

### Getting Started

```bash
# Clone the repository
git clone https://github.com/your-org/vaultic.git
cd vaultic

# Install dependencies
pnpm install

# Start the desktop app in development mode
pnpm dev:desktop

# Start the marketing website in development mode
pnpm dev:website
```

### Build Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev:desktop` | Start the desktop app in dev mode |
| `pnpm dev:website` | Start the marketing website in dev mode |
| `pnpm build:desktop` | Build the desktop app for production |
| `pnpm build:website` | Build the marketing website for production |
| `pnpm typecheck` | Type-check all packages |

## 📜 License

MIT — see [LICENSE](./LICENSE) for details.
