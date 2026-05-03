import React from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Database } from "lucide-react";
import { cn } from "@/lib/utils";

type WorkspaceNavbarProps = {
  title: string;
  activeTab: "chats" | "content";
  onTabChange: (tab: "chats" | "content") => void;
};

export function WorkspaceNavbar({ title, activeTab, onTabChange }: WorkspaceNavbarProps) {
  return (
    <nav className="flex items-center justify-between py-4 px-6 md:px-8 border-b border-black/5 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-black/5 rounded-full transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-bold text-xl tracking-tight line-clamp-1">{title}</h1>
      </div>

      <div className="flex items-center bg-secondary/50 p-1 rounded-full border border-black/5">
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
