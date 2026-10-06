import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Trash2,
  Edit2,
  FileText,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Save,
  Check,
} from 'lucide-react';
import { Project } from '../types.ts';

interface ProjectsViewProps {
  projects: Project[];
  onSaveProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onStartProjectChat: (project: Project) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onSaveProject,
  onDeleteProject,
  onStartProjectChat,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    projects.length > 0 ? projects[0].id : null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newInstructions, setNewInstructions] = useState('');

  // Selected project state
  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const [editNotes, setEditNotes] = useState(selectedProject?.notes || '');
  const [editInstructions, setEditInstructions] = useState(selectedProject?.instructions || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newProject: Project = {
      id: 'proj_' + Date.now(),
      name: newName.trim(),
      description: newDesc.trim() || 'Custom development project',
      instructions: newInstructions.trim() || 'Provide context-aware engineering solutions for this project.',
      notes: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onSaveProject(newProject);
    setSelectedProjectId(newProject.id);
    setEditNotes(newProject.notes);
    setEditInstructions(newProject.instructions);
    setIsCreating(false);
    setNewName('');
    setNewDesc('');
    setNewInstructions('');
  };

  const handleUpdate = () => {
    if (!selectedProject) return;
    const updated: Project = {
      ...selectedProject,
      notes: editNotes,
      instructions: editInstructions,
      updatedAt: Date.now(),
    };
    onSaveProject(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-slate-950">
      {/* Projects List Column */}
      <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0">
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <FolderKanban size={15} className="text-amber-400" />
            <span>Projects ({projects.length})</span>
          </div>

          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600/30 text-amber-300 hover:bg-amber-600/50 text-xs font-medium cursor-pointer"
          >
            <Plus size={13} />
            <span>New</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {projects.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              <FolderKanban size={28} className="mx-auto mb-2 opacity-30 text-slate-400" />
              <p>No projects yet.</p>
              <p className="text-[11px] mt-1 text-slate-600">
                Create a project like "Medical Store Software" to organize project chats, files & notes.
              </p>
            </div>
          ) : (
            projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => {
                  setSelectedProjectId(proj.id);
                  setEditNotes(proj.notes);
                  setEditInstructions(proj.instructions);
                  setIsCreating(false);
                }}
                className={`group flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                  proj.id === selectedProjectId && !isCreating
                    ? 'bg-amber-600/20 text-amber-200 border border-amber-500/30 font-medium'
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <div className="truncate flex-1 mr-2">
                  <p className="font-medium text-slate-200 truncate">{proj.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{proj.description}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProject(proj.id);
                    if (selectedProjectId === proj.id) setSelectedProjectId(null);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Detail / Form Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 md:p-6 bg-slate-950">
        {isCreating ? (
          <div className="max-w-2xl mx-auto w-full space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderKanban size={20} className="text-amber-400" />
              <span>Create New Project</span>
            </h2>
            <form onSubmit={handleCreate} className="space-y-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Medical Store Software, E-Commerce Platform, Exam Prep"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Short summary of this project goals"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Project System Instructions (Knowledge & Rules)
                </label>
                <textarea
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="e.g. Always design database schemas in PostgreSQL; include pharmacy inventory logic, batch expiry tracking, and customer invoicing."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/60 resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-md shadow-amber-600/20"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        ) : selectedProject ? (
          <div className="max-w-4xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                  <FolderKanban size={22} className="text-amber-400" />
                  <span>{selectedProject.name}</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">{selectedProject.description}</p>
              </div>

              <button
                type="button"
                onClick={() => onStartProjectChat(selectedProject)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs shadow-md shadow-amber-600/20 transition-all cursor-pointer"
              >
                <MessageSquare size={14} />
                <span>Chat in Project</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Project Instructions */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Project AI Instructions
              </label>
              <textarea
                value={editInstructions}
                onChange={(e) => setEditInstructions(e.target.value)}
                rows={4}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60 resize-none leading-relaxed"
                placeholder="Custom context and requirements sent with every chat in this project..."
              />
            </div>

            {/* Notes & Documentation */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Project Notes & Roadmap
              </label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={6}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60 resize-none leading-relaxed"
                placeholder="Track architecture decisions, database models, credentials placeholders, and to-do lists here..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleUpdate}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
              >
                {savedSuccess ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span className="text-emerald-400">Saved</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
            <FolderKanban size={36} className="mb-2 opacity-30 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-300">Select or Create a Project</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Organize complex applications, clients, or study topics with dedicated project memory.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
