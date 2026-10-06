import React from 'react';
import { X, Download, FileText, Code2, Printer } from 'lucide-react';
import { Conversation } from '../types.ts';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
  onPrint: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  conversation,
  onPrint,
}) => {
  if (!isOpen || !conversation) return null;

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };

  const exportMarkdown = () => {
    let md = `# ${conversation.title || 'Conversation'}\n\n`;
    md += `*Exported from SAFDAR AI on ${new Date().toLocaleString()}*\n\n---\n\n`;

    for (const msg of conversation.messages) {
      const sender = msg.role === 'user' ? '### User' : '### SAFDAR AI';
      md += `${sender} (${new Date(msg.timestamp).toLocaleTimeString()})\n\n${msg.content}\n\n`;
      if (msg.sources && msg.sources.length > 0) {
        md += `**Sources:**\n`;
        msg.sources.forEach((s) => {
          md += `- [${s.title}](${s.url})\n`;
        });
        md += `\n`;
      }
      md += `---\n\n`;
    }

    const safeTitle = (conversation.title || 'chat').replace(/[^a-z0-9_-]/gi, '_');
    downloadFile(md, `${safeTitle}.md`, 'text/markdown');
  };

  const exportText = () => {
    let txt = `SAFDAR AI CONVERSATION: ${conversation.title}\n`;
    txt += `Date: ${new Date().toLocaleString()}\n\n==============================\n\n`;

    for (const msg of conversation.messages) {
      const sender = msg.role === 'user' ? 'USER' : 'SAFDAR AI';
      txt += `[${sender} - ${new Date(msg.timestamp).toLocaleTimeString()}]:\n`;
      txt += `${msg.content}\n\n------------------------------\n\n`;
    }

    const safeTitle = (conversation.title || 'chat').replace(/[^a-z0-9_-]/gi, '_');
    downloadFile(txt, `${safeTitle}.txt`, 'text/plain');
  };

  const exportJSON = () => {
    const jsonStr = JSON.stringify(conversation, null, 2);
    const safeTitle = (conversation.title || 'chat').replace(/[^a-z0-9_-]/gi, '_');
    downloadFile(jsonStr, `${safeTitle}.json`, 'application/json');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Download size={18} className="text-indigo-400" />
            <h3 className="font-bold text-sm text-white">Export Conversation</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Select your preferred export format for "{conversation.title}":
        </p>

        <div className="space-y-2">
          <button
            type="button"
            onClick={exportMarkdown}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <FileText size={16} className="text-indigo-400" />
              <span>Markdown (.md)</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Formatted</span>
          </button>

          <button
            type="button"
            onClick={exportText}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <FileText size={16} className="text-slate-400" />
              <span>Plain Text (.txt)</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Raw</span>
          </button>

          <button
            type="button"
            onClick={exportJSON}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Code2 size={16} className="text-emerald-400" />
              <span>Structured JSON (.json)</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Full metadata</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onPrint();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Printer size={16} className="text-purple-400" />
              <span>PDF / Clean Print</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Browser Print</span>
          </button>
        </div>
      </div>
    </div>
  );
};
