"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { WorkspaceNavbar } from "@/components/WorkspaceNavbar";
import { MOCK_WORKSPACES } from "@/lib/mockData";
import { MessageSquare, Database, Sparkles, Send } from "lucide-react";

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const workspace = MOCK_WORKSPACES.find((w) => w.id === workspaceId) || MOCK_WORKSPACES[0];

  const [activeTab, setActiveTab] = useState<"chats" | "content">("chats");

  return (
    <div className="flex flex-col h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <WorkspaceNavbar 
        title={workspace.name} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      <main className="flex-1 overflow-hidden relative z-10 flex flex-col">
        {activeTab === "chats" ? (
          <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-4">
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-6 py-6 pr-2 scrollbar-thin">
              <div className="flex gap-4 p-6 bg-secondary/30 rounded-3xl border border-black/5 backdrop-blur-sm self-start max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Sparkles size={16} className="text-primary" />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm leading-relaxed text-foreground">
                    Hello! I am your AI assistant for the <strong>{workspace.name}</strong> workspace. I have analyzed {workspace.videosAvailable} videos and documents. What would you like to know?
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Input */}
            <div className="relative group mt-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-3xl blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-background/80 backdrop-blur-md border border-black/5 rounded-3xl shadow-xl flex flex-col transition-all">
                <div className="flex items-center p-2">
                  <input
                    type="text"
                    placeholder={`Ask about ${workspace.name}...`}
                    className="w-full bg-transparent border-none outline-none px-4 py-3 text-base placeholder:text-muted-foreground/60 focus:ring-0"
                  />
                  <button className="p-3 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center transition-all mr-1 shadow-lg hover:bg-primary/90 hover:scale-105">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full max-w-5xl mx-auto w-full p-6 lg:p-8 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Database size={24} className="text-primary" />
                Knowledge Base
              </h2>
              <button className="px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full transition-all">
                Add Content
              </button>
            </div>
            
            <div className="grid gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center p-4 bg-secondary/20 rounded-2xl border border-black/5 hover:bg-secondary/40 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shrink-0 mr-4 shadow-sm border border-black/5">
                    <Database size={20} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold truncate">Sample Video Transcript {i + 1}</h4>
                    <p className="text-sm text-muted-foreground truncate">Processed • 45 mins long</p>
                  </div>
                  <button className="px-4 py-1.5 text-xs font-medium bg-background border border-black/10 rounded-full hover:bg-black/5 transition-colors">
                    Manage
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
