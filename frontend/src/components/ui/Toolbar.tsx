"use client";

import { Plus, Trash2, Brain, X, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGarden } from "@/components/providers/GardenProvider";
import { getCategoryColor } from "@/lib/types";

export function Toolbar() {
  const {
    selectedNote, toggleEditor, removeNote, requestInsights,
    insights, insightsLoading, selectNote,
  } = useGarden();

  return (
    <>
      {/* Bottom floating toolbar */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-white/[0.08]"
          style={{
            background: "rgba(3, 7, 18, 0.65)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {/* Add note */}
          <ToolBtn icon={<Plus size={16} />} label="New Note" onClick={toggleEditor} accent="#14b8a6" />

          {selectedNote && (
            <>
              <div className="w-px h-6 bg-white/10 mx-1" />

              {/* AI Insights */}
              <ToolBtn
                icon={<Brain size={16} />}
                label={insightsLoading ? "Thinking..." : "AI Insights"}
                onClick={() => requestInsights(selectedNote.id)}
                accent="#a855f7"
                disabled={insightsLoading}
              />

              {/* Delete */}
              <ToolBtn
                icon={<Trash2 size={16} />}
                label="Delete"
                onClick={() => removeNote(selectedNote.id)}
                accent="#ef4444"
              />
            </>
          )}
        </motion.div>
      </div>

      {/* AI Insights panel */}
      <AnimatePresence>
        {insights && selectedNote && (
          <motion.div
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-4 right-4 z-50 w-80 rounded-2xl border border-white/[0.08] overflow-hidden"
            style={{
              background: "rgba(3, 7, 18, 0.7)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Brain size={14} className="text-purple-400" />
                <span className="text-xs font-bold text-white">AI Insights</span>
              </div>
              <button onClick={() => selectNote(null)} className="text-slate-500 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Summary */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-teal-400 mb-1.5">Summary</p>
                <p className="text-xs text-slate-300 leading-relaxed">{insights.summary}</p>
              </div>

              {/* Key Insights */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1.5">Key Insights</p>
                <ul className="space-y-1.5">
                  {insights.insights.map((insight, i) => (
                    <li key={i} className="text-xs text-slate-300 flex gap-2">
                      <span className="text-purple-400 shrink-0">→</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggested connections */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-pink-400 mb-1.5">
                  Explore Next
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {insights.suggested_connections.map((topic) => (
                    <span
                      key={topic}
                      className="text-[10px] px-2 py-1 rounded-full border border-pink-500/20 text-pink-300"
                      style={{ background: "rgba(236,72,153,0.08)" }}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Small toolbar button ── */
function ToolBtn({ icon, label, onClick, accent, disabled }: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  accent: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
        transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
      style={{
        color: accent,
        background: `${accent}10`,
        border: `1px solid ${accent}20`,
      }}
    >
      {icon}
      {label}
    </button>
  );
}
