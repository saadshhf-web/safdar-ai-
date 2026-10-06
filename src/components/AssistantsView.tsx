import React, { useState } from 'react';
import {
  Bot,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  MessageSquare,
  ArrowRight,
  Code2,
  GraduationCap,
  Briefcase,
  BookOpen,
} from 'lucide-react';
import { CustomAssistant } from '../types.ts';

interface AssistantsViewProps {
  assistants: CustomAssistant[];
  onSaveAssistant: (assistant: CustomAssistant) => void;
  onDeleteAssistant: (id: string) => void;
  onChatWithAssistant: (assistant: CustomAssistant) => void;
}

export const AssistantsView: React.FC<AssistantsViewProps> = ({
  assistants,
  onSaveAssistant,
  onDeleteAssistant,
  onChatWithAssistant,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [personality, setPersonality] = useState('Professional & Patient');
  const [category, setCategory] = useState('Coding');
  const [model, setModel] = useState('gemini-3.8-flash');
  const [avatar, setAvatar] = useState('🤖');

  // Quick preset templates user can click to bootstrap
  const templates = [
    {
      name: 'Coding Assistant',
      desc: 'Expert in full-stack architecture, debugging, clean code & performance',
      instructions: 'You are an elite software architect and senior engineer. Provide production-ready, clean, well-documented code with error handling.',
      avatar: '💻',
      category: 'Coding',
      personality: 'Direct, analytical, precise',
    },
    {
      name: 'English Teacher',
      desc: 'Master of grammar, IELTS preparation, vocabulary & writing feedback',
      instructions: 'You are an encouraging and articulate English teacher. Help the user improve grammar, sentence structure, pronunciation, and essay writing.',
      avatar: '📚',
      category: 'Education',
      personality: 'Friendly, encouraging, methodical',
    },
    {
      name: 'Business & Startup Advisor',
      desc: 'Specialist in pitch decks, business plans, financials & marketing strategy',
      instructions: 'You are a veteran venture consultant. Provide actionable business strategy, pricing models, market analysis, and financial clarity.',
      avatar: '💼',
      category: 'Business',
      personality: 'Strategic, persuasive, pragmatic',
    },
    {
      name: 'Study & Exam Mentor',
      desc: 'Breaks complex STEM concepts into simple bite-sized explanations & quizzes',
      instructions: 'You are an academic mentor. Teach step-by-step, generate flashcards, practice questions, and verify comprehension.',
      avatar: '🎓',
      category: 'Education',
      personality: 'Patient, intuitive, engaging',
    },
  ];

  const handleStartCreate = (template?: typeof templates[0]) => {
    if (template) {
      setName(template.name);
      setDescription(template.desc);
      setInstructions(template.instructions);
      setPersonality(template.personality);
      setCategory(template.category);
      setAvatar(template.avatar);
    } else {
      setName('');
      setDescription('');
      setInstructions('');
      setPersonality('Professional & Helpful');
      setCategory('General');
      setAvatar('🤖');
    }
    setEditingId(null);
    setIsEditing(true);
  };

  const handleStartEdit = (assistant: CustomAssistant) => {
    setEditingId(assistant.id);
    setName(assistant.name);
    setDescription(assistant.description);
    setInstructions(assistant.instructions);
    setPersonality(assistant.personality);
    setCategory(assistant.category);
    setAvatar(assistant.avatar);
    setModel(assistant.model);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const assistant: CustomAssistant = {
      id: editingId || 'ast_' + Date.now(),
      name: name.trim(),
      description: description.trim(),
      instructions: instructions.trim(),
      personality,
      category,
      model,
      avatar,
      tools: ['chat', 'reasoning'],
    };

    onSaveAssistant(assistant);
    setIsEditing(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 md:p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="text-emerald-400" size={24} />
            <h1 className="text-xl md:text-2xl font-bold text-white">Custom AI Assistants</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Build specialized personas with dedicated instructions, personalities, and system prompts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleStartCreate()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus size={14} />
          <span>New Assistant</span>
        </button>
      </div>

      {isEditing ? (
        /* Create / Edit Form */
        <div className="py-6 max-w-2xl mx-auto w-full">
          <form onSubmit={handleSave} className="space-y-4 bg-slate-900/60 p-5 md:p-6 rounded-2xl border border-slate-800">
            <h2 className="text-base font-bold text-white">
              {editingId ? 'Edit Assistant' : 'Create New Assistant'}
            </h2>

            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Avatar</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full text-center text-xl bg-slate-950 border border-slate-800 rounded-xl p-2 focus:outline-none"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Coding Mentor, English Teacher"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/70"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Short Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this assistant specializes in..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/70"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                System Instructions (Prompt & Knowledge)
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Give precise behavior rules, persona guidelines, and expert knowledge..."
                rows={5}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/70 resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Personality</label>
                <input
                  type="text"
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  placeholder="e.g. Friendly, Analytical, Strict"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/70"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none"
                >
                  <option value="Coding">Coding & Architecture</option>
                  <option value="Education">Education & Learning</option>
                  <option value="Business">Business & Strategy</option>
                  <option value="Writing">Writing & Creative</option>
                  <option value="General">General Purpose</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-600/20"
              >
                Save Assistant
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Assistants List & Presets */
        <div className="py-6 space-y-8">
          {/* User Assistants */}
          <div>
            <h2 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-1.5">
              <span>My Assistants ({assistants.length})</span>
            </h2>

            {assistants.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-500">
                <Bot size={28} className="mx-auto mb-2 opacity-30 text-slate-400" />
                <p>No custom assistants created yet.</p>
                <p className="mt-1 text-slate-600">
                  Click a starter template below or create your own custom AI assistant.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {assistants.map((ast) => (
                  <div
                    key={ast.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl p-2 rounded-xl bg-slate-950 border border-slate-800">
                          {ast.avatar || '🤖'}
                        </span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(ast)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteAssistant(ast.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-semibold text-sm text-slate-100">{ast.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{ast.description}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 uppercase font-mono">
                        {ast.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => onChatWithAssistant(ast)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm cursor-pointer"
                      >
                        <MessageSquare size={12} />
                        <span>Chat</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Starter Presets */}
          <div>
            <h2 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-400" />
              <span>Recommended Templates (1-Click Setup)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {templates.map((tpl, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-2xl">{tpl.avatar}</span>
                    <h3 className="font-semibold text-sm text-slate-100 mt-2">{tpl.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tpl.desc}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartCreate(tpl)}
                    className="mt-4 w-full py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600/30 text-slate-200 hover:text-emerald-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
