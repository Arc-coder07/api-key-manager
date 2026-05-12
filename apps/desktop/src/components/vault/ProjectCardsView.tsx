import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  FolderOpen,
  Key,
  Plus,
  Link2,
  InboxIcon,
} from "lucide-react";
import type { Project, ApiKeyEntry, LinkedExport } from "@vaultic/types";

interface ProjectCardsViewProps {
  projects: Project[];
  keys: ApiKeyEntry[];
  linkedExports: LinkedExport[];
  onSelectProject: (projectId: string | null) => void;
  onAddKey: () => void;
  onAddProject: () => void;
}

interface ProjectCardData {
  id: string | null;
  name: string;
  description: string;
  color: string;
  keyCount: number;
  lastUpdated: string | null;
  isLinked: boolean;
  isUnassigned?: boolean;
}

export function ProjectCardsView({
  projects,
  keys,
  linkedExports,
  onSelectProject,
  onAddKey,
  onAddProject,
}: ProjectCardsViewProps) {
  const cards = useMemo(() => {
    const result: ProjectCardData[] = [];

    // Real projects
    projects.forEach((project) => {
      const projectKeys = keys.filter((k) => k.projectId === project.id);
      const latestKey = projectKeys.reduce<string | null>((latest, k) => {
        if (!latest) return k.updatedAt;
        return k.updatedAt > latest ? k.updatedAt : latest;
      }, null);
      const hasLink = linkedExports.some((l) => l.projectId === project.id);

      result.push({
        id: project.id,
        name: project.name,
        description: project.description || "",
        color: project.color,
        keyCount: projectKeys.length,
        lastUpdated: latestKey || project.updatedAt,
        isLinked: hasLink,
      });
    });

    // Unassigned pseudo-card
    const unassignedKeys = keys.filter((k) => !k.projectId);
    if (unassignedKeys.length > 0) {
      const latestKey = unassignedKeys.reduce<string | null>((latest, k) => {
        if (!latest) return k.updatedAt;
        return k.updatedAt > latest ? k.updatedAt : latest;
      }, null);

      result.push({
        id: "__unassigned__",
        name: "Unassigned",
        description: "Keys not assigned to any project",
        color: "#71717a",
        keyCount: unassignedKeys.length,
        lastUpdated: latestKey,
        isLinked: false,
        isUnassigned: true,
      });
    }

    return result;
  }, [projects, keys, linkedExports]);

  const totalKeys = keys.length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">
            {projects.length} {projects.length === 1 ? "project" : "projects"} · {totalKeys} total keys
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <motion.button
            key={card.id || "unassigned"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={() => {
              if (card.isUnassigned) {
                onSelectProject(null);
              } else {
                onSelectProject(card.id);
              }
            }}
            className="group flex flex-col p-5 rounded-xl bg-card border border-border-subtle text-left hover:bg-card-hover hover:border-border-active hover:shadow-card-hover card-transition"
          >
            {/* Top: icon + name */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${card.color}15`,
                  }}
                >
                  {card.isUnassigned ? (
                    <InboxIcon size={20} style={{ color: card.color }} />
                  ) : (
                    <FolderOpen size={20} style={{ color: card.color }} />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary truncate">
                    {card.name}
                  </h3>
                  {card.description && (
                    <p className="text-xxs text-text-muted truncate mt-0.5">
                      {card.description}
                    </p>
                  )}
                </div>
              </div>

              {card.isLinked && (
                <div className="shrink-0 p-1" title="Linked to a file">
                  <Link2 size={14} className="text-accent" />
                </div>
              )}
            </div>

            {/* Bottom: stats */}
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-border-subtle/50">
              <div className="flex items-center gap-1.5">
                <Key size={12} className="text-text-muted" />
                <span className="text-xs text-text-secondary font-medium">
                  {card.keyCount} {card.keyCount === 1 ? "key" : "keys"}
                </span>
              </div>
              {card.lastUpdated && (
                <span className="text-xxs text-text-muted">
                  {new Date(card.lastUpdated).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          </motion.button>
        ))}

        {/* + New Project Card */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: cards.length * 0.05, duration: 0.25 }}
          onClick={onAddProject}
          className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 border-dashed border-border-subtle text-text-muted hover:border-accent/30 hover:text-accent hover:bg-accent/5 transition-all min-h-[140px]"
        >
          <div className="w-10 h-10 rounded-lg bg-border-subtle/30 flex items-center justify-center">
            <Plus size={20} />
          </div>
          <span className="text-xs font-medium">New Project</span>
        </motion.button>
      </div>

      {/* Empty State — no projects at all */}
      {projects.length === 0 && keys.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen size={40} className="text-text-muted mx-auto mb-4" />
          <h3 className="text-base font-semibold text-text-primary mb-1">
            No projects yet
          </h3>
          <p className="text-sm text-text-muted mb-5 max-w-sm mx-auto">
            Projects organize your API keys by app, client, or context.
            Create one to get started.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onAddProject}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors shadow-glow"
            >
              <Plus size={16} />
              Create Project
            </button>
            <button
              onClick={onAddKey}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card border border-border-subtle text-text-primary text-sm font-medium hover:bg-card-hover transition-colors"
            >
              <Key size={16} />
              Add a Key
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
