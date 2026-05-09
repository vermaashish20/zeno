"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { GlobalSearchChat } from "@/components/GlobalSearchChat";
import { WorkspaceCard } from "@/components/WorkspaceCard";
import { useWorkspaceContext } from "@/hooks/WorkspaceContext";
import { Search, LayoutGrid, Sparkles } from "lucide-react";

export default function HomeDashboardPage() {
  const { knowledgeBases, isInitializing } = useWorkspaceContext();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWorkspaces = knowledgeBases.filter(kb => 
    kb.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Background Decorative Elements - High Density Vibrant Gradient */}
      <div className="absolute top-0 right-0 w-[1000px] h-[800px] mesh-gradient pointer-events-none opacity-60 blur-[60px] rounded-full translate-x-1/4 -translate-y-1/4" />
      
      <div className="absolute top-[-5%] right-[10%] w-[50%] h-[50%] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-[120px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-gradient-to-tr from-rose-500/15 to-transparent blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] bg-gradient-to-tl from-cyan-500/10 to-transparent blur-[80px] rounded-full pointer-events-none" />

      <Navbar />
      
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-24 px-4">
          <div className="container mx-auto text-center">
            
            <h1 className="text-5xl md:text-7xl font-heading font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 leading-[1.1]">
              Turn <span className="text-red-600">YouTube</span> Content into a<br />
              <span className="text-gradient">Smart Knowledge Base.</span>
            </h1>
            <p className="text-xl md:text-xl text-slate-800 max-w-2xl mx-auto mb-12 leading-relaxed font-heading font-semibold">
              Instant transcripts, AI-powered search, and interactive chat for all your favorite videos and channels in one unified workspace.
            </p>
            
            <div className="max-w-3xl mx-auto">
              <GlobalSearchChat />
            </div>
          </div>
        </section>

        {/* Workspaces Section */}
        <section className="bg-white relative z-10 border-t border-slate-100">
          <div className="container mx-auto px-4 py-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                <LayoutGrid size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Your Workspaces</h2>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-xs font-medium">
                {knowledgeBases.length}
              </span>
            </div>
            
            {/* Workspaces Search Bar */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Find a workspace..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 w-full md:w-72 transition-all"
              />
            </div>
          </div>
          
          {isInitializing ? (
            <div className="flex justify-center items-center h-64">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : filteredWorkspaces.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredWorkspaces.map((workspace) => (
                <WorkspaceCard key={workspace.id} workspace={workspace} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-slate-50/50 border border-dashed border-slate-200 rounded-[2rem]">
              <div className="inline-flex p-4 bg-white rounded-2xl shadow-sm mb-4 text-slate-400">
                <Search size={32} />
              </div>
              <p className="text-slate-500 font-medium">
                {searchQuery ? "No workspaces found matching your search." : "Ready to organize your knowledge?"}
              </p>
              {!searchQuery && (
                <p className="text-sm text-slate-400 mt-1">Create your first workspace to get started.</p>
              )}
            </div>
          )}
          </div>
        </section>
      </main>
    </div>
  );
}
