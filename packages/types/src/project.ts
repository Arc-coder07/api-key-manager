// ─── Project ────────────────────────────────────────────────────
// Projects group API keys by client, app, or context.

export interface Project {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Display name, e.g. "MedSage", "E-commerce client" */
  name: string;
  /** Optional description */
  description: string;
  /** Hex color for visual identification, e.g. "#10b981" */
  color: string;
  /** ISO 8601 creation timestamp */
  createdAt: string;
  /** ISO 8601 last update timestamp */
  updatedAt: string;
}

/** Preset project colors for the color picker */
export const PROJECT_COLORS = [
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#6366f1', // Indigo
] as const;
