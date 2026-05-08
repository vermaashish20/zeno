"use client";

import React, { useState } from "react";
import { Modal } from "./Modal";
import { useWorkspaceContext } from "@/hooks/WorkspaceContext";
import { videoApi } from "@/services/api";
import { Plus, Loader2 } from "lucide-react";

interface NewWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewWorkspaceModal({ isOpen, onClose }: NewWorkspaceModalProps) {
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { refreshData } = useWorkspaceContext();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await videoApi.createKnowledgeBase(title.trim());
      await refreshData();
      setTitle("");
      onClose();
    } catch (error) {
      console.error("Failed to create workspace:", error);
      alert("Failed to create workspace. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Workspace">
      <form onSubmit={handleCreate} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-muted-foreground ml-1">
            Workspace Name
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. My Research, Personal Projects"
            className="w-full px-5 py-4 bg-secondary/50 border border-black/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-lg"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !title.trim()}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Plus size={20} />
          )}
          Create Workspace
        </button>
      </form>
    </Modal>
  );
}
