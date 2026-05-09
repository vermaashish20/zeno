import React, { useState } from "react";
import Link from "next/link";
import { Plus, Import, Settings, Zap } from "lucide-react";
import { NewWorkspaceModal } from "./NewWorkspaceModal";
import { ImportModal } from "./ImportModal";

export function Navbar() {
  const [isNewKbOpen, setIsNewKbOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-2 left-0 right-0 z-50 flex items-center justify-between py-2 px-6 mx-4 md:mx-12 bg-white/40 backdrop-blur-md border border-slate-900 rounded-full shadow-sm max-w-7xl lg:mx-auto">
        <div className="flex items-center gap-2">
          <Link href="/" className="group">
            <span className="font-bold text-2xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              Zeno
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsImportOpen(true)}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
          >
            <Import size={18} />
            <span>Import</span>
          </button>
          <button 
            onClick={() => setIsNewKbOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all active:translate-y-0"
          >
            <Plus size={18} />
            <span>New Workspace</span>
          </button>
        </div>
      </nav>

      <NewWorkspaceModal 
        isOpen={isNewKbOpen} 
        onClose={() => setIsNewKbOpen(false)} 
      />
      
      <ImportModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
      />
    </>
  );
}
