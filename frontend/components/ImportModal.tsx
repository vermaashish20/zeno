"use client";

import React, { useState } from "react";
import { Modal } from "./Modal";
import { useWorkspaceContext } from "@/hooks/WorkspaceContext";
import { videoApi } from "@/services/api";
import { Import, Loader2, Globe, FileVideo, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const [url, setUrl] = useState("");
  const [targetType, setTargetType] = useState<"standalone" | "new_kb" | "existing">("existing");
  const [selectedKbId, setSelectedKbId] = useState("");
  const [newKbName, setNewKbName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { knowledgeBases, refreshData } = useWorkspaceContext();

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    let target = "";
    if (targetType === "standalone") target = "standalone";
    else if (targetType === "new_kb") target = "new_kb";
    else target = selectedKbId;

    if (targetType === "existing" && !selectedKbId) {
        alert("Please select a workspace");
        return;
    }

    if (targetType === "new_kb" && !newKbName.trim()) {
        alert("Please enter a workspace name");
        return;
    }

    setIsLoading(true);
    try {
      await videoApi.importUrl(url.trim(), target, targetType === "new_kb" ? newKbName : undefined);
      await refreshData();
      setUrl("");
      setNewKbName("");
      onClose();
    } catch (error) {
      console.error("Import failed:", error);
      alert("Import failed. Please check the URL and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Content">
      <form onSubmit={handleImport} className="space-y-6">
        {/* URL Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground ml-1">
            Video or Audio URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
              <Globe size={18} />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-black/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Target Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground ml-1">
            Import To
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTargetType("existing")}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all gap-2",
                targetType === "existing" 
                  ? "bg-primary/10 border-primary text-primary" 
                  : "bg-background border-black/5 text-muted-foreground hover:bg-black/5"
              )}
            >
              <FileVideo size={20} />
              <span className="text-xs font-semibold">Workspace</span>
            </button>
            <button
              type="button"
              onClick={() => setTargetType("new_kb")}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all gap-2",
                targetType === "new_kb" 
                  ? "bg-primary/10 border-primary text-primary" 
                  : "bg-background border-black/5 text-muted-foreground hover:bg-black/5"
              )}
            >
              <Plus size={20} />
              <span className="text-xs font-semibold">New</span>
            </button>
            <button
              type="button"
              onClick={() => setTargetType("standalone")}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all gap-2",
                targetType === "standalone" 
                  ? "bg-primary/10 border-primary text-primary" 
                  : "bg-background border-black/5 text-muted-foreground hover:bg-black/5"
              )}
            >
              <Globe size={20} />
              <span className="text-xs font-semibold">Standalone</span>
            </button>
          </div>
        </div>

        {/* Dynamic Options based on Target */}
        {targetType === "existing" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <select
              value={selectedKbId}
              onChange={(e) => setSelectedKbId(e.target.value)}
              className="w-full px-4 py-3 bg-secondary/50 border border-black/5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="">Select a workspace...</option>
              {knowledgeBases.map((kb) => (
                <option key={kb.id} value={kb.id}>
                  {kb.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {targetType === "new_kb" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <input
              type="text"
              value={newKbName}
              onChange={(e) => setNewKbName(e.target.value)}
              placeholder="New Workspace Name"
              className="w-full px-4 py-3 bg-secondary/50 border border-black/5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Import size={20} />
          )}
          Start Import
        </button>
        
        <p className="text-center text-xs text-muted-foreground px-4">
            Processing can take a few minutes depending on the length of the video.
        </p>
      </form>
    </Modal>
  );
}
