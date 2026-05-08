"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { WorkspaceNavbar } from "@/components/WorkspaceNavbar";
import { MessageSquare, Database, Sparkles, Send, Loader2 } from "lucide-react";
import { useWorkspaceContext } from "@/hooks/WorkspaceContext";
import { videoApi } from "@/services/api";

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { knowledgeBases, isInitializing, refreshData } = useWorkspaceContext();
  
  const workspace = knowledgeBases.find((w) => w.id === workspaceId);

  const [activeTab, setActiveTab] = useState<"chats" | "content">("chats");
  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importStep, setImportStep] = useState<"url" | "select">("url");
  const [previewVideos, setPreviewVideos] = useState<{ title: string; url: string }[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  useEffect(() => {
    if (workspace && messages.length === 0) {
      setMessages([
        { 
          sender: "ai", 
          text: `Hello! I am your AI assistant for the ${workspace.title} workspace. I have analyzed ${workspace.sources.length} videos and documents. What would you like to know?`
        }
      ]);
    }
  }, [workspace, messages.length]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !workspace) return;
    
    const query = inputText;
    setMessages(prev => [...prev, { sender: "user", text: query }]);
    setInputText("");
    setIsProcessing(true);

    // Add a placeholder for the AI response
    setMessages(prev => [...prev, { sender: "ai", text: "" }]);
    
    let fullResponse = "";
    try {
      await videoApi.chatStream(
        query, 
        "kb", 
        workspace.id,
        (chunk) => {
          fullResponse += chunk;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.sender === "ai") {
              lastMsg.text = fullResponse;
            }
            return newMessages;
          });
        }
      );
    } catch (err) {
      console.error("Chat failed", err);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.sender === "ai" && !lastMsg.text) {
          lastMsg.text = "Sorry, I encountered an error while processing your request.";
        }
        return newMessages;
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFetchPreview = async () => {
    if (!importUrl.trim() || !workspace) return;
    setIsImporting(true);
    try {
      const data = await videoApi.previewUrl(importUrl);
      setPreviewVideos(data.videos);
      setSelectedUrls(data.videos.map(v => v.url));
      setImportStep("select");
    } catch (err) {
      console.error("Preview failed", err);
    } finally {
      setIsImporting(false);
    }
  };

  const handleFinalImport = async () => {
    if (!workspace || selectedUrls.length === 0) return;
    setIsImporting(true);
    try {
      await videoApi.importUrl(importUrl, workspace.id, selectedUrls);
      await refreshData();
      setShowImportModal(false);
      resetImportState();
    } catch (err) {
      console.error("Import failed", err);
    } finally {
      setIsImporting(false);
    }
  };

  const resetImportState = () => {
    setImportUrl("");
    setImportStep("url");
    setPreviewVideos([]);
    setSelectedUrls([]);
  };

  const handleRenameWorkspace = async (newTitle: string) => {
    if (!workspace) return;
    try {
      await videoApi.updateKnowledgeBase(workspace.id, newTitle);
      await refreshData();
    } catch (err) {
      console.error("Rename failed", err);
    }
  };

  if (isInitializing && !workspace) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Workspace not found</h2>
          <p className="text-muted-foreground">The workspace you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <WorkspaceNavbar 
        id={workspace.id}
        title={workspace.title} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onTitleUpdate={handleRenameWorkspace}
      />

      <main className="flex-1 overflow-hidden relative z-10 flex flex-col">
        {activeTab === "chats" ? (
          <div className="flex h-full max-w-6xl mx-auto w-full p-4 gap-6">
            {/* Sidebar for Previous Chats */}
            <div className="w-64 shrink-0 flex flex-col gap-4 bg-secondary/10 p-4 rounded-3xl border border-black/5 backdrop-blur-sm hidden md:flex">
              <div className="flex items-center gap-2 px-2">
                <MessageSquare size={16} className="text-muted-foreground" />
                <h3 className="font-semibold text-sm text-muted-foreground tracking-wide">Recent Chats</h3>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto scrollbar-thin">
                {/* Mocked previous chats for visual only since backend doesn't store history */}
                {["Current Session"].map((chat, i) => (
                  <button key={i} className="flex items-center gap-3 w-full text-left p-3 rounded-2xl bg-secondary/40 transition-colors group border border-black/5">
                    <div className="w-6 h-6 rounded-full bg-background border border-black/5 flex items-center justify-center shrink-0 group-hover:border-primary/20 transition-colors">
                      <MessageSquare size={12} className="text-primary transition-colors" />
                    </div>
                    <span className="text-sm truncate text-foreground font-medium">{chat}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col h-full relative min-w-0">
              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-6 py-6 pr-2 scrollbar-thin">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-4 p-6 rounded-3xl border border-black/5 backdrop-blur-sm max-w-[85%] ${
                    msg.sender === "ai" ? "bg-secondary/30 self-start" : "bg-primary/5 self-end ml-auto"
                  }`}>
                    {msg.sender === "ai" && (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Sparkles size={16} className="text-primary" />
                      </div>
                    )}
                    <div className="flex flex-col gap-2 w-full">
                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                ))}
                {isProcessing && messages[messages.length - 1]?.text === "" && (
                  <div className="flex gap-4 p-6 bg-secondary/30 rounded-3xl border border-black/5 backdrop-blur-sm self-start max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Sparkles size={16} className="text-primary" />
                    </div>
                    <div className="flex items-center gap-1.5 h-6">
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce delay-75"></span>
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce delay-150"></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="relative group mt-4">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-3xl blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-background/80 backdrop-blur-md border border-black/5 rounded-3xl shadow-xl flex flex-col transition-all">
                  <div className="flex items-center p-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendMessage();
                      }}
                      placeholder={`Ask about ${workspace.title}...`}
                      className="w-full bg-transparent border-none outline-none px-4 py-3 text-base placeholder:text-muted-foreground/60 focus:ring-0"
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={isProcessing || !inputText.trim()}
                      className="p-3 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center transition-all mr-1 shadow-lg hover:bg-primary/90 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar: Source List */}
            <div className="w-1/3 min-w-[320px] max-w-md border-r border-black/5 bg-secondary/5 flex flex-col">
              <div className="p-6 flex items-center justify-between border-b border-black/5">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <Database size={20} className="text-primary" />
                  Knowledge Base
                </h2>
                <button 
                  onClick={() => setShowImportModal(true)}
                  className="p-2 text-primary hover:bg-primary/10 rounded-full transition-all"
                  title="Add Content"
                >
                  <Sparkles size={18} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {workspace.sources.map((source) => (
                  <button 
                    key={source.id} 
                    onClick={() => setSelectedSourceId(source.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-1 ${
                      selectedSourceId === source.id 
                        ? "bg-primary/10 border-primary/20 shadow-sm" 
                        : "bg-background border-black/5 hover:border-primary/10 hover:bg-secondary/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold truncate flex-1">{source.title}</h4>
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        source.status === "done" ? "bg-green-500" : source.status === "error" ? "bg-red-500" : "bg-blue-500 animate-pulse"
                      }`} />
                    </div>
                    <p className="text-xs text-muted-foreground truncate opacity-70">{source.url}</p>
                  </button>
                ))}
                
                {workspace.sources.length === 0 && (
                  <div className="text-center py-12 px-4 text-muted-foreground border border-dashed border-black/10 rounded-3xl text-sm">
                    No content added yet.
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Transcription View */}
            <div className="flex-1 flex flex-col bg-background overflow-hidden">
              {selectedSourceId ? (
                (() => {
                  const source = workspace.sources.find(s => s.id === selectedSourceId);
                  if (!source) return null;
                  return (
                    <div className="flex flex-col h-full">
                      <div className="p-6 border-b border-black/5 flex items-center justify-between bg-white/50 backdrop-blur-sm">
                        <div className="min-w-0">
                          <h3 className="font-bold text-lg truncate">{source.title}</h3>
                          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block max-w-md">
                            {source.url}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-full border border-black/5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{source.status}</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                        {source.status === "done" ? (
                          <div className="max-w-3xl mx-auto">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-8 border-b border-black/5 pb-2">Transcription</h4>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-wrap selection:bg-primary/20">
                                {source.transcription || "No transcription available."}
                              </p>
                            </div>
                          </div>
                        ) : source.status === "progress" ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-6">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                              <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                            <h4 className="text-lg font-semibold mb-2">Processing Content</h4>
                            <p className="text-muted-foreground text-sm max-w-xs">
                              We're currently transcribing this source. This might take a few minutes depending on the length.
                            </p>
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center p-6">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                              <Database className="w-8 h-8 text-red-500" />
                            </div>
                            <h4 className="text-lg font-semibold mb-2 text-red-500">Error</h4>
                            <p className="text-muted-foreground text-sm max-w-xs">
                              There was an error processing this source.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                  <div className="w-20 h-20 rounded-3xl bg-secondary/20 flex items-center justify-center mb-6">
                    <Database size={32} className="text-muted-foreground/40" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Select a source</h3>
                  <p className="max-w-xs text-sm">
                    Select a source from the list on the left to view its transcription and details.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`bg-background rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-black/10 flex flex-col transition-all duration-300 ${
            importStep === "url" ? "w-full max-w-md p-8" : "w-full max-w-2xl max-h-[80vh] p-8"
          }`}>
            <h2 className="text-xl font-bold mb-2">
              {importStep === "url" ? "Import New Source" : "Select Videos to Import"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {importStep === "url" 
                ? "Paste a YouTube Video, Playlist, or Channel URL." 
                : `Found ${previewVideos.length} videos. Choose which ones to add to ${workspace.title}.`}
            </p>

            {importStep === "url" ? (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">URL / Link</label>
                  <input 
                    type="text" 
                    value={importUrl} 
                    onChange={e => setImportUrl(e.target.value)} 
                    className="w-full bg-secondary/30 border border-black/10 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                    placeholder="https://youtube.com/..." 
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto min-h-[300px] border border-black/5 rounded-2xl bg-secondary/5 mb-6">
                <div className="p-2 space-y-1">
                  <div className="flex items-center gap-3 p-3 border-b border-black/5 mb-2">
                    <input 
                      type="checkbox" 
                      checked={selectedUrls.length === previewVideos.length}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedUrls(previewVideos.map(v => v.url));
                        else setSelectedUrls([]);
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-semibold">Select All</span>
                  </div>
                  {previewVideos.map((vid, i) => (
                    <label key={i} className="flex items-center gap-3 p-3 hover:bg-secondary/20 rounded-xl cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={selectedUrls.includes(vid.url)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedUrls(prev => [...prev, vid.url]);
                          else setSelectedUrls(prev => prev.filter(u => u !== vid.url));
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm truncate">{vid.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-4">
              <button 
                onClick={() => {
                  setShowImportModal(false);
                  resetImportState();
                }} 
                className="px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary rounded-xl transition-colors"
              >
                Cancel
              </button>
              
              {importStep === "url" ? (
                <button 
                  onClick={handleFetchPreview} 
                  disabled={isImporting || !importUrl.trim()} 
                  className="bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-lg"
                >
                  {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles size={16} />}
                  Fetch Videos
                </button>
              ) : (
                <button 
                  onClick={handleFinalImport} 
                  disabled={isImporting || selectedUrls.length === 0} 
                  className="bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-lg"
                >
                  {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Import Selected"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
