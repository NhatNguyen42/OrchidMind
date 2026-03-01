/* ── OrchidMind type definitions ── */

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  created_at: string;
}

export interface Connection {
  source_id: string;
  target_id: string;
  strength: number;
  keywords: string[];
}

export interface GraphData {
  notes: Note[];
  connections: Connection[];
}

export interface AIInsights {
  summary: string;
  insights: string[];
  suggested_connections: string[];
}

export type NodePosition = [number, number, number];

/* Category colour palette */
export const CATEGORY_COLORS: Record<string, string> = {
  "ai-ml": "#14b8a6",
  science: "#a855f7",
  philosophy: "#ec4899",
  technology: "#06b6d4",
  mathematics: "#f59e0b",
  nature: "#10b981",
  general: "#64748b",
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.general;
}
