import React, { useState } from 'react';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  RotateCw,
  Edit3,
  ExternalLink,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Bot,
  User,
} from 'lucide-react';
import { ChatMessage } from '../types.ts';
import { MarkdownRenderer } from './MarkdownRenderer.tsx';
import { voiceOutput } from '../services/voice.ts';

interface ChatMessageItemProps {
  message: ChatMessage;
  onRegenerate?: () => void;
  onEdit?: (newContent: string) => void;
  onLike?: () => void;
  onDislike?: () => void;
  onOpenSettings?: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onRegenerate,
  onEdit,
  onLike,
  onDislike,
  onOpenSettings,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      voiceOutput.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      voiceOutput.speak(message.content, {
        onEnd: () => setIsSpeaking(false),
      });
    }
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== message.content) {
      onEdit?.(editText.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      className={`group relative flex gap-3 px-4 py-4 transition-colors ${
        isUser ? 'bg-transparent' : 'bg-slate-900/40 border-y border-slate-800/40'
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0 pt-0.5">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User size={16} />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Bot size={17} />
          </div>
        )}
      </div>

      {/* Message Content Area */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header: Sender & Meta */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs tracking-wide text-slate-200">
            {isUser ? 'You' : 'SAFDAR AI'}
          </span>

          {!isUser && message.model && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
              <Sparkles size={10} />
              {message.model}
            </span>
          )}

          <span className="text-[11px] text-slate-500">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Attachments preview if any */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1 pb-1">
            {message.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/70 text-xs text-slate-300 max-w-xs"
              >
                {att.mimeType?.startsWith('image/') ? (
                  <img
                    src={att.base64}
                    alt={att.name}
                    className="w-10 h-10 rounded object-cover border border-slate-700"
                  />
                ) : (
                  <FileText size={16} className="text-indigo-400" />
                )}
                <div className="truncate">
                  <p className="font-medium text-xs truncate">{att.name}</p>
                  <p className="text-[10px] text-slate-400">{(att.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Body content / Editor */}
        {isEditing ? (
          <div className="space-y-2 mt-1">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-2.5 text-sm rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-y"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-1 text-xs rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-2.5 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-500 font-medium"
              >
                Save & Resend
              </button>
            </div>
          </div>
        ) : (
          <div className="text-slate-200">
            {isUser ? (
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
            ) : (
              <MarkdownRenderer content={message.content} />
            )}
          </div>
        )}

        {/* Streaming Indicator */}
        {message.isStreaming && (
          <div className="inline-flex items-center gap-1.5 text-xs text-indigo-400 font-medium pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse delay-150" />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse delay-300" />
            <span className="text-[11px] text-indigo-300">Safdar AI is responding...</span>
          </div>
        )}

        {/* Grounding / Citations if Web Search was used */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-800/80">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Sources & Citations
            </p>
            <div className="flex flex-wrap gap-1.5">
              {message.sources.map((source, sIdx) => (
                <a
                  key={sIdx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800/70 hover:bg-slate-800 border border-slate-700/50 text-[11px] text-indigo-300 hover:text-indigo-200 transition-colors"
                >
                  <ExternalLink size={10} />
                  <span className="max-w-[200px] truncate">{source.title || source.url}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Error Recovery UI if request failed */}
        {message.error && (
          <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-200 space-y-2 mt-2">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold">Safdar AI couldn't generate a response.</p>
                <p className="text-xs text-rose-300/80 mt-0.5 leading-relaxed">{message.error}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {onRegenerate && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="px-2.5 py-1 rounded bg-rose-800/50 hover:bg-rose-800 text-rose-100 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCw size={12} />
                  Retry
                </button>
              )}
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  Check API Settings
                </button>
              )}
            </div>
          </div>
        )}

        {/* Message Actions Bar */}
        {!message.isStreaming && !message.error && (
          <div className="flex items-center gap-1 pt-1 opacity-80 group-hover:opacity-100 transition-opacity text-slate-400">
            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Copy message"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>

            {/* Read aloud button */}
            <button
              type="button"
              onClick={handleToggleSpeak}
              className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer text-xs"
              title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
            >
              {isSpeaking ? (
                <VolumeX size={13} className="text-indigo-400" />
              ) : (
                <Volume2 size={13} />
              )}
            </button>

            {/* User message edit button */}
            {isUser && onEdit && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer text-xs"
                title="Edit message"
              >
                <Edit3 size={13} />
              </button>
            )}

            {/* Assistant message regenerate */}
            {!isUser && onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer text-xs"
                title="Regenerate response"
              >
                <RotateCw size={13} />
              </button>
            )}

            {/* Feedback: Like / Dislike */}
            {!isUser && (
              <>
                <button
                  type="button"
                  onClick={onLike}
                  className={`p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer text-xs ${
                    message.liked ? 'text-indigo-400 bg-indigo-950/40' : 'hover:text-slate-200'
                  }`}
                  title="Good response"
                >
                  <ThumbsUp size={13} />
                </button>
                <button
                  type="button"
                  onClick={onDislike}
                  className={`p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer text-xs ${
                    message.disliked ? 'text-rose-400 bg-rose-950/40' : 'hover:text-slate-200'
                  }`}
                  title="Poor response"
                >
                  <ThumbsDown size={13} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
