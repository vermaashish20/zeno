import { KnowledgeBase, Source, ImportResponse, ChatResponse } from "../types";

const API_BASE = "http://127.0.0.1:8000/api/video";

export const videoApi = {
  getKnowledgeBases: async (): Promise<KnowledgeBase[]> => {
    try {
      const res = await fetch(`${API_BASE}/knowledge_bases`);
      if (!res.ok) throw new Error("Failed to fetch knowledge bases");
      return res.json();
    } catch {
      return [];
    }
  },

  getStandaloneSources: async (): Promise<Source[]> => {
    try {
      const res = await fetch(`${API_BASE}/standalone_sources`);
      if (!res.ok) throw new Error("Failed to fetch standalone sources");
      return res.json();
    } catch {
      return [];
    }
  },

  importUrl: async (url: string, target: string, newKbName?: string): Promise<ImportResponse> => {
    const res = await fetch(`${API_BASE}/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, target, new_kb_name: newKbName }),
    });
    if (!res.ok) throw new Error("Import failed");
    return res.json();
  },

  chat: async (query: string, targetType: "source" | "kb", targetId: string): Promise<ChatResponse> => {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, target_type: targetType, target_id: targetId }),
    });
    if (!res.ok) throw new Error("Chat failed");
    return res.json();
  }
};
