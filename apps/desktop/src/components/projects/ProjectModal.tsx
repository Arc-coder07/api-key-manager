import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Project } from "@vaultic/types";
import { useVaultStore } from "../../stores/useVaultStore";
import { useToast } from "../../hooks/useToast";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
}

const PROJECT_COLORS = [
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#f97316", // Orange
  "#6366f1", // Indigo
  "#64748b", // Slate
];

export function ProjectModal({ isOpen, onClose, projectToEdit }: ProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const addProject = useVaultStore((s) => s.addProject);
  const updateProject = useVaultStore((s) => s.updateProject);
  const { success, error } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (projectToEdit) {
        setName(projectToEdit.name);
        setDescription(projectToEdit.description || "");
        setColor(projectToEdit.color || PROJECT_COLORS[0]);
      } else {
        setName("");
        setDescription("");
        setColor(PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)]);
      }
    }
  }, [isOpen, projectToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (projectToEdit) {
        await updateProject(projectToEdit.id, { name: name.trim(), description: description.trim(), color });
        success("Project updated", `Your changes to ${name} have been saved.`);
      } else {
        await addProject(name.trim(), description.trim(), color);
        success("Project created", `Project ${name} has been added to your vault.`);
      }
      onClose();
    } catch (err: any) {
      error("Error saving project", err.message || "Failed to save project");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="project-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-app/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative z-10 bg-card w-full max-w-sm rounded-[1.25rem] border border-border-subtle shadow-2xl overflow-hidden"
          >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle/50">
                <h2 className="text-base font-semibold text-text-primary">
                  {projectToEdit ? "Edit Project" : "New Project"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-1 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-border-subtle/50"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. MedSage, E-Commerce..."
                      className="w-full px-3 py-2 bg-app border border-border-subtle rounded-lg text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                      Description <span className="text-text-muted font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief project description..."
                      className="w-full px-3 py-2 bg-app border border-border-subtle rounded-lg text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {PROJECT_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`
                            w-7 h-7 rounded-full flex items-center justify-center transition-transform
                            ${color === c ? "scale-110 shadow-glow ring-2 ring-offset-2 ring-offset-card ring-text-muted" : "hover:scale-110"}
                          `}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim()}
                    className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {projectToEdit ? "Save Changes" : "Create Project"}
                  </button>
                </div>
              </form>
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
