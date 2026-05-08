"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useVideoEngine } from "./useVideoEngine";

type VideoEngineState = ReturnType<typeof useVideoEngine>;

const WorkspaceContext = createContext<VideoEngineState | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const engineState = useVideoEngine();

  return (
    <WorkspaceContext.Provider value={engineState}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspaceContext must be used within a WorkspaceProvider");
  }
  return context;
}
