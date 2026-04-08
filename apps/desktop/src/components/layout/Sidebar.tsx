import { NavLink, useLocation } from "react-router-dom";
import {
  Shield,
  Search,
  Clock,
  Settings,
  Plus,
  Lock,
} from "lucide-react";

const navItems = [
  { to: "/vault", label: "Vault", icon: Shield },
  { to: "/finder", label: "API Finder", icon: Search },
  { to: "/expiring", label: "Expiring", icon: Clock },
  { to: "/settings", label: "Settings", icon: Settings },
];

// Placeholder projects for visual scaffolding (Phase 4 will make these dynamic)
const dummyProjects = [
  { id: "1", name: "MedSage", color: "#10b981" },
  { id: "2", name: "E-commerce", color: "#3b82f6" },
  { id: "3", name: "Hackathon Nov", color: "#8b5cf6" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="flex flex-col w-60 h-screen bg-sidebar border-r border-border-subtle shrink-0 no-select">
      {/* ─── Logo ────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border-subtle">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/20">
          <Shield className="w-4.5 h-4.5 text-accent" size={18} />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-text-primary tracking-tight">
            Vaultic
          </h1>
          <p className="text-xxs text-text-muted">API Key Manager</p>
        </div>
      </div>

      {/* ─── Navigation ──────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-2 text-xxs font-medium text-text-muted uppercase tracking-widest">
          Navigation
        </p>
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive =
            location.pathname === to ||
            (to === "/vault" && location.pathname === "/");

          return (
            <NavLink
              key={to}
              to={to}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-150 ease-out group relative
                ${
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-text-secondary hover:bg-card hover:text-text-primary"
                }
              `}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r-full" />
              )}
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              <span>{label}</span>
            </NavLink>
          );
        })}

        {/* ─── Projects Section ─────────────────────── */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-xxs font-medium text-text-muted uppercase tracking-widest">
              Projects
            </p>
            <button
              className="p-1 rounded-md text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
              title="New Project"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-0.5">
            {dummyProjects.map((project) => (
              <button
                key={project.id}
                className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:bg-card hover:text-text-primary transition-colors"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <span className="truncate">{project.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ─── Bottom Actions ──────────────────────────── */}
      <div className="px-3 py-3 border-t border-border-subtle">
        <button className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-text-muted hover:bg-status-red/10 hover:text-status-red transition-colors">
          <Lock size={16} />
          <span>Lock Vault</span>
        </button>
      </div>
    </aside>
  );
}
