import React from "react";
import Link from "next/link";
import { Plus, Import, Settings, Zap } from "lucide-react";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between py-2 px-6 md:px-8 bg-transparent sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary/20 p-2 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            <Zap size={24} className="fill-current" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Zeno
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full transition-all">
          <Import size={16} />
          <span>Import</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-[0_0_15px_rgba(var(--color-primary),0.3)] transition-all">
          <Plus size={16} />
          <span className="hidden sm:inline">New Workspace</span>
        </button>
        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-black/5 rounded-full transition-all">
          <Settings size={20} />
        </button>
      </div>
    </nav>
  );
}
