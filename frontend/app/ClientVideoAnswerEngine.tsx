"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useVideoEngine } from "./controllers/useVideoEngine";
import { videoApi } from "./services/api";
import { KnowledgeBase, Source } from "./types";

export default function ClientVideoAnswerEngine() {
  const {
    knowledgeBases,
    standaloneSources,
    selectedItem,
    setSelectedItem,
    isInitializing,
    refreshData
  } = useVideoEngine();
  
  // UI States
  const [inputText, setInputText] = useState("");
  const [showTranscription, setShowTranscription] = useState(true);
  const [kbTab, setKbTab] = useState<"sources" | "chat" | "content">("sources");

  // Chat State
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    { sender: "ai", text: "Hello! Ask me anything about this Knowledge Base or Video." },
  ]);
  const [chatProcessing, setChatProcessing] = useState(false);
  
  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importTarget, setImportTarget] = useState<string>("standalone");
  const [newKbName, setNewKbName] = useState("");
  const [importStatus, setImportStatus] = useState<"idle" | "progress" | "done">("idle");

  // --- Helpers ---
  const getSelectedData = () => {
    if (!selectedItem) return null;
    if (selectedItem.type === "kb") {
      return knowledgeBases.find(kb => kb.id === selectedItem.id);
    } else {
      if (selectedItem.kbId) {
        const kb = knowledgeBases.find(kb => kb.id === selectedItem.kbId);
        return kb?.sources.find(s => s.id === selectedItem.id);
      }
      return standaloneSources.find(s => s.id === selectedItem.id);
    }
  };

  const selectedData = getSelectedData();

  // --- Actions ---
  const handleImport = async () => {
    if (!importUrl.trim()) return;
    setImportStatus("progress");
    try {
      await videoApi.importUrl(importUrl, importTarget, newKbName);
      await refreshData();
      
      setShowImportModal(false);
      setImportUrl("");
      setImportTarget("standalone");
      setNewKbName("");
      setImportStatus("idle");
    } catch (err) {
      console.error(err);
      setImportStatus("idle");
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedItem) return;
    const query = inputText;
    setChatMessages((prev) => [...prev, { sender: "user", text: query }]);
    setInputText("");
    setChatProcessing(true);
    
    try {
      const res = await videoApi.chat(query, selectedItem.type, selectedItem.id);
      setChatMessages((prev) => [
        ...prev,
        { sender: "ai", text: res.reply },
      ]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Error connecting to the chat engine." },
      ]);
    } finally {
      setChatProcessing(false);
    }
  };

  // --- Render Sections ---
  const renderSidebar = () => (
    <div className="w-[250px] bg-gray-50 flex flex-col z-10 border-r border-gray-200 shrink-0">
      <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-200">
        <Link href="/" className="text-xs font-medium text-gray-500 hover:text-black transition-colors">
          ← Home
        </Link>
        <button 
          onClick={() => setShowImportModal(true)}
          className="bg-black text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-gray-800 transition-colors"
        >
          + Import
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Knowledge Bases */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Knowledge Bases</h3>
          <div className="space-y-1">
            {knowledgeBases.map((kb) => (
              <div key={kb.id}>
                <button
                  onClick={() => setSelectedItem({ type: "kb", id: kb.id })}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-between ${
                    selectedItem?.type === "kb" && selectedItem.id === kb.id
                      ? "bg-gray-200 text-black"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="truncate">{kb.title}</span>
                  <span className="text-xs bg-gray-300 text-gray-700 px-1.5 py-0.5 rounded-full">{kb.sources.length}</span>
                </button>
                {(selectedItem?.type === "kb" && selectedItem.id === kb.id) || (selectedItem?.type === "source" && selectedItem.kbId === kb.id) ? (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                    {kb.sources.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedItem({ type: "source", id: s.id, kbId: kb.id })}
                        className={`w-full text-left px-2 py-1.5 text-xs font-medium rounded transition-colors truncate flex items-center justify-between ${
                          selectedItem?.type === "source" && selectedItem.id === s.id
                            ? "bg-gray-200 text-black"
                            : "text-gray-500 hover:text-black hover:bg-gray-100"
                        }`}
                      >
                        <span className="truncate pr-2">{s.title}</span>
                        {s.status === "progress" && <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full shrink-0 animate-pulse"></span>}
                        {s.status === "error" && <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"></span>}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {knowledgeBases.length === 0 && <p className="text-xs text-gray-400 px-3">No collections yet.</p>}
          </div>
        </div>

        {/* Standalone Sources */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Standalone Videos</h3>
          <div className="space-y-1">
            {standaloneSources.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedItem({ type: "source", id: s.id })}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors truncate flex items-center justify-between ${
                  selectedItem?.type === "source" && selectedItem.id === s.id
                    ? "bg-gray-200 text-black"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="truncate pr-2">{s.title}</span>
                {s.status === "progress" && <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full shrink-0 animate-pulse"></span>}
              </button>
            ))}
            {standaloneSources.length === 0 && <p className="text-xs text-gray-400 px-3">No standalone videos.</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderChatInterface = (title: string, placeholder: string) => (
    <div className="flex-1 flex flex-col relative bg-white transition-all duration-500 ease-in-out min-w-0">
      <div className="flex-1 px-8 py-4 flex flex-col overflow-y-auto bg-gray-50/30">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-semibold text-black uppercase tracking-widest">{title}</h3>
        </div>
        <div className="flex-1 flex flex-col justify-end space-y-4 pb-4">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`max-w-[75%] py-3 px-5 text-sm rounded-2xl leading-relaxed ${
              msg.sender === "user" ? "bg-black text-white self-end rounded-br-none" : "bg-white text-gray-800 self-start rounded-bl-none border border-gray-100 shadow-sm"
            }`}>
              {msg.text}
            </div>
          ))}
          {chatProcessing && (
            <div className="bg-white text-gray-500 self-start rounded-2xl rounded-bl-none border border-gray-100 shadow-sm py-3 px-5 text-sm flex gap-1 items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white px-8 py-6 z-10 shrink-0 border-t border-gray-100">
        <div className="w-full max-w-4xl mx-auto flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100 transition-all">
          <input
            type="text"
            className="flex-1 flex min-w-0 bg-transparent px-4 py-2 outline-none text-black font-medium placeholder-gray-400 text-sm"
            placeholder={placeholder}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
          />
          <button
            onClick={handleSendMessage}
            disabled={chatProcessing || !inputText.trim()}
            className="bg-black hover:bg-gray-800 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );

  const renderKbView = (kb: KnowledgeBase) => (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="px-8 pt-8 pb-4 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-black mb-1">{kb.title}</h1>
        <p className="text-sm text-gray-500 font-medium">{kb.sources.length} sources linked</p>
        <div className="flex items-center gap-6 mt-6">
          {(["sources", "chat", "content"] as const).map(tab => (
            <button key={tab} onClick={() => setKbTab(tab)} className={`pb-2 text-sm font-semibold capitalize transition-all border-b-2 ${kbTab === tab ? "border-black text-black" : "border-transparent text-gray-400 hover:text-gray-700"}`}>
              {tab === "chat" ? "Global Chat" : tab}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative bg-gray-50/30">
        {kbTab === "sources" && (
          <div className="p-8 overflow-y-auto h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kb.sources.map(s => (
                <div key={s.id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedItem({ type: "source", id: s.id, kbId: kb.id })}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 truncate pr-4">{s.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      s.status === "done" ? "bg-green-100 text-green-700" :
                      s.status === "progress" ? "bg-yellow-100 text-yellow-700" :
                      s.status === "error" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {s.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mb-4">{s.url}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {kbTab === "chat" && renderChatInterface(`Chatting with ${kb.title}`, `Ask anything about the ${kb.sources.length} videos...`)}
        {kbTab === "content" && (
          <div className="p-8 flex flex-col items-center justify-center h-full text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Extracted Content</h3>
            <p className="text-sm text-gray-500 max-w-sm">Coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSourceView = (source: Source) => (
    <div className="flex-1 flex flex-col bg-white relative">
      <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between z-10 bg-white">
        <div>
          <h2 className="text-lg font-bold text-black">{source.title}</h2>
          <a href={source.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">{source.url}</a>
        </div>
        <div className="flex items-center gap-3">
           <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
              source.status === "done" ? "bg-green-100 text-green-700" :
              source.status === "progress" ? "bg-yellow-100 text-yellow-700 animate-pulse" :
              source.status === "error" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
            }`}>
             {source.status}
           </span>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        {renderChatInterface("Chat with Video", "Ask anything about this video...")}
        <div className={`transition-all duration-500 ease-in-out flex flex-col overflow-hidden border-l border-gray-100 bg-gray-50 shrink-0 ${showTranscription ? "w-[35%] px-6 py-4" : "w-14 px-2 py-4 items-center"}`}>
          <div className={`flex items-center ${showTranscription ? "justify-between" : "justify-center"} mb-4 w-full`}>
            {showTranscription && <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest min-w-max">Transcript</h3>}
            <button onClick={() => setShowTranscription(!showTranscription)} className="text-gray-400 hover:text-black hover:bg-gray-200 p-1.5 rounded-md transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-500 ${showTranscription ? '' : 'rotate-180'}`}>
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
          <div className={`flex-1 overflow-y-auto flex flex-col min-w-[250px] transition-opacity duration-300 ${showTranscription ? "opacity-100" : "opacity-0 hidden"} pr-2`}>
            {source.status === "done" ? (
              <div className="text-gray-700 text-sm leading-loose whitespace-pre-wrap font-medium">{source.transcription}</div>
            ) : source.status === "error" ? (
              <div className="text-red-500 text-sm font-medium">{source.transcription || "Error occurred"}</div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
                <svg className="animate-spin h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span className="text-sm font-medium">Processing Audio...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isInitializing) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="flex h-screen w-full bg-white text-black font-sans overflow-hidden selection:bg-gray-200">
      {renderSidebar()}
      <div className="flex-1 flex overflow-hidden bg-white">
        {selectedData ? ('sources' in selectedData ? renderKbView(selectedData as KnowledgeBase) : renderSourceView(selectedData as Source)) : <div className="flex-1 flex items-center justify-center text-gray-400">Select a Knowledge Base or Video</div>}
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Import New Source</h2>
            <p className="text-sm text-gray-500 mb-6">Paste a YouTube Video, Playlist, or Channel URL.</p>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">URL / Link</label>
                <input type="text" value={importUrl} onChange={e => setImportUrl(e.target.value)} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black transition-all" placeholder="https://youtube.com/..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Save To</label>
                <select value={importTarget} onChange={e => setImportTarget(e.target.value)} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black transition-all appearance-none">
                  <option value="standalone">Standalone Video (No Knowledge Base)</option>
                  <option value="new_kb">+ Create New Knowledge Base</option>
                  {knowledgeBases.map(kb => (
                    <option key={kb.id} value={kb.id}>Knowledge Base: {kb.title}</option>
                  ))}
                </select>
              </div>
              {importTarget === "new_kb" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Knowledge Base Name</label>
                  <input type="text" value={newKbName} onChange={e => setNewKbName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black transition-all" placeholder="e.g. Stanford AI Lectures" />
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 mt-8">
              <button onClick={() => setShowImportModal(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleImport} disabled={importStatus === "progress" || !importUrl.trim()} className="bg-black text-white px-6 py-2.5 text-sm font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2">
                {importStatus === "progress" ? "Importing..." : "Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
