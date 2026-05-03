export interface Source {
  id: string;
  kb_id?: string | null;
  title: string;
  url: string;
  status: "idle" | "progress" | "done" | "error";
  type: "video" | "audio";
  transcription?: string;
  created_at: string;
}

export interface KnowledgeBase {
  id: string;
  title: string;
  created_at: string;
  sources: Source[];
}

export type SelectedItem = 
  | { type: "kb"; id: string }
  | { type: "source"; id: string; kbId?: string };

export interface ImportResponse {
  status: string;
  message: string;
  kb_id?: string;
  source_ids?: string[];
}

export interface ChatResponse {
  reply: string;
}
