import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, ArrowRight } from "lucide-react";
import { useVaultStore } from "../../stores/useVaultStore";
import { useToast } from "../../hooks/useToast";
import type { Project } from "@vaultic/types";

interface ProjectDeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  projectToDelete: Project | null;
}

export function ProjectDeleteConfirmation({
  isOpen,
  onClose,
  projectToDelete,
}: ProjectDeleteConfirmationProps) {
  const [strategy, setStrategy] = useState<"orphan" | "delete" | "reassign">("orphan");
  const [reassignId, setReassignId] = useState<string>("");

  const projects = useVaultStore((s) => s.projects);
  const keys = useVaultStore((s) => s.keys);
  const deleteProject = useVaultStore((s) => s.deleteProject);
  const { error, info } = useToast();

  const activeKeysCount = useMemo(() => {
    if (!projectToDelete) return 0;
    return keys.filter((k) => k.projectId === projectToDelete.id).length;
  }, [keys, projectToDelete]);

  const availableProjects = useMemo(() => {
    if (!projectToDelete) return [];
    return projects.filter((p) => p.id !== projectToDelete.id);
  }, [projects, projectToDelete]);

  // Reset state when modal opens
  useMemo(() => {
    if (isOpen) {
      setStrategy("orphan");
      if (availableProjects.length > 0) {
        setReassignId(availableProjects[0].id);
      }
    }
  }, [isOpen, availableProjects]);

  const handleDelete = async () => {
    if (!projectToDelete) return;

    try {
      if (strategy === "reassign" && !reassignId) {
        error("Invalid Selection", "Please select a project to reassign the keys to.");
        return;
      }
      
      await deleteProject(projectToDelete.id, strategy, reassignId);
      info("Project deleted", `Project ${projectToDelete.name} has been removed.`);
      onClose();
    } catch (err: any) {
      error("Deletion failed", err.message || "Could not delete project");
    }
  };

  if (!projectToDelete) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="delete-modal"
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
            className="relative z-10 bg-card w-full max-w-md rounded-[1.25rem] border border-border-subtle shadow-2xl overflow-hidden"
          >
              <div className="flex items-center gap-3 px-6 py-4 border-b border-border-subtle/50 bg-status-red/5">
                <AlertTriangle className="text-status-red" size={20} />
                <h2 className="text-base font-semibold text-text-primary">Delete Project</h2>
                <button
                  onClick={onClose}
                  className="p-1 ml-auto text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-border-subtle/50"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <p className="text-sm text-text-secondary">
                  Are you sure you want to delete <strong className="text-text-primary">{projectToDelete.name}</strong>?
                </p>

                {activeKeysCount > 0 && (
                  <div className="bg-app border border-status-red/20 rounded-xl p-4 space-y-4">
                    <p className="text-sm font-medium text-text-primary">
                      This project has {activeKeysCount} API {activeKeysCount === 1 ? 'key' : 'keys'}. What would you like to do?
                    </p>

                    <div className="space-y-2">
                      <label 
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${strategy === 'orphan' ? 'border-accent bg-accent/5' : 'border-border-subtle hover:bg-border-subtle/30'}`}
                      >
                        <input 
                          type="radio" 
                          name="deleteStrategy"
                          checked={strategy === "orphan"}
                          onChange={() => setStrategy("orphan")}
                          className="mt-0.5 accent-accent"
                        />
                        <div>
                          <div className="text-sm font-medium text-text-primary">Keep keys (orphan)</div>
                          <div className="text-xs text-text-muted">Keys will remain in your vault without a project label.</div>
                        </div>
                      </label>

                      <label 
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${strategy === 'delete' ? 'border-status-red bg-status-red/5' : 'border-border-subtle hover:bg-border-subtle/30'}`}
                      >
                        <input 
                          type="radio" 
                          name="deleteStrategy"
                          checked={strategy === "delete"}
                          onChange={() => setStrategy("delete")}
                          className="mt-0.5 accent-status-red"
                        />
                        <div>
                          <div className="text-sm font-medium text-status-red">Delete keys permanently</div>
                          <div className="text-xs text-text-muted">All associated keys will be permanently removed.</div>
                        </div>
                      </label>

                      {availableProjects.length > 0 && (
                        <label 
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${strategy === 'reassign' ? 'border-accent bg-accent/5' : 'border-border-subtle hover:bg-border-subtle/30'}`}
                        >
                          <input 
                            type="radio" 
                            name="deleteStrategy"
                            checked={strategy === "reassign"}
                            onChange={() => setStrategy("reassign")}
                            className="mt-0.5 accent-accent"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-text-primary">Reassign to another project</div>
                            {strategy === "reassign" && (
                              <div className="mt-2 flex items-center gap-2">
                                <ArrowRight size={14} className="text-text-muted" />
                                <select 
                                  value={reassignId}
                                  onChange={(e) => setReassignId(e.target.value)}
                                  className="flex-1 bg-card border border-border-subtle rounded-md px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-accent"
                                >
                                  {availableProjects.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-status-red text-white rounded-lg text-sm font-medium hover:bg-status-red/90 transition-colors shadow-glow"
                  >
                    Delete Project
                  </button>
                </div>
              </div>
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
