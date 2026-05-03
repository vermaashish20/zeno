import React from "react";
import Link from "next/link";
import { MessageSquare, Video, Clock } from "lucide-react";
import type { Workspace } from "@/lib/mockData";

type WorkspaceCardProps = {
  workspace: Workspace;
};

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  return (
    <Link href={`/workspaces/${workspace.id}`} className="group block">
      <div className="relative flex flex-col h-full bg-background/50 border border-black/5 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-black/10">
        
        {/* Top Half: Image */}
        <div className="relative h-28 w-full overflow-hidden bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={workspace.imageUrl} 
            alt={workspace.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
          />
          {/* Gradient removed as requested */}
          
          {/* Status Badge */}
          {workspace.inQueue > 0 && (
            <div className="absolute top-3 right-3 bg-blue-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Processing {workspace.inQueue}
            </div>
          )}
        </div>

        {/* Bottom Half: Content */}
        <div className="flex flex-col flex-1 p-4 pt-3">
          <h3 className="text-lg font-bold mb-3 tracking-tight group-hover:text-primary transition-colors line-clamp-1">
            {workspace.name}
          </h3>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto">
            <div className="flex items-center gap-1.5">
              <MessageSquare size={14} />
              <span className="font-medium">{workspace.chatsCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Video size={14} />
              <span className="font-medium">{workspace.videosAvailable}</span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto text-xs opacity-70">
              <Clock size={12} />
              <span>{workspace.lastActive}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
