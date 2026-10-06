import React, { useState } from 'react';
import { X, Share2, Copy, Check, Globe, Shield } from 'lucide-react';
import { Conversation } from '../types.ts';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  conversation,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !conversation) return null;

  const shareUrl = `${window.location.origin}/#share=${conversation.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Share2 size={18} className="text-indigo-400" />
            <h3 className="font-bold text-sm text-white">Share Conversation</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div>
          <p className="text-xs text-slate-300 font-semibold truncate">
            {conversation.title || 'Untitled Conversation'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Anyone with this link will view a clean read-only snapshot of this chat transcript.
          </p>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <Globe size={14} className="text-indigo-400 shrink-0 ml-1" />
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="bg-transparent flex-1 text-slate-300 font-mono text-[11px] focus:outline-none truncate"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1 shrink-0 cursor-pointer text-xs"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-300" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
          <Shield size={14} className="text-emerald-400 shrink-0 mt-0.5" />
          <span>
            Private keys, sensitive developer variables, and user credentials are never shared.
          </span>
        </div>
      </div>
    </div>
  );
};
