import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Database, Edit2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type WorkspaceNavbarProps = {
  id: string;
  title: string;
  activeTab: "chats" | "content";
  onTabChange: (tab: "chats" | "content") => void;
  onTitleUpdate?: (newTitle: string) => void;
};

export function WorkspaceNavbar({ id, title, activeTab, onTabChange, onTitleUpdate }: WorkspaceNavbarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditTitle(title);
  }, [title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== title) {
      onTitleUpdate?.(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setEditTitle(title);
      setIsEditing(false);
    }
  };

  return (
    <nav className="flex items-center justify-between py-4 px-6 md:px-8 border-b border-black/5 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-4 flex-1 mr-4">
        <Link
          href="/"
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-black/5 rounded-full transition-all shrink-0"
        >
          <ArrowLeft size={20} />
        </Link>
        
        <div className="flex items-center gap-2 group min-w-0 flex-1 max-w-md">
          {isEditing ? (
            <div className="flex items-center gap-2 w-full">
              <input
                ref={inputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                className="bg-secondary/40 border-none outline-none px-3 py-1 rounded-lg text-xl font-bold tracking-tight w-full focus:ring-2 focus:ring-primary/20"
              />
            </div>
          ) : (
            <>
              <h1 
                onClick={() => setIsEditing(true)}
                className="font-bold text-xl tracking-tight line-clamp-1 cursor-pointer hover:text-primary transition-colors"
              >
                {title}
              </h1>
              <button 
                onClick={() => setIsEditing(true)}
                className="p-1.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all shrink-0"
              >
                <Edit2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center bg-secondary/50 p-1 rounded-full border border-black/5 shrink-0">
        <button
          onClick={() => onTabChange("chats")}
          className={cn(
            "flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full transition-all",
            activeTab === "chats"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5"
          )}
        >
          <MessageSquare size={16} />
          <span className="hidden sm:inline">Chats</span>
        </button>
        <button
          onClick={() => onTabChange("content")}
          className={cn(
            "flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full transition-all",
            activeTab === "content"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5"
          )}
        >
          <Database size={16} />
          <span className="hidden sm:inline">Content</span>
        </button>
      </div>
    </nav>
  );
}
