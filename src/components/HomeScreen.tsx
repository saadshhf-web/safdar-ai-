import React from 'react';
import {
  PenTool,
  Code2,
  BookOpen,
  FileSearch,
  Image as ImageIcon,
  Globe,
  FileEdit,
  BarChart3,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ResponseMode } from '../types.ts';

interface HomeScreenProps {
  onSelectSuggestion: (prompt: string, mode?: ResponseMode, enableSearch?: boolean) => void;
  onOpenCanvas: () => void;
  onOpenImageStudio: () => void;
  onOpenDataAnalysis: () => void;
  onOpenFileUpload: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectSuggestion,
  onOpenCanvas,
  onOpenImageStudio,
  onOpenDataAnalysis,
  onOpenFileUpload,
}) => {
  const suggestions = [
    {
      title: 'Write something',
      desc: 'Craft an email, professional report, essay, or creative story',
      icon: PenTool,
      gradient: 'from-blue-500/20 to-indigo-500/10 text-blue-400',
      action: () =>
        onSelectSuggestion(
          'Write a professional project update email to the executive stakeholders summarizing our recent milestones and upcoming deliverables.',
          'writing'
        ),
    },
    {
      title: 'Help me code',
      desc: 'Generate, debug, refactor, or explain complex code and algorithms',
      icon: Code2,
      gradient: 'from-emerald-500/20 to-teal-500/10 text-emerald-400',
      action: () =>
        onSelectSuggestion(
          'Write a clean, modular Python calculator with support for basic arithmetic, exponents, input validation, and unit tests.',
          'coding'
        ),
    },
    {
      title: 'Explain a topic',
      desc: 'Step-by-step breakdown with intuitive real-world analogies',
      icon: BookOpen,
      gradient: 'from-amber-500/20 to-orange-500/10 text-amber-400',
      action: () =>
        onSelectSuggestion(
          'Explain how transformer neural networks and attention mechanisms work in simple terms with everyday analogies.',
          'study'
        ),
    },
    {
      title: 'Analyze a file',
      desc: 'Extract insights, summarize PDFs, read documents and screenshots',
      icon: FileSearch,
      gradient: 'from-purple-500/20 to-violet-500/10 text-purple-400',
      action: onOpenFileUpload,
    },
    {
      title: 'Generate an image',
      desc: 'Create photorealistic or artistic images with natural prompts',
      icon: ImageIcon,
      gradient: 'from-pink-500/20 to-rose-500/10 text-pink-400',
      action: onOpenImageStudio,
    },
    {
      title: 'Search the web',
      desc: 'Retrieve verified real-time sources, news, citations, and summaries',
      icon: Globe,
      gradient: 'from-cyan-500/20 to-blue-500/10 text-cyan-400',
      action: () =>
        onSelectSuggestion(
          'What are the latest technological breakthroughs in quantum computing and AI hardware this year?',
          'balanced',
          true
        ),
    },
    {
      title: 'Create a document',
      desc: 'Open interactive Canvas workspace to draft and edit side-by-side',
      icon: FileEdit,
      gradient: 'from-indigo-500/20 to-sky-500/10 text-indigo-400',
      action: onOpenCanvas,
    },
    {
      title: 'Analyze data',
      desc: 'Upload CSV, Excel, or JSON datasets for statistics and cleaning',
      icon: BarChart3,
      gradient: 'from-violet-500/20 to-indigo-500/10 text-violet-400',
      action: onOpenDataAnalysis,
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 max-w-4xl mx-auto text-center">
      {/* Brand Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 text-xs font-medium mb-6 shadow-sm">
        <Sparkles size={14} className="text-indigo-400" />
        <span>SAFDAR AI &bull; Next-Gen Assistant Engine</span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3 bg-gradient-to-r from-slate-100 via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
        Welcome to Safdar AI
      </h1>

      {/* Tagline */}
      <p className="text-sm md:text-base text-slate-400 max-w-2xl mb-8 leading-relaxed">
        Your intelligent AI assistant for learning, creating, coding, research and everyday tasks.
      </p>

      {/* Suggestion Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full text-left">
        {suggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={item.action}
              className="group p-4 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/40 transition-all text-left flex flex-col justify-between hover:shadow-lg hover:shadow-indigo-500/5 cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center border border-slate-700/50 group-hover:scale-105 transition-transform`}
                >
                  <Icon size={18} />
                </div>
                <Zap
                  size={12}
                  className="text-slate-600 group-hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"
                />
              </div>

              <div>
                <h3 className="font-semibold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
