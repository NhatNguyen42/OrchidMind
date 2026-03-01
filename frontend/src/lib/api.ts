/* ── API client for OrchidMind backend ── */

import type { GraphData, Note, AIInsights } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8888";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

/* ── Graph ── */
export const fetchGraph = () => request<GraphData>("/api/graph");

/* ── Notes ── */
export const fetchNotes = () => request<Note[]>("/api/notes");

export const createNote = (data: { title: string; content: string; category?: string; tags?: string[] }) =>
  request<Note>("/api/notes", { method: "POST", body: JSON.stringify(data) });

export const updateNote = (id: string, data: Partial<Note>) =>
  request<Note>(`/api/notes/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteNote = (id: string) =>
  request<{ success: boolean }>(`/api/notes/${id}`, { method: "DELETE" });

/* ── Search ── */
export const searchNotes = (q: string) => request<Note[]>(`/api/search?q=${encodeURIComponent(q)}`);

/* ── AI ── */
export const fetchInsights = (noteId: string) =>
  request<AIInsights>("/api/ai/insights", { method: "POST", body: JSON.stringify({ note_id: noteId }) });
