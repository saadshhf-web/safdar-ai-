import React, { useState } from 'react';
import {
  Menu,
  Sparkles,
  Zap,
  Printer,
  Download,
  Share2,
  Trash2,
  Settings,
  ChevronDown,
  Activity,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { AIModel, ProviderType, QuickResponseSpeed } from '../types.ts';

interface NavbarProps {
  onToggleSidebar: () => void;
  models: AIModel[];
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  selectedProvider: ProviderType;
  onChangeProvider: (provider: ProviderType) => void;
  quickResponseSpeed: QuickResponseSpeed;
  onCycleQuickResponse: () => void;
  isConnected: boolean | null;
  onOpenConnectionTest: () => void;
  onPrint: () => void;
  onExport: () => void;
  onShare: () => void;
  onClearChat: () => void;
  onOpenSettings: () => void;
  hasActiveMessages: boolean;
  conversationTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  models,
  selectedModelId,
  onSelectModel,
  selectedProvider,
  onChangeProvider,
  quickResponseSpeed,
  onCycleQuickResponse,
  isConnected,
  onOpenConnectionTest,
  onPrint,
  onExport,
  onShare,
  onClearChat,
  onOpenSettings,
  hasActiveMessages,
  conversationTitle,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const currentModel = models.find((m) => m.id === selectedModelId) || models[0];

  return (
    <header className="h-14 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-3 md:px-4 flex items-center justify-between z-30">
      {/* Left side: Hamburger + Title / Model Selector */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 cursor-pointer"
        >
          <Menu size={18} />
        </button>

        {/* Model Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-xs text-slate-200 transition-colors cursor-pointer shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="font-semibold">{currentModel ? currentModel.name : 'Gemini 3.8 Flash'}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              ({selectedProvider})
            </span>
            <ChevronDown size={13} className="text-slate-400" />
          </button>

          {modelDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setModelDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-1.5 w-72 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2 z-50 space-y-1">
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Available AI Models
                </div>
                {models.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      onSelectModel(model.id);
                      onChangeProvider(model.provider);
                      setModelDropdownOpen(false);
                    }}
                    className={`w-full flex flex-col text-left p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      model.id === selectedModelId
                        ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-100">{model.name}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {model.provider}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {model.description}
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {conversationTitle && (
          <span className="hidden lg:inline text-xs text-slate-400 border-l border-slate-800 pl-3 max-w-[200px] truncate">
            {conversationTitle}
          </span>
        )}
      </div>

      {/* Center: Quick Response Switcher Pill */}
      <div className="hidden sm:flex items-center gap-1 bg-slate-900/90 border border-slate-800/80 rounded-xl p-1 text-xs">
        <button
          type="button"
          onClick={onCycleQuickResponse}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            quickResponseSpeed === 'quick'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
              : quickResponseSpeed === 'balanced'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
          }`}
          title="Toggle speed: Quick / Balanced / Detailed (Ctrl+Shift+Q)"
        >
          <Zap
            size={13}
            className={
              quickResponseSpeed === 'quick'
                ? 'text-amber-400'
                : quickResponseSpeed === 'balanced'
                ? 'text-indigo-400'
                : 'text-purple-400'
            }
          />
          <span className="capitalize">{quickResponseSpeed} Response</span>
          <span className="text-[10px] text-slate-400 ml-1 hidden md:inline">Ctrl+Shift+Q</span>
        </button>
      </div>

      {/* Right side: Connection Status & Chat Actions */}
      <div className="flex items-center gap-1.5">
        {/* Connection Status Button */}
        <button
          type="button"
          onClick={onOpenConnectionTest}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-colors cursor-pointer"
          title="Test AI API Connection"
        >
          {isConnected === true ? (
            <>
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span className="text-emerald-400 hidden sm:inline">Connected</span>
            </>
          ) : isConnected === false ? (
            <>
              <AlertCircle size={12} className="text-rose-400" />
              <span className="text-rose-400 hidden sm:inline">Offline</span>
            </>
          ) : (
            <>
              <Activity size={12} className="text-indigo-400" />
              <span className="hidden sm:inline">Check API</span>
            </>
          )}
        </button>

        {/* Action icons (only enabled when messages present) */}
        {hasActiveMessages && (
          <>
            <button
              type="button"
              onClick={onPrint}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              title="Print conversation layout"
            >
              <Printer size={16} />
            </button>
            <button
              type="button"
              onClick={onExport}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              title="Export conversation (Markdown / Text / JSON)"
            >
              <Download size={16} />
            </button>
            <button
              type="button"
              onClick={onShare}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              title="Share conversation"
            >
              <Share2 size={16} />
            </button>
            <button
              type="button"
              onClick={onClearChat}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer"
              title="Clear current messages"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}

        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
};
