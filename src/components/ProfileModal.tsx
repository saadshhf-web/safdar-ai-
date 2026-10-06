import React, { useState } from 'react';
import { X, User, Mail, Shield, Check, Sparkles } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onUpdateUserName: (name: string) => void;
  userEmail?: string;
  totalChatsCount: number;
  totalProjectsCount: number;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userName,
  onUpdateUserName,
  userEmail = 'saadshhf@gmail.com',
  totalChatsCount,
  totalProjectsCount,
}) => {
  const [name, setName] = useState(userName);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onUpdateUserName(name.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <User size={18} className="text-indigo-400" />
            <h3 className="font-bold text-sm text-white">User Profile</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="truncate">
            <p className="font-bold text-sm text-slate-100 truncate">{name}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
              <Mail size={12} />
              <span>{userEmail}</span>
            </p>
          </div>
        </div>

        {/* Edit Name Form */}
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {saved ? (
              <>
                <Check size={14} className="text-emerald-300" />
                <span>Profile Saved</span>
              </>
            ) : (
              <span>Update Profile</span>
            )}
          </button>
        </form>

        {/* Usage Statistics */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <p className="text-lg font-extrabold text-white">{totalChatsCount}</p>
            <p className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Conversations</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <p className="text-lg font-extrabold text-white">{totalProjectsCount}</p>
            <p className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Projects</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-center gap-2">
          <Shield size={14} className="text-emerald-400 shrink-0" />
          <span>Local session active &bull; Enterprise-grade encryption</span>
        </div>
      </div>
    </div>
  );
};
