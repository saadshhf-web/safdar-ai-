import React, { useState } from 'react';
import {
  Files,
  Upload,
  Search,
  Trash2,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  ArrowRight,
  Eye,
  X,
} from 'lucide-react';
import { StoredFile } from '../types.ts';

interface FilesLibraryViewProps {
  files: StoredFile[];
  onSaveFile: (file: StoredFile) => void;
  onDeleteFile: (id: string) => void;
  onClearFiles: () => void;
  onAskAboutFile: (file: StoredFile) => void;
}

export const FilesLibraryView: React.FC<FilesLibraryViewProps> = ({
  files,
  onSaveFile,
  onDeleteFile,
  onClearFiles,
  onAskAboutFile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [previewFile, setPreviewFile] = useState<StoredFile | null>(null);

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded) return;

    for (const file of Array.from(uploaded)) {
      const reader = new FileReader();
      const isImg = file.type.startsWith('image/');

      if (isImg) {
        reader.onload = () => {
          onSaveFile({
            id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: reader.result as string,
            createdAt: Date.now(),
          });
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = () => {
          onSaveFile({
            id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            name: file.name,
            size: file.size,
            type: file.type,
            textContent: typeof reader.result === 'string' ? reader.result.slice(0, 100000) : undefined,
            createdAt: Date.now(),
          });
        };
        reader.readAsText(file);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 md:p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Files className="text-sky-400" size={24} />
            <h1 className="text-xl md:text-2xl font-bold text-white">Files Library</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Store documents, images, and codebase files to query and analyze in conversations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {files.length > 0 && (
            <button
              type="button"
              onClick={onClearFiles}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs transition-colors cursor-pointer"
            >
              Clear All
            </button>
          )}

          <label className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs shadow-md shadow-sky-600/20 cursor-pointer transition-all">
            <Upload size={14} />
            <span>Upload Files</span>
            <input
              type="file"
              multiple
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Search */}
      <div className="py-4">
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search uploaded files..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/60"
          />
        </div>
      </div>

      {/* Files Grid */}
      <div className="flex-1">
        {filteredFiles.length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-500">
            <Files size={32} className="mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="font-semibold text-slate-300">No files stored</p>
            <p className="mt-1 text-slate-600">
              Upload documents or code files to keep them ready for AI queries and comparisons.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="group p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon size={18} className="text-pink-400" />
                      ) : (
                        <FileText size={18} className="text-sky-400" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteFile(file.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <h3 className="font-semibold text-xs text-slate-200 truncate" title={file.name}>
                    {file.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {(file.size / 1024).toFixed(1)} KB &bull;{' '}
                    {new Date(file.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setPreviewFile(file)}
                    className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Eye size={12} />
                    <span>Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onAskAboutFile(file)}
                    className="flex-1 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <MessageSquare size={12} />
                    <span>Ask AI</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="font-bold text-sm text-slate-100 truncate">{previewFile.name}</span>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-slate-300 bg-slate-950">
              {previewFile.dataUrl ? (
                <img
                  src={previewFile.dataUrl}
                  alt={previewFile.name}
                  className="max-h-96 mx-auto rounded-lg"
                />
              ) : (
                <pre className="whitespace-pre-wrap">{previewFile.textContent || 'No preview available.'}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
