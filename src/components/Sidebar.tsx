import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Pin,
  Archive,
  Trash2,
  Edit2,
  FolderKanban,
  Bot,
  FileEdit,
  Palette,
  BarChart3,
  Brain,
  Files,
  Settings,
  X,
  Sparkles,
  Check,
  ChevronDown,
  User,
  ExternalLink,
} from 'lucide-react';
import { Conversation, Project, CustomAssistant } from '../types.ts';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  activeView: string;
  onSelectView: (view: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  userName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onTogglePin,
  onToggleArchive,
  onDeleteConversation,
  activeView,
  onSelectView,
  isOpen,
  onCloseMobile,
  onOpenSettings,
  onOpenProfile,
  userName = 'Saad',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations.filter((c) => !c.isArchived);
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  // Group by timeframe
  const grouped = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const sevenDays = 7 * oneDay;
    const thirtyDays = 30 * oneDay;

    const pinned: Conversation[] = [];
    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const prev7Days: Conversation[] = [];
    const prev30Days: Conversation[] = [];
    const older: Conversation[] = [];

    for (const conv of filteredConversations) {
      if (conv.isPinned) {
        pinned.push(conv);
        continue;
      }

      const diff = now - conv.updatedAt;
      if (diff < oneDay) {
        today.push(conv);
      } else if (diff < 2 * oneDay) {
        yesterday.push(conv);
      } else if (diff < sevenDays) {
        prev7Days.push(conv);
      } else if (diff < thirtyDays) {
        prev30Days.push(conv);
      } else {
        older.push(conv);
      }
    }

    return { pinned, today, yesterday, prev7Days, prev30Days, older };
  }, [filteredConversations]);

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const renderConvItem = (conv: Conversation) => {
    const isActive = activeView === 'chat' && activeConversationId === conv.id;
    const isEditing = editingId === conv.id;

    return (
      <div
        key={conv.id}
        onClick={() => {
          onSelectView('chat');
          onSelectConversation(conv.id);
          onCloseMobile();
        }}
        className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-all ${
          isActive
            ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30 font-medium'
            : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
          <MessageSquare
            size={14}
            className={`shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}
          />

          {isEditing ? (
            <form onSubmit={(e) => handleSaveRename(conv.id, e)} className="flex-1 mr-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                autoFocus
                onBlur={() => setEditingId(null)}
                className="w-full bg-slate-950 px-1.5 py-0.5 rounded text-xs text-white border border-indigo-500 focus:outline-none"
              />
            </form>
          ) : (
            <span className="truncate">{conv.title || 'Untitled conversation'}</span>
          )}
        </div>

        {/* Action icons on hover */}
        {!isEditing && (
          <div className="hidden group-hover:flex items-center gap-0.5 shrink-0 text-slate-400">
            <button
              type="button"
              onClick={(e) => handleStartRename(conv, e)}
              className="p-1 rounded hover:text-white hover:bg-slate-700/60 transition-colors"
              title="Rename"
            >
              <Edit2 size={12} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(conv.id);
              }}
              className="p-1 rounded hover:text-white hover:bg-slate-700/60 transition-colors"
              title={conv.isPinned ? 'Unpin' : 'Pin'}
            >
              <Pin size={12} className={conv.isPinned ? 'fill-current text-indigo-400' : ''} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConversation(conv.id);
              }}
              className="p-1 rounded hover:text-rose-300 hover:bg-slate-700/60 transition-colors"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-72 bg-slate-950 border-r border-slate-800/80 transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-extrabold text-white text-xs tracking-tighter">
                SA
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-wider text-white">SAFDAR AI</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Intelligent AI Assistant</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Top Action: + New Chat */}
        <div className="p-3">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-slate-900/80 border border-slate-800/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60"
            />
          </div>
        </div>

        {/* Workspace Feature Navigation */}
        <div className="px-3 py-1.5 border-b border-slate-800/60 space-y-0.5 text-xs">
          <button
            type="button"
            onClick={() => {
              onSelectView('canvas');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeView === 'canvas'
                ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <FileEdit size={14} className="text-indigo-400" />
            <span>Canvas Workspace</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectView('image-studio');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeView === 'image-studio'
                ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Palette size={14} className="text-pink-400" />
            <span>Image Studio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectView('data-analysis');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeView === 'data-analysis'
                ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <BarChart3 size={14} className="text-violet-400" />
            <span>Data Analysis</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectView('projects');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeView === 'projects'
                ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <FolderKanban size={14} className="text-amber-400" />
            <span>Projects</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectView('assistants');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeView === 'assistants'
                ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Bot size={14} className="text-emerald-400" />
            <span>Custom Assistants</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectView('files');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeView === 'files'
                ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Files size={14} className="text-sky-400" />
            <span>File Library</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectView('memory');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeView === 'memory'
                ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Brain size={14} className="text-purple-400" />
            <span>Memory</span>
          </button>
        </div>

        {/* Scrollable Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 select-none">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 px-4 text-slate-500 text-xs">
              <MessageSquare size={24} className="mx-auto mb-2 opacity-40 text-slate-400" />
              <p>No conversations yet</p>
              <p className="text-[11px] text-slate-600 mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            <>
              {grouped.pinned.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Pin size={10} /> Pinned
                  </div>
                  {grouped.pinned.map(renderConvItem)}
                </div>
              )}

              {grouped.today.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Today
                  </div>
                  {grouped.today.map(renderConvItem)}
                </div>
              )}

              {grouped.yesterday.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Yesterday
                  </div>
                  {grouped.yesterday.map(renderConvItem)}
                </div>
              )}

              {grouped.prev7Days.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Previous 7 Days
                  </div>
                  {grouped.prev7Days.map(renderConvItem)}
                </div>
              )}

              {grouped.prev30Days.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Previous 30 Days
                  </div>
                  {grouped.prev30Days.map(renderConvItem)}
                </div>
              )}

              {grouped.older.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Older
                  </div>
                  {grouped.older.map(renderConvItem)}
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar Footer: Profile & Settings */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-900 text-left transition-colors cursor-pointer flex-1 mr-1"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">{userName}</p>
                <p className="text-[10px] text-slate-400">Safdar AI User</p>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              title="Settings & API Configuration"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
