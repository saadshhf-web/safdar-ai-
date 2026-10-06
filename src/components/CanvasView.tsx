import React, { useState, useEffect } from 'react';
import {
  FileEdit,
  Sparkles,
  Code2,
  Copy,
  Check,
  Download,
  Trash2,
  Plus,
  RotateCw,
  Wand2,
  CheckCheck,
  Minimize2,
  Maximize2,
  Languages,
} from 'lucide-react';
import { CanvasDocument, ProviderType } from '../types.ts';
import { ApiService } from '../services/api.ts';

interface CanvasViewProps {
  canvasDocs: CanvasDocument[];
  onSaveDoc: (doc: CanvasDocument) => void;
  onDeleteDoc: (id: string) => void;
  selectedProvider: ProviderType;
}

export const CanvasView: React.FC<CanvasViewProps> = ({
  canvasDocs,
  onSaveDoc,
  onDeleteDoc,
  selectedProvider,
}) => {
  const [activeDocId, setActiveDocId] = useState<string | null>(
    canvasDocs.length > 0 ? canvasDocs[0].id : null
  );
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [docType, setDocType] = useState<'document' | 'code'>('document');
  const [language, setLanguage] = useState('javascript');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync state when active document changes
  useEffect(() => {
    if (activeDocId) {
      const doc = canvasDocs.find((d) => d.id === activeDocId);
      if (doc) {
        setTitle(doc.title);
        setContent(doc.content);
        setDocType(doc.type);
        setLanguage(doc.language || 'javascript');
        return;
      }
    }

    if (canvasDocs.length > 0) {
      const first = canvasDocs[0];
      setActiveDocId(first.id);
      setTitle(first.title);
      setContent(first.content);
      setDocType(first.type);
      setLanguage(first.language || 'javascript');
    } else {
      setActiveDocId(null);
      setTitle('');
      setContent('');
    }
  }, [activeDocId, canvasDocs]);

  const handleCreateNew = (type: 'document' | 'code') => {
    const newDoc: CanvasDocument = {
      id: 'doc_' + Date.now(),
      title: type === 'document' ? 'Untitled Document' : 'Untitled Script',
      content:
        type === 'document'
          ? '# Executive Summary\n\nDraft your report or article here...'
          : '// SAFDAR AI Code Canvas\nfunction calculateMetrics() {\n  return { status: "active" };\n}',
      type,
      language: type === 'code' ? 'typescript' : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onSaveDoc(newDoc);
    setActiveDocId(newDoc.id);
  };

  const handleSaveCurrent = () => {
    if (!activeDocId) return;
    const existing = canvasDocs.find((d) => d.id === activeDocId);
    if (!existing) return;

    const updated: CanvasDocument = {
      ...existing,
      title: title.trim() || 'Untitled',
      content,
      type: docType,
      language: docType === 'code' ? language : undefined,
      updatedAt: Date.now(),
    };
    onSaveDoc(updated);
  };

  const handleAIAction = async (action: string) => {
    if (!content.trim()) return;
    setIsProcessing(true);

    let instruction = '';
    switch (action) {
      case 'rewrite':
        instruction = 'Rewrite the following text to enhance readability, clarity, and vocabulary while keeping the original intent:';
        break;
      case 'improve':
        instruction = 'Improve the tone and professional flow of this text:';
        break;
      case 'shorten':
        instruction = 'Condense and shorten the following content concisely into key points:';
        break;
      case 'expand':
        instruction = 'Expand on this content with detailed explanations and background context:';
        break;
      case 'fix-grammar':
        instruction = 'Fix all grammar, punctuation, and typographical issues without altering the core tone:';
        break;
      case 'add-comments':
        instruction = 'Add clean, descriptive documentation and code comments explaining each section:';
        break;
      case 'debug':
        instruction = 'Analyze this code, identify any bugs or vulnerabilities, and provide the corrected code:';
        break;
      case 'optimize':
        instruction = 'Optimize this code for execution speed and memory efficiency:';
        break;
      default:
        instruction = `Process this text:`;
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${instruction}\n\n${content}`,
          provider: selectedProvider,
          stream: false,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        // Strip markdown code fences if in code mode
        let cleaned = data.reply;
        if (docType === 'code') {
          cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
        }
        setContent(cleaned);
        handleSaveCurrent();
      }
    } catch (err) {
      console.error('Canvas AI error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = docType === 'code' ? (language === 'python' ? 'py' : language === 'html' ? 'html' : 'ts') : 'md';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_') || 'canvas'}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-slate-950">
      {/* Left sidebar: Documents list */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800/80 bg-slate-900/50 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <FileEdit size={14} className="text-indigo-400" />
            <span>Canvas Docs ({canvasDocs.length})</span>
          </div>

          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleCreateNew('document')}
              className="p-1 rounded-lg bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 text-[10px] font-medium flex items-center gap-0.5 cursor-pointer"
              title="New Document"
            >
              <Plus size={11} /> Doc
            </button>
            <button
              type="button"
              onClick={() => handleCreateNew('code')}
              className="p-1 rounded-lg bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 text-[10px] font-medium flex items-center gap-0.5 cursor-pointer"
              title="New Code File"
            >
              <Plus size={11} /> Code
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {canvasDocs.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              <p>No documents yet.</p>
              <p className="text-[11px] mt-1 text-slate-600">Click + Doc or + Code to begin.</p>
            </div>
          ) : (
            canvasDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setActiveDocId(doc.id)}
                className={`group flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                  doc.id === activeDocId
                    ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30 font-medium'
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2 truncate flex-1 mr-2">
                  {doc.type === 'code' ? (
                    <Code2 size={13} className="text-emerald-400 shrink-0" />
                  ) : (
                    <FileEdit size={13} className="text-indigo-400 shrink-0" />
                  )}
                  <span className="truncate">{doc.title}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDoc(doc.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-rose-400"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor & AI Workspace */}
      {activeDocId ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
          {/* Header Bar */}
          <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap bg-slate-900/60">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                handleSaveCurrent();
              }}
              placeholder="Document title..."
              className="bg-transparent font-bold text-sm md:text-base text-slate-100 focus:outline-none flex-1 min-w-[150px]"
            />

            <div className="flex items-center gap-2 flex-wrap text-xs">
              {docType === 'code' && (
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    handleSaveCurrent();
                  }}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="sql">SQL</option>
                  <option value="json">JSON</option>
                </select>
              )}

              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                title="Copy text"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span className="hidden sm:inline">Copy</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                title="Download file"
              >
                <Download size={13} />
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </div>

          {/* AI Toolbar */}
          <div className="p-2 border-b border-slate-800/80 bg-slate-900/40 flex items-center gap-1.5 overflow-x-auto text-xs text-slate-300">
            <span className="flex items-center gap-1 px-1.5 font-semibold text-indigo-400 text-[11px] uppercase tracking-wider shrink-0">
              <Sparkles size={12} /> AI Tools:
            </span>

            {docType === 'document' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleAIAction('rewrite')}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600/30 hover:text-indigo-200 transition-colors shrink-0 disabled:opacity-50"
                >
                  Rewrite
                </button>
                <button
                  type="button"
                  onClick={() => handleAIAction('improve')}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600/30 hover:text-indigo-200 transition-colors shrink-0 disabled:opacity-50"
                >
                  Improve Flow
                </button>
                <button
                  type="button"
                  onClick={() => handleAIAction('shorten')}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600/30 hover:text-indigo-200 transition-colors shrink-0 disabled:opacity-50"
                >
                  Shorten
                </button>
                <button
                  type="button"
                  onClick={() => handleAIAction('expand')}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600/30 hover:text-indigo-200 transition-colors shrink-0 disabled:opacity-50"
                >
                  Expand
                </button>
                <button
                  type="button"
                  onClick={() => handleAIAction('fix-grammar')}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600/30 hover:text-indigo-200 transition-colors shrink-0 disabled:opacity-50"
                >
                  Fix Grammar
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleAIAction('add-comments')}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600/30 hover:text-emerald-200 transition-colors shrink-0 disabled:opacity-50"
                >
                  Add Comments
                </button>
                <button
                  type="button"
                  onClick={() => handleAIAction('debug')}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600/30 hover:text-emerald-200 transition-colors shrink-0 disabled:opacity-50"
                >
                  Debug & Fix
                </button>
                <button
                  type="button"
                  onClick={() => handleAIAction('optimize')}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600/30 hover:text-emerald-200 transition-colors shrink-0 disabled:opacity-50"
                >
                  Optimize
                </button>
              </>
            )}

            {isProcessing && (
              <span className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium ml-2 shrink-0">
                <RotateCw size={12} className="animate-spin" />
                Working on Canvas...
              </span>
            )}
          </div>

          {/* Main Text / Code Editor Area */}
          <div className="flex-1 p-4 overflow-hidden relative">
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                handleSaveCurrent();
              }}
              placeholder="Write or paste your content here..."
              className={`w-full h-full bg-transparent resize-none focus:outline-none leading-relaxed selection:bg-indigo-500/30 ${
                docType === 'code'
                  ? 'font-mono text-xs md:text-sm text-emerald-300'
                  : 'text-sm text-slate-100'
              }`}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
          <FileEdit size={36} className="mb-2 opacity-30 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-300">Canvas Workspace</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Create interactive documents or code files that you can refine with AI side-by-side.
          </p>
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={() => handleCreateNew('document')}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer"
            >
              New Document
            </button>
            <button
              type="button"
              onClick={() => handleCreateNew('code')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
            >
              New Code File
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
