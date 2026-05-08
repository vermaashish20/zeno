import { useState, useEffect, useCallback } from "react";
import { KnowledgeBase, Source, SelectedItem } from "@/types";
import { videoApi } from "@/services/api";

export function useVideoEngine() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [standaloneSources, setStandaloneSources] = useState<Source[]>([]);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  
  const [isInitializing, setIsInitializing] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [kbs, sources] = await Promise.all([
        videoApi.getKnowledgeBases(),
        videoApi.getStandaloneSources()
      ]);
      setKnowledgeBases(kbs);
      setStandaloneSources(sources);
      
      // Auto-select first item if nothing is selected
      if (!selectedItem && kbs.length > 0) {
        setSelectedItem({ type: "kb", id: kbs[0].id });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsInitializing(false);
    }
  }, [selectedItem]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling only if there's an active background task
  useEffect(() => {
    const hasActiveTasks = 
      standaloneSources.some(s => s.status === "progress") ||
      knowledgeBases.some(kb => kb.sources.some(s => s.status === "progress"));

    if (!hasActiveTasks) return;

    const interval = setInterval(() => {
      fetchData();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [fetchData, standaloneSources, knowledgeBases]);

  return {
    knowledgeBases,
    standaloneSources,
    selectedItem,
    setSelectedItem,
    isInitializing,
    refreshData: fetchData
  };
}
