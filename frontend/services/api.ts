import { KnowledgeBase, Source, ImportResponse, ChatResponse } from "@/types";

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

  createKnowledgeBase: async (title: string): Promise<KnowledgeBase> => {
    const res = await fetch(`${API_BASE}/knowledge_bases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error("Failed to create knowledge base");
    return res.json();
  },

  updateKnowledgeBase: async (id: string, title: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/knowledge_bases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error("Failed to update knowledge base");
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

  previewUrl: async (url: string): Promise<{ videos: { title: string; url: string }[] }> => {
    const res = await fetch(`${API_BASE}/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) throw new Error("Preview failed");
    return res.json();
  },

  importUrl: async (url: string, target: string, selectedUrls?: string[], newKbName?: string): Promise<ImportResponse> => {
    const res = await fetch(`${API_BASE}/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, target, selected_urls: selectedUrls, new_kb_name: newKbName }),
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
  },

  chatStream: async (query: string, targetType: "source" | "kb", targetId: string, onChunk: (chunk: string) => void): Promise<void> => {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, target_type: targetType, target_id: targetId }),
    });
    
    if (!res.ok || !res.body) {
      throw new Error("Chat stream request failed");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        // Some providers/browsers might wrap SSE data in "data: " prefix
        // For now we assume raw text as we set it in backend, but let's be safe
        onChunk(chunk);
      }
    } catch (err) {
      throw err;
    } finally {
      reader.releaseLock();
    }
  }
};
