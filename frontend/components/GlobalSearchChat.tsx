"use client";

import React, { useState } from "react";
import { Search, MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function GlobalSearchChat() {
  const [query, setQuery] = useState("");

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 mb-16 px-4">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-center">
          What would you like to know?
        </h1>
        <p className="text-muted-foreground text-center max-w-xl">
          Chat directly with your entire knowledge base.
        </p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-3xl blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-background/80 backdrop-blur-md border border-black/5 rounded-3xl shadow-xl overflow-hidden flex flex-col transition-all">
          

          <div className="flex items-center p-2 relative">
            <div className="pl-4 pr-2 text-muted-foreground">
              <MessageSquare size={20} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything across your workspaces..."
              className="w-full bg-transparent border-none outline-none px-2 py-4 text-lg placeholder:text-muted-foreground/60 focus:ring-0"
            />
            <button 
              className={cn(
                "p-3 rounded-2xl flex items-center justify-center transition-all mr-2",
                query.length > 0 
                  ? "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:scale-105" 
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              )}
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
