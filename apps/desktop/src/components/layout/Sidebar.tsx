import { useState, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  Search,
  Clock,
  Settings,
  Plus,
  Lock,
  Pen,
  Trash2,
} from "lucide-react";

const navItems = [
  { to: "/vault", label: "Vault", icon: Shield },
  { to: "/finder", label: "API Finder", icon: Search },
  { to: "/expiring", label: "Expiring", icon: Clock },
  { to: "/settings", label: "Settings", icon: Settings },
];

import { useVaultStore } from "../../stores/useVaultStore";
import { ProjectModal } from "../projects/ProjectModal";
import { ProjectDeleteConfirmation } from "../projects/ProjectDeleteConfirmation";
import { getDaysUntil } from "../../utils/date";
import type { Project } from "@vaultic/types";
import { Layers } from "lucide-react";

export function Sidebar() {
  const location = useLocation();
  const lock = useVaultStore((s) => s.lock);
  const keys = useVaultStore((s) => s.keys);
  const projects = useVaultStore((s) => s.projects);
  const activeProjectId = useVaultStore((s) => s.activeProjectId);
  const setActiveProject = useVaultStore((s) => s.setActiveProject);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);

  const expiringCount = useMemo(() => {
    return keys.filter((k) => {
      const days = getDaysUntil(k.expiryDate);
      return days !== null && days <= 30;
    }).length;
  }, [keys]);

  return (
    <aside className="flex flex-col w-60 h-screen bg-sidebar border-r border-border-subtle shrink-0 no-select">
      {/* ─── Logo ────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border-subtle">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/20"
        >
          <Shield className="w-4.5 h-4.5 text-accent" size={18} />
        </motion.div>
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
          const isActive = location.pathname === to;

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
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r-full"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              <span>{label}</span>
              {to === "/expiring" && expiringCount > 0 && (
                <span className="ml-auto px-1.5 py-0.5 rounded text-xxs bg-status-amber/15 text-status-amber font-medium">
                  {expiringCount}
                </span>
              )}
            </NavLink>
          );
        })}

        {/* ─── Projects Section ─────────────────────── */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-xxs font-medium text-text-muted uppercase tracking-widest">
              Projects
            </p>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setProjectToEdit(null);
                setIsModalOpen(true);
              }}
              className="p-1 rounded-md text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
              title="New Project"
            >
              <Plus size={14} />
            </motion.button>
          </div>
          <div className="space-y-0.5 mt-2">
            <button
              onClick={() => setActiveProject(null)}
              className={`
                flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-sm transition-colors
                ${activeProjectId === null 
                  ? "bg-accent/10 text-accent font-medium" 
                  : "text-text-secondary hover:bg-card hover:text-text-primary"
                }
              `}
            >
              <Layers size={14} />
              <span>All Projects</span>
            </button>
            {projects.length === 0 ? (
              <button
                onClick={() => {
                  setProjectToEdit(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 w-full px-3 py-3 rounded-lg border border-dashed border-border-subtle text-xs text-text-muted hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all"
              >
                <Plus size={14} />
                <span>Create your first project</span>
              </button>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setActiveProject(project.id)}
                  onMouseEnter={() => setHoveredProjectId(project.id)}
                  onMouseLeave={() => setHoveredProjectId(null)}
                  className={`
                    group flex items-center justify-between w-full px-3 py-1.5 rounded-lg transition-colors cursor-pointer
                    ${activeProjectId === project.id
                      ? "bg-accent/10"
                      : "hover:bg-card"
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5 min-w-0" title={project.name}>
                    <motion.div
                      whileHover={{ scale: 1.3 }}
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span 
                      className={`truncate text-sm transition-colors ${
                        activeProjectId === project.id 
                          ? "text-accent font-medium" 
                          : "text-text-secondary group-hover:text-text-primary"
                      }`}
                    >
                      {project.name}
                    </span>
                  </div>
                  
                  {(hoveredProjectId === project.id || activeProjectId === project.id) && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToEdit(project);
                          setIsModalOpen(true);
                        }}
                        className="p-1 rounded text-text-muted hover:text-text-secondary hover:bg-border-subtle/50 transition-colors"
                        title="Edit Project"
                      >
                        <Pen size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(project);
                          setIsDeleteOpen(true);
                        }}
                        className="p-1 rounded text-text-muted hover:text-status-red hover:bg-status-red/10 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </nav>

      {/* ─── Bottom Actions ──────────────────────────── */}
      <div className="px-3 py-3 border-t border-border-subtle">
        <button 
          onClick={lock}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-text-muted hover:bg-status-red/10 hover:text-status-red transition-colors"
        >
          <Lock size={16} />
          <span>Lock Vault</span>
        </button>
      </div>
      {/* ─── Modals ────────────────────────────────────── */}
      <ProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectToEdit={projectToEdit}
      />
      
      <ProjectDeleteConfirmation 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        projectToDelete={projectToDelete}
      />
    </aside>
  );
}
