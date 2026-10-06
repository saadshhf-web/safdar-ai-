import React, { useState } from 'react';
import {
  Brain,
  Plus,
  Trash2,
  ShieldCheck,
  Check,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { UserMemory } from '../types.ts';

interface MemoryViewProps {
  memories: UserMemory[];
  memoryEnabled: boolean;
  onToggleMemory: (enabled: boolean) => void;
  onAddMemory: (content: string, category?: string) => void;
  onDeleteMemory: (id: string) => void;
  onClearMemories: () => void;
}

export const MemoryView: React.FC<MemoryViewProps> = ({
  memories,
  memoryEnabled,
  onToggleMemory,
  onAddMemory,
  onDeleteMemory,
  onClearMemories,
}) => {
  const [newContent, setNewContent] = useState('');
  const [category, setCategory] = useState('Personal Preference');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    onAddMemory(newContent.trim(), category);
    setNewContent('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 md:p-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="text-purple-400" size={24} />
            <h1 className="text-xl md:text-2xl font-bold text-white">Memory Management</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Store user preferences and context across chats. Clearly separated from chat history.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onToggleMemory(!memoryEnabled)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
            memoryEnabled
              ? 'bg-purple-950/60 border-purple-700/60 text-purple-300'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          {memoryEnabled ? (
            <>
              <ToggleRight size={20} className="text-purple-400" />
              <span>Memory Active</span>
            </>
          ) : (
            <>
              <ToggleLeft size={20} />
              <span>Memory Disabled</span>
            </>
          )}
        </button>
      </div>

      {/* Privacy note */}
      <div className="my-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
        <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-200">Zero Secret Tracking</p>
          <p className="text-slate-400 mt-0.5 leading-relaxed">
            Safdar AI only uses memories you explicitly add or approve. You can edit, delete single items, or clear all saved memories at any time.
          </p>
        </div>
      </div>

      {/* Add Memory Form */}
      <form onSubmit={handleAdd} className="space-y-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 mb-6">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Add Custom Memory
        </h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder='e.g. "My name is Saad and I prefer concise TypeScript code examples."'
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500/70"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="Personal Preference">Personal Preference</option>
            <option value="Coding Style">Coding Style</option>
            <option value="Work / Industry">Work / Industry</option>
            <option value="Language / Tone">Language / Tone</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-md shadow-purple-600/20 cursor-pointer flex items-center justify-center gap-1 shrink-0"
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Memories List */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Saved Memories ({memories.length})
          </h2>
          {memories.length > 0 && (
            <button
              type="button"
              onClick={onClearMemories}
              className="text-xs text-rose-400 hover:underline cursor-pointer"
            >
              Clear All Memories
            </button>
          )}
        </div>

        {memories.length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-2xl p-10 text-center text-xs text-slate-500">
            <Brain size={28} className="mx-auto mb-2 opacity-30 text-slate-400" />
            <p>No memories saved yet.</p>
            <p className="mt-1 text-slate-600">
              Add rules or preferences above that Safdar AI should remember across conversations.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {memories.map((mem) => (
              <div
                key={mem.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200"
              >
                <div>
                  <p className="font-medium">{mem.content}</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {mem.category} &bull; {new Date(mem.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteMemory(mem.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
