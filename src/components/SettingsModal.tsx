import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Cpu,
  Volume2,
  Brain,
  Database,
  Code2,
  Check,
  AlertCircle,
  RotateCw,
  Sparkles,
  Zap,
  Globe,
  Sliders,
} from 'lucide-react';
import { AppSettings, AIModel, ProviderType, QuickResponseSpeed } from '../types.ts';
import { ApiService } from '../services/api.ts';
import { voiceOutput } from '../services/voice.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  models: AIModel[];
  onClearAllChats: () => void;
  onClearAllFiles: () => void;
  onExportAllData: () => void;
  initialTab?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  models,
  onClearAllChats,
  onClearAllFiles,
  onExportAllData,
  initialTab = 'general',
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Developer connection test states
  const [testingGemini, setTestingGemini] = useState(false);
  const [geminiTestResult, setGeminiTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    error?: string;
    details?: string;
  } | null>(null);

  const [testingOpenAi, setTestingOpenAi] = useState(false);
  const [openAiTestResult, setOpenAiTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    error?: string;
    details?: string;
  } | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (voiceOutput.isSupported) {
      const loadVoices = () => {
        const v = voiceOutput.getVoices();
        setVoices(v);
      };
      loadVoices();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  if (!isOpen) return null;

  const handleTestGemini = async () => {
    setTestingGemini(true);
    setGeminiTestResult(null);
    try {
      const res = await ApiService.testConnection('gemini');
      setGeminiTestResult(res);
    } catch (err: any) {
      setGeminiTestResult({
        success: false,
        error: err.message || 'Connection test failed',
      });
    } finally {
      setTestingGemini(false);
    }
  };

  const handleTestOpenAI = async () => {
    setTestingOpenAi(true);
    setOpenAiTestResult(null);
    try {
      const res = await ApiService.testConnection('openai');
      setOpenAiTestResult(res);
    } catch (err: any) {
      setOpenAiTestResult({
        success: false,
        error: err.message || 'Connection test failed',
      });
    } finally {
      setTestingOpenAi(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-indigo-400" />
            <h2 className="text-base font-bold text-white">SAFDAR AI Settings</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-3 overflow-x-auto text-xs">
          {[
            { id: 'general', label: 'General', icon: Sliders },
            { id: 'ai', label: 'AI Provider & Models', icon: Cpu },
            { id: 'voice', label: 'Voice & Speech', icon: Volume2 },
            { id: 'memory', label: 'Memory', icon: Brain },
            { id: 'data', label: 'Data Management', icon: Database },
            { id: 'developer', label: 'Developer & Test', icon: Code2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 py-3 px-3 font-medium transition-colors cursor-pointer border-b-2 shrink-0 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6 text-xs text-slate-300">
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block font-semibold text-slate-200 mb-1.5">Color Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['dark', 'light', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => onUpdateSettings({ ...settings, theme: t })}
                      className={`p-2.5 rounded-xl border text-center capitalize transition-all cursor-pointer ${
                        settings.theme === t
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1.5">Font Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => onUpdateSettings({ ...settings, fontSize: size })}
                      className={`p-2.5 rounded-xl border text-center capitalize transition-all cursor-pointer ${
                        settings.fontSize === size
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1.5">Chat Density</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['comfortable', 'compact'] as const).map((density) => (
                    <button
                      key={density}
                      type="button"
                      onClick={() => onUpdateSettings({ ...settings, chatDensity: density })}
                      className={`p-2.5 rounded-xl border text-center capitalize transition-all cursor-pointer ${
                        settings.chatDensity === density
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {density}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <p className="font-semibold text-slate-200">Enter to Send</p>
                  <p className="text-[11px] text-slate-400">
                    Pressing Enter sends message; Shift+Enter creates a new line.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enterToSend}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, enterToSend: e.target.checked })
                  }
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
              </div>
            </div>
          )}

          {/* AI PROVIDER & MODELS TAB */}
          {activeTab === 'ai' && (
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block font-semibold text-slate-200 mb-1.5">Default AI Provider</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['gemini', 'openai'] as const).map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => onUpdateSettings({ ...settings, defaultProvider: prov })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        settings.defaultProvider === prov
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="capitalize text-sm font-bold text-slate-100">
                          {prov === 'gemini' ? 'Google Gemini' : 'OpenAI'}
                        </span>
                        {settings.defaultProvider === prov && (
                          <Check size={14} className="text-indigo-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {prov === 'gemini'
                          ? 'Gemini 3.8 Flash, Pro & Search Grounding'
                          : 'Official OpenAI GPT-4o & DALL-E'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1.5">Default Model</label>
                <select
                  value={settings.defaultModel}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, defaultModel: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.provider}) - {m.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1.5">
                  Default Quick Response Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['quick', 'balanced', 'detailed'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() =>
                        onUpdateSettings({ ...settings, quickResponseMode: mode })
                      }
                      className={`p-2.5 rounded-xl border text-center capitalize transition-all cursor-pointer ${
                        settings.quickResponseMode === mode
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VOICE & SPEECH TAB */}
          {activeTab === 'voice' && (
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block font-semibold text-slate-200 mb-1.5">TTS Voice Selection</label>
                <select
                  value={settings.voiceName}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, voiceName: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Browser Default Voice</option>
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-200 mb-1.5">
                  <span>Speech Rate</span>
                  <span>{settings.voiceSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.voiceSpeed}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      voiceSpeed: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <p className="font-semibold text-slate-200">Auto-read Assistant Responses</p>
                  <p className="text-[11px] text-slate-400">
                    Automatically speak completed AI responses out loud.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoRead}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, autoRead: e.target.checked })
                  }
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
              </div>
            </div>
          )}

          {/* MEMORY TAB */}
          {activeTab === 'memory' && (
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <p className="font-semibold text-slate-200">Enable Assistant Memory</p>
                  <p className="text-[11px] text-slate-400">
                    Allows Safdar AI to remember explicit user preferences and details.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.memoryEnabled}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, memoryEnabled: e.target.checked })
                  }
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
              </div>
              <p className="text-slate-400 text-xs">
                To view, add, or delete individual memories, visit the dedicated Memory tab in the sidebar.
              </p>
            </div>
          )}

          {/* DATA MANAGEMENT TAB */}
          {activeTab === 'data' && (
            <div className="space-y-4 max-w-xl">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="font-semibold text-slate-200">Export & Backup</h3>
                <p className="text-slate-400 text-xs">
                  Download a complete backup containing all conversations, projects, assistants, files metadata, and custom settings as JSON.
                </p>
                <button
                  type="button"
                  onClick={onExportAllData}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs cursor-pointer transition-colors"
                >
                  Export All Data (.json)
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-rose-900/40 space-y-3">
                <h3 className="font-semibold text-rose-300">Danger Zone</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete all conversations?')) {
                        onClearAllChats();
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-200 text-xs cursor-pointer"
                  >
                    Clear All Chats
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Are you sure you want to clear stored files?')) {
                        onClearAllFiles();
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-200 text-xs cursor-pointer"
                  >
                    Clear All Files
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DEVELOPER & CONNECTION TEST TAB */}
          {activeTab === 'developer' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  <Cpu size={16} className="text-indigo-400" />
                  <span>Real AI Provider Connection Test</span>
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  Sends an authentic test ping through the Safdar AI backend to verify live credentials and measure round-trip API latency.
                </p>
              </div>

              {/* Gemini Test Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-200">Google Gemini API</h4>
                    <p className="text-[11px] text-slate-500">
                      Primary AI provider (uses GEMINI_API_KEY)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestGemini}
                    disabled={testingGemini}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {testingGemini ? (
                      <>
                        <RotateCw size={13} className="animate-spin" />
                        <span>Testing...</span>
                      </>
                    ) : (
                      <span>Test Gemini Connection</span>
                    )}
                  </button>
                </div>

                {geminiTestResult && (
                  <div
                    className={`p-3 rounded-lg border text-xs ${
                      geminiTestResult.success
                        ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-200'
                        : 'bg-rose-950/40 border-rose-800/50 text-rose-200'
                    }`}
                  >
                    {geminiTestResult.success ? (
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-emerald-400 shrink-0" />
                        <div>
                          <p className="font-bold">✓ Gemini API Connected</p>
                          <p className="text-[11px] text-emerald-300/80">
                            Latency: {geminiTestResult.latencyMs}ms &bull; Model: gemini-3.8-flash
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">✕ Gemini API Connection Failed</p>
                          <p className="text-[11px] text-rose-300 mt-0.5">
                            {geminiTestResult.error}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Ensure GEMINI_API_KEY is configured in AI Studio Secrets or .env file.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* OpenAI Test Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-200">OpenAI API</h4>
                    <p className="text-[11px] text-slate-500">
                      Secondary provider (uses OPENAI_API_KEY)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestOpenAI}
                    disabled={testingOpenAi}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {testingOpenAi ? (
                      <>
                        <RotateCw size={13} className="animate-spin" />
                        <span>Testing...</span>
                      </>
                    ) : (
                      <span>Test OpenAI Connection</span>
                    )}
                  </button>
                </div>

                {openAiTestResult && (
                  <div
                    className={`p-3 rounded-lg border text-xs ${
                      openAiTestResult.success
                        ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-200'
                        : 'bg-rose-950/40 border-rose-800/50 text-rose-200'
                    }`}
                  >
                    {openAiTestResult.success ? (
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-emerald-400 shrink-0" />
                        <div>
                          <p className="font-bold">✓ OpenAI API Connected</p>
                          <p className="text-[11px] text-emerald-300/80">
                            Latency: {openAiTestResult.latencyMs}ms
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">✕ OpenAI API Connection Failed</p>
                          <p className="text-[11px] text-rose-300 mt-0.5">
                            {openAiTestResult.error}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
