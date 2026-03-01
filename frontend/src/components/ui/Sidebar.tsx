"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useGarden } from "@/components/providers/GardenProvider";
import { getCategoryColor } from "@/lib/types";

export function Sidebar() {
  const {
    notes, sidebarOpen, toggleSidebar, selectNote, selectedNote,
    search, searchResults, hoverNote,
  } = useGarden();
  const [query, setQuery] = useState("");

  const handleSearch = (v: string) => {
    setQuery(v);
    search(v);
  };

  const filteredNotes = query.trim()
    ? notes.filter((n) => searchResults.includes(n.id))
    : notes;

  // Group by category
  const grouped = filteredNotes.reduce<Record<string, typeof notes>>((acc, n) => {
    (acc[n.category] ??= []).push(n);
    return acc;
  }, {});

  return (
    <>
      {/* Toggle button — bottom-left so it doesn't block the 3D scene */}
      <button
        onClick={toggleSidebar}
        className="fixed bottom-5 left-4 z-50 w-9 h-9 rounded-xl flex items-center justify-center
          border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all"
        style={{ background: "rgba(3,7,18,0.6)", backdropFilter: "blur(12px)" }}
      >
        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -340, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -340, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 z-40 h-full w-80 flex flex-col border-r border-white/[0.06]"
            style={{
              background: "rgba(3, 7, 18, 0.55)",
              backdropFilter: "blur(24px)",
            }}
          >
            {/* Header */}
            <div className="px-5 pt-14 pb-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={20} className="text-teal-400" />
                <h1 className="text-lg font-bold text-white tracking-tight">OrchidMind</h1>
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search your garden..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-sm text-white placeholder-slate-500
                    border border-white/[0.06] outline-none focus:border-teal-500/40 transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                />
              </div>
            </div>

            {/* Note list */}
            <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
              {Object.entries(grouped).map(([category, catNotes]) => (
                <div key={category} className="mb-4">
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest px-2 mb-2"
                    style={{ color: getCategoryColor(category) }}
                  >
                    {category} ({catNotes.length})
                  </p>
                  {catNotes.map((note) => {
                    const isActive = selectedNote?.id === note.id;
                    const color = getCategoryColor(note.category);
                    return (
                      <motion.button
                        key={note.id}
                        layout
                        onClick={() => selectNote(note)}
                        onMouseEnter={() => hoverNote(note.id)}
                        onMouseLeave={() => hoverNote(null)}
                        className={`group w-full text-left px-3 py-2.5 rounded-xl mb-1 transition-all border ${
                          isActive
                            ? "border-white/10"
                            : "border-transparent hover:border-white/[0.06]"
                        }`}
                        style={{
                          background: isActive ? `${color}12` : "transparent",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{
                              background: color,
                              boxShadow: `0 0 8px ${color}60`,
                            }}
                          />
                          <span className="text-sm text-slate-200 font-medium truncate group-hover:text-white transition-colors">
                            {note.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 pl-4">
                          {note.content.slice(0, 80)}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              ))}

              {filteredNotes.length === 0 && (
                <p className="text-sm text-slate-500 text-center mt-8">
                  {query ? "No notes match your search" : "No notes yet — plant your first idea"}
                </p>
              )}
            </div>

            {/* Footer stats + author */}
            <div className="px-5 py-3 border-t border-white/[0.06]">
              <p className="text-[10px] text-slate-500">
                {notes.length} notes · {searchResults.length > 0 ? `${searchResults.length} matches` : "All visible"}
              </p>
              <p className="text-[9px] text-slate-600 mt-1.5">
                Built by{" "}
                <a href="mailto:nhatmn114@gmail.com" className="text-teal-500/70 hover:text-teal-400 transition-colors">
                  Nhat Nguyen
                </a>
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
