"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { GlobalSearchChat } from "@/components/GlobalSearchChat";
import { WorkspaceCard } from "@/components/WorkspaceCard";
import { useWorkspaceContext } from "@/hooks/WorkspaceContext";
import { Search } from "lucide-react";

export default function HomeDashboardPage() {
  const { knowledgeBases, isInitializing } = useWorkspaceContext();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWorkspaces = knowledgeBases.filter(kb => 
    kb.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="bg-gradient-to-b from-blue-100/60 to-background pb-12 pt-2">
        <Navbar />
        <div className="relative z-10 pt-4">
          <GlobalSearchChat />
        </div>
      </div>
      
      <main className="container mx-auto px-4 pb-20 relative z-10">
        <div className="mt-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Your Workspaces</h2>
            
            {/* Workspaces Search Bar */}
            <div className="relative group hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Search workspaces..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-background border border-black/10 rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30 w-64 shadow-sm transition-all"
              />
            </div>
          </div>
          
          {isInitializing ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredWorkspaces.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredWorkspaces.map((workspace) => (
                <WorkspaceCard key={workspace.id} workspace={workspace} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-black/10 rounded-3xl">
              {searchQuery ? "No workspaces found matching your search." : "You don't have any workspaces yet."}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
