"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { useGarden } from "@/components/providers/GardenProvider";
import { CATEGORY_COLORS } from "@/lib/types";

const categories = Object.keys(CATEGORY_COLORS).filter((c) => c !== "general");

export function NoteEditor() {
  const { editorOpen, toggleEditor, addNote } = useGarden();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("ai-ml");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const handleAddTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      await addNote(title.trim(), content.trim(), category, tags);
      setTitle("");
      setContent("");
      setTags([]);
      setTagInput("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {editorOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={toggleEditor}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-[480px] max-h-[85vh] rounded-2xl border border-white/[0.08] overflow-hidden"
            style={{
              background: "rgba(3, 7, 18, 0.85)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-teal-400" />
                <span className="text-sm font-bold text-white">Plant a New Idea</span>
              </div>
              <button onClick={toggleEditor} className="text-slate-500 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Title */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Name your idea..."
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500
                    border border-white/[0.06] outline-none focus:border-teal-500/40 transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                />
              </div>

              {/* Content */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe your idea, insight, or discovery..."
                  rows={5}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500
                    border border-white/[0.06] outline-none focus:border-teal-500/40 resize-none transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                  Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => {
                    const color = CATEGORY_COLORS[cat];
                    const active = category === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className="text-[11px] px-2.5 py-1 rounded-full font-medium transition-all"
                        style={{
                          color: active ? "#fff" : color,
                          background: active ? `${color}40` : `${color}10`,
                          border: `1px solid ${active ? color : `${color}20`}`,
                        }}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                  Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-2 rounded-xl text-sm text-white placeholder-slate-500
                      border border-white/[0.06] outline-none focus:border-teal-500/40 transition-colors"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-3 py-2 rounded-xl text-xs font-medium text-teal-400
                      border border-teal-500/20 hover:border-teal-500/40 transition-colors"
                    style={{ background: "rgba(20,184,166,0.1)" }}
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full text-teal-300 flex items-center gap-1"
                        style={{ background: "rgba(20,184,166,0.12)", border: "1px solid rgba(20,184,166,0.2)" }}
                      >
                        {tag}
                        <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-white">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/[0.06] flex justify-end gap-2">
              <button
                onClick={toggleEditor}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim() || !content.trim() || saving}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white
                  disabled:opacity-40 disabled:pointer-events-none transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #14b8a6, #06b6d4)",
                  boxShadow: "0 4px 20px rgba(20,184,166,0.25)",
                }}
              >
                {saving ? "Planting..." : "Plant Idea ✨"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
