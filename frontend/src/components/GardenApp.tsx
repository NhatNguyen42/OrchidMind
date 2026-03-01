"use client";

import { GardenProvider } from "@/components/providers/GardenProvider";
import { GardenScene } from "@/components/garden/GardenScene";
import { Sidebar } from "@/components/ui/Sidebar";
import { Toolbar } from "@/components/ui/Toolbar";
import { NoteEditor } from "@/components/ui/NoteEditor";
import { useGarden } from "@/components/providers/GardenProvider";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

function Inner() {
  const { loading } = useGarden();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#030712]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          >
            <Sparkles size={32} className="text-teal-400" />
          </motion.div>
          <p className="text-sm text-slate-400 font-medium">Growing your garden...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#030712]">
      {/* 3D Canvas fills the entire screen */}
      <div className="absolute inset-0">
        <GardenScene />
      </div>

      {/* UI overlays */}
      <Sidebar />
      <Toolbar />
      <NoteEditor />
    </div>
  );
}

export function GardenApp() {
  return (
    <GardenProvider>
      <Inner />
    </GardenProvider>
  );
}
