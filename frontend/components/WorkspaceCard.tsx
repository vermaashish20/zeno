import React from "react";
import Link from "next/link";
import { MessageSquare, Video, Clock, ArrowUpRight } from "lucide-react";
import type { KnowledgeBase } from "@/types";

type WorkspaceCardProps = {
  workspace: KnowledgeBase;
};

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const inQueue = workspace.sources.filter(s => s.status === "progress").length;
  const videosAvailable = workspace.sources.length;
  const chatsCount = 0; // Mocked for now
  
  const createdDate = new Date(workspace.created_at);
  const formattedDate = !isNaN(createdDate.getTime()) 
    ? createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : "recently";

  const imageUrl = `https://picsum.photos/seed/${workspace.id}/800/400`;

  return (
    <Link href={`/workspaces/${workspace.id}`} className="group block">
      <div className="relative flex flex-col h-full bg-white border border-slate-900 rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 hover:border-indigo-600">
        
        {/* Top Half: Image */}
        <div className="relative h-24 w-full overflow-hidden bg-slate-50">
          <img 
            src={imageUrl} 
            alt={workspace.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Status Badge */}
          {inQueue > 0 ? (
            <div className="absolute top-3 left-3 bg-indigo-600 text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-lg shadow-indigo-500/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
              </span>
              Processing {inQueue}
            </div>
          ) : (
            <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:rotate-12">
               <ArrowUpRight size={14} className="text-white" />
            </div>
          )}
        </div>

        {/* Bottom Half: Content */}
        <div className="flex flex-col flex-1 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
            <span className="text-[8px] font-bold text-indigo-500 uppercase tracking-widest">Active</span>
          </div>
          
          <h3 className="text-base font-bold text-slate-900 mb-4 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
            {workspace.title}
          </h3>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md">
                <MessageSquare size={12} className="text-slate-400" />
                <span className="font-semibold text-slate-700">{chatsCount}</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md">
                <Video size={12} className="text-slate-400" />
                <span className="font-semibold text-slate-700">{videosAvailable}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
              <Clock size={10} />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
