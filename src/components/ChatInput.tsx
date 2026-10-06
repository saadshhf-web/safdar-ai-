import React, { useRef, useState, useEffect } from 'react';
import {
  Send,
  Square,
  Paperclip,
  Globe,
  Mic,
  MicOff,
  X,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Zap,
} from 'lucide-react';
import { AttachmentItem, ResponseMode } from '../types.ts';
import { voiceInput } from '../services/voice.ts';

interface ChatInputProps {
  onSendMessage: (
    message: string,
    attachments: AttachmentItem[],
    enableSearch: boolean
  ) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  webSearchEnabled: boolean;
  onToggleWebSearch: () => void;
  activeMode: ResponseMode;
  onChangeMode: (mode: ResponseMode) => void;
  quickResponseSpeed: 'quick' | 'balanced' | 'detailed';
  onCycleQuickResponse: () => void;
  enterToSend: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  webSearchEnabled,
  onToggleWebSearch,
  activeMode,
  onChangeMode,
  quickResponseSpeed,
  onCycleQuickResponse,
  enterToSend,
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (isStreaming) {
      onStopStreaming();
      return;
    }

    if (!text.trim() && attachments.length === 0) return;

    onSendMessage(text.trim(), attachments, webSearchEnabled);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && enterToSend) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    processFiles(Array.from(files));
    e.target.value = '';
  };

  const processFiles = (files: File[]) => {
    for (const file of files) {
      if (file.size > 25 * 1024 * 1024) {
        alert(`File "${file.name}" is larger than 25MB limit.`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const newAttachment: AttachmentItem = {
          id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          name: file.name,
          size: file.size,
          mimeType: file.type || 'application/octet-stream',
          base64,
          previewUrl: file.type.startsWith('image/') ? base64 : undefined,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleMic = () => {
    if (isListening) {
      voiceInput.stop();
      setIsListening(false);
    } else {
      if (!voiceInput.isSupported) {
        alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
        return;
      }
      voiceInput.start(
        (transcript) => {
          setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        (listening) => setIsListening(listening),
        (err) => console.warn('Voice recognition error:', err)
      );
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative mx-auto w-full max-w-4xl p-2 md:p-3 transition-colors ${
        isDragging ? 'bg-indigo-950/30 rounded-2xl border-2 border-dashed border-indigo-500' : ''
      }`}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.json,.js,.ts,.py,.html,.css"
      />

      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl backdrop-blur-md focus-within:border-indigo-500/70 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 border-b border-slate-800/80 bg-slate-950/40 rounded-t-2xl">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="relative flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200"
              >
                {att.previewUrl ? (
                  <img
                    src={att.previewUrl}
                    alt={att.name}
                    className="w-7 h-7 rounded object-cover border border-slate-700"
                  />
                ) : (
                  <FileText size={16} className="text-indigo-400 shrink-0" />
                )}
                <span className="max-w-[140px] truncate text-xs font-medium">{att.name}</span>
                <span className="text-[10px] text-slate-400">
                  ({(att.size / 1024).toFixed(0)}k)
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="p-1 rounded-full hover:bg-slate-700 text-slate-400 hover:text-slate-100 cursor-pointer ml-1"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Listening notification indicator */}
        {isListening && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-950/60 border-b border-indigo-800/40 text-xs text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Listening to speech... Speak clearly into your microphone</span>
            <button
              type="button"
              onClick={toggleMic}
              className="ml-auto text-xs underline hover:text-white"
            >
              Stop
            </button>
          </div>
        )}

        {/* Text Area */}
        <div className="px-3 pt-3 pb-1">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              webSearchEnabled
                ? 'Search web & ask Safdar AI... (e.g. "Latest news on AI")'
                : 'Message Safdar AI... (e.g. "What is HTML?", "Help me code a Python calculator")'
            }
            rows={1}
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none max-h-52 leading-relaxed"
          />
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-slate-800/40 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Attach File Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 text-slate-400 transition-colors cursor-pointer flex items-center gap-1"
              title="Attach files or images"
            >
              <Paperclip size={15} />
              <span className="hidden sm:inline text-[11px]">Attach</span>
            </button>

            {/* Web Search Button */}
            <button
              type="button"
              onClick={onToggleWebSearch}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium ${
                webSearchEnabled
                  ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 shadow-sm'
                  : 'hover:bg-slate-800 hover:text-slate-200 text-slate-400'
              }`}
              title="Toggle Live Web Search Grounding"
            >
              <Globe size={14} className={webSearchEnabled ? 'text-cyan-400' : ''} />
              <span>Web Search</span>
              {webSearchEnabled && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 ml-0.5" />}
            </button>

            {/* Quick Response Toggle Pill */}
            <button
              type="button"
              onClick={onCycleQuickResponse}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium ${
                quickResponseSpeed === 'quick'
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50'
                  : quickResponseSpeed === 'detailed'
                  ? 'bg-purple-950/60 text-purple-300 border border-purple-800/50'
                  : 'hover:bg-slate-800 text-slate-400'
              }`}
              title="Speed/Detail Mode (Ctrl+Shift+Q)"
            >
              <Zap size={13} className={quickResponseSpeed === 'quick' ? 'text-amber-400' : ''} />
              <span className="capitalize">{quickResponseSpeed}</span>
            </button>

            {/* Mode Selector */}
            <select
              value={activeMode}
              onChange={(e) => onChangeMode(e.target.value as ResponseMode)}
              className="bg-slate-800 border border-slate-700 text-slate-300 text-[11px] rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="balanced">💬 Chat Mode</option>
              <option value="coding">💻 Coding Mode</option>
              <option value="study">🎓 Study Mode</option>
              <option value="writing">✍️ Writing Mode</option>
              <option value="translation">🌐 Translation Mode</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleMic}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 animate-pulse'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title={isListening ? 'Stop listening' : 'Voice input (Speech to text)'}
            >
              {isListening ? <MicOff size={15} /> : <Mic size={15} />}
            </button>

            {/* Send or Stop Button */}
            {isStreaming ? (
              <button
                type="button"
                onClick={onStopStreaming}
                className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all cursor-pointer"
                title="Stop generating"
              >
                <Square size={15} className="fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={!text.trim() && attachments.length === 0}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  text.trim() || attachments.length > 0
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
                title="Send message (Enter)"
              >
                <Send size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
      <p className="text-[10px] text-slate-500 text-center mt-1.5">
        SAFDAR AI can make mistakes. Verify critical facts and code. Press Enter to send, Shift+Enter for new line.
      </p>
    </div>
  );
};
