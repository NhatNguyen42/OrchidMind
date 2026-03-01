"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type { Note, Connection, GraphData, AIInsights, NodePosition } from "@/lib/types";
import { fetchGraph, createNote as apiCreate, deleteNote as apiDelete, searchNotes, fetchInsights } from "@/lib/api";
import { ForceGraph, SimNode, SimEdge } from "@/lib/forceGraph";

/* ── context shape ── */
interface GardenCtx {
  notes: Note[];
  connections: Connection[];
  positions: React.MutableRefObject<Map<string, NodePosition>>;
  selectedNote: Note | null;
  hoveredNoteId: string | null;
  searchResults: string[];
  insights: AIInsights | null;
  insightsLoading: boolean;
  loading: boolean;
  sidebarOpen: boolean;
  editorOpen: boolean;
  /* actions */
  selectNote: (note: Note | null) => void;
  hoverNote: (id: string | null) => void;
  search: (q: string) => void;
  addNote: (title: string, content: string, category: string, tags: string[]) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
  requestInsights: (id: string) => void;
  toggleSidebar: () => void;
  toggleEditor: () => void;
  graphRef: React.MutableRefObject<ForceGraph | null>;
  cameraTarget: NodePosition | null;
  setCameraTarget: (t: NodePosition | null) => void;
}

const Ctx = createContext<GardenCtx | null>(null);
export const useGarden = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useGarden must be inside GardenProvider");
  return c;
};

/* ── provider ── */
export function GardenProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNote, setSelected] = useState<Note | null>(null);
  const [hoveredNoteId, setHovered] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<NodePosition | null>(null);

  const graphRef = useRef<ForceGraph | null>(null);
  const positions = useRef<Map<string, NodePosition>>(new Map());

  /* initial fetch */
  useEffect(() => {
    fetchGraph()
      .then((data: GraphData) => {
        setNotes(data.notes);
        setConnections(data.connections);
        _initGraph(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const _initGraph = useCallback((data: GraphData) => {
    const simNodes: SimNode[] = data.notes.map((n) => ({
      id: n.id,
      x: 0, y: 0, z: 0,
      vx: 0, vy: 0, vz: 0,
      category: n.category,
    }));
    const simEdges: SimEdge[] = data.connections.map((c) => ({
      source: c.source_id,
      target: c.target_id,
      strength: c.strength,
    }));
    graphRef.current = new ForceGraph(simNodes, simEdges);
  }, []);

  /* actions */
  const selectNote = useCallback((note: Note | null) => {
    setSelected(note);
    setInsights(null);
    if (note) {
      const pos = positions.current.get(note.id);
      if (pos) setCameraTarget(pos);
    }
  }, []);

  const hoverNote = useCallback((id: string | null) => setHovered(id), []);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await searchNotes(q);
      setSearchResults(results.map((n) => n.id));
      if (results.length > 0) {
        const pos = positions.current.get(results[0].id);
        if (pos) setCameraTarget(pos);
      }
    } catch {
      setSearchResults([]);
    }
  }, []);

  const addNote = useCallback(async (title: string, content: string, category: string, tags: string[]) => {
    const note = await apiCreate({ title, content, category, tags });
    const data = await fetchGraph();
    setNotes(data.notes);
    setConnections(data.connections);
    _initGraph(data);
    setEditorOpen(false);
  }, [_initGraph]);

  const removeNote = useCallback(async (id: string) => {
    await apiDelete(id);
    const data = await fetchGraph();
    setNotes(data.notes);
    setConnections(data.connections);
    _initGraph(data);
    if (selectedNote?.id === id) setSelected(null);
  }, [_initGraph, selectedNote]);

  const requestInsights = useCallback(async (id: string) => {
    setInsightsLoading(true);
    try {
      const data = await fetchInsights(id);
      setInsights(data);
    } catch {
      setInsights(null);
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  return (
    <Ctx.Provider
      value={{
        notes, connections, positions,
        selectedNote, hoveredNoteId,
        searchResults, insights, insightsLoading,
        loading, sidebarOpen, editorOpen,
        selectNote, hoverNote, search, addNote, removeNote,
        requestInsights,
        toggleSidebar: () => setSidebarOpen((p) => !p),
        toggleEditor: () => setEditorOpen((p) => !p),
        graphRef,
        cameraTarget, setCameraTarget,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
