"use client";

import React, { useState } from "react";
import { Search, MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function GlobalSearchChat() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className={cn(
        "relative group transition-all duration-500",
        isFocused ? "scale-[1.02]" : "scale-100"
      )}>
        {/* Glow Effect */}
        <div className={cn(
          "absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-xl transition-opacity duration-500",
          isFocused ? "opacity-20" : "opacity-0 group-hover:opacity-10"
        )}></div>
        
        <div className={cn(
          "relative bg-white border rounded-full shadow-2xl shadow-indigo-500/5 overflow-hidden flex items-center transition-all duration-300",
          isFocused ? "border-indigo-500/30 ring-4 ring-indigo-500/5" : "border-slate-200"
        )}>
          <div className="pl-6 pr-3 text-slate-400">
            <MessageSquare size={18} className={cn(isFocused && "text-indigo-500 transition-colors")} />
          </div>
          
          <input
            type="text"
            value={query}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything across your workspaces..."
            className="w-full bg-transparent border-none outline-none py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:ring-0"
          />
          
          <div className="pr-3">
            <button 
              className={cn(
                "p-3 rounded-2xl flex items-center justify-center transition-all duration-300",
                query.length > 0 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95" 
                  : "bg-slate-100 text-slate-300 cursor-not-allowed"
              )}
            >
              <ArrowRight size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Quick Tips */}
        <div className={cn(
          "flex items-center justify-center gap-6 mt-6 transition-all duration-500",
          isFocused ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        )}>
          <span className="text-xs text-slate-400 font-medium">Try asking:</span>
          <button className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">"Summarize latest transcript"</button>
          <button className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">"Find notes on Project X"</button>
        </div>
      </div>
    </div>
  );
}
