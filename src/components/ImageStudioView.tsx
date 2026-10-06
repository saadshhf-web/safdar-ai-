import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Download,
  Trash2,
  Maximize2,
  X,
  Upload,
  Sliders,
  Image as ImageIcon,
  RotateCw,
  AlertCircle,
  Wand2,
} from 'lucide-react';
import { GeneratedImage, ProviderType } from '../types.ts';
import { ApiService } from '../services/api.ts';

interface ImageStudioViewProps {
  images: GeneratedImage[];
  onSaveImage: (img: GeneratedImage) => void;
  onDeleteImage: (id: string) => void;
  selectedProvider: ProviderType;
}

export const ImageStudioView: React.FC<ImageStudioViewProps> = ({
  images,
  onSaveImage,
  onDeleteImage,
  selectedProvider,
}) => {
  const [tab, setTab] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [style, setStyle] = useState('photorealistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit image state
  const [editImageBase64, setEditImageBase64] = useState<string | null>(null);
  const [editInstruction, setEditInstruction] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Fullscreen zoom modal
  const [zoomedImage, setZoomedImage] = useState<GeneratedImage | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const result = await ApiService.generateImage({
        prompt: prompt.trim(),
        aspectRatio,
        style,
        provider: selectedProvider,
      });

      const newImg: GeneratedImage = {
        id: 'img_' + Date.now(),
        prompt: result.prompt,
        url: result.imageUrl,
        aspectRatio: result.aspectRatio,
        style,
        provider: result.provider,
        model: result.model,
        createdAt: Date.now(),
      };

      onSaveImage(newImg);
      setPrompt('');
    } catch (err: any) {
      console.error('Image gen error:', err);
      setError(err.message || 'Image generation is not configured or failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setEditImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editImageBase64 || !editInstruction.trim()) return;

    setIsEditing(true);
    setError(null);

    try {
      const result = await ApiService.editImage({
        imageBase64: editImageBase64,
        instruction: editInstruction.trim(),
      });

      const newImg: GeneratedImage = {
        id: 'img_' + Date.now(),
        prompt: editInstruction,
        url: result.imageUrl,
        aspectRatio: '1:1',
        style: 'edited',
        provider: selectedProvider,
        model: 'gemini-3.1-flash-lite-image',
        createdAt: Date.now(),
      };

      onSaveImage(newImg);
      setEditInstruction('');
    } catch (err: any) {
      setError(err.message || 'Image editing failed.');
    } finally {
      setIsEditing(false);
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'safdar_ai_image'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 md:p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="text-pink-400" size={24} />
            <h1 className="text-xl md:text-2xl font-bold text-white">Image Studio</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-pink-950/60 text-pink-300 border border-pink-800/40 font-semibold">
              REAL AI GENERATION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate photorealistic visuals or edit existing images using Gemini & OpenAI models.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setTab('generate')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              tab === 'generate'
                ? 'bg-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Generate
          </button>
          <button
            type="button"
            onClick={() => setTab('edit')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              tab === 'edit'
                ? 'bg-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Edit & Transform
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="my-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-start gap-2.5">
          <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{error}</p>
            <p className="text-rose-300/80 mt-0.5">
              Make sure GEMINI_API_KEY or OPENAI_API_KEY is configured in your environment.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Form Area */}
      <div className="py-6">
        {tab === 'generate' ? (
          <form onSubmit={handleGenerate} className="space-y-4 rounded-2xl bg-slate-900/60 p-4 md:p-6 border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Prompt Description
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Create a realistic 4K mountain landscape at golden hour with reflection on a crystal lake..."
                rows={3}
                className="w-full bg-slate-950 rounded-xl p-3 text-sm text-slate-100 border border-slate-800 focus:outline-none focus:border-pink-500/70 resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Aspect Ratio */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Square (1:1)', val: '1:1' },
                    { label: 'Landscape (16:9)', val: '16:9' },
                    { label: 'Portrait (9:16)', val: '9:16' },
                    { label: 'Photo (4:3)', val: '4:3' },
                  ].map((ratio) => (
                    <button
                      key={ratio.val}
                      type="button"
                      onClick={() => setAspectRatio(ratio.val)}
                      className={`p-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                        aspectRatio === ratio.val
                          ? 'bg-pink-950/60 text-pink-300 border-pink-700/60'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Visual Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500/70"
                >
                  <option value="photorealistic">Photorealistic & Cinematic</option>
                  <option value="digital-art">Modern Digital Art</option>
                  <option value="anime">Anime & Manga Style</option>
                  <option value="3d-render">3D Render & Octane</option>
                  <option value="oil-painting">Classic Oil Painting</option>
                  <option value="minimalist">Minimalist Vector & Flat</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white shadow-lg transition-all cursor-pointer ${
                  isGenerating || !prompt.trim()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-pink-600/20'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RotateCw size={14} className="animate-spin" />
                    <span>Generating Image...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Generate with AI</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Edit Tab */
          <form onSubmit={handleEditSubmit} className="space-y-4 rounded-2xl bg-slate-900/60 p-4 md:p-6 border border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Upload Base Image
                </label>
                {editImageBase64 ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-800 max-h-56">
                    <img
                      src={editImageBase64}
                      alt="Source"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setEditImageBase64(null)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/80 text-slate-200 hover:bg-slate-900"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-800 hover:border-pink-500/50 rounded-xl cursor-pointer bg-slate-950 transition-colors">
                    <Upload size={24} className="text-slate-500 mb-2" />
                    <span className="text-xs text-slate-400">Click to upload photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Editing Instruction
                </label>
                <textarea
                  value={editInstruction}
                  onChange={(e) => setEditInstruction(e.target.value)}
                  placeholder="e.g. Remove the background and replace it with a modern neon cyber cityscape; adjust lighting to purple hue..."
                  rows={4}
                  className="w-full bg-slate-950 rounded-xl p-3 text-sm text-slate-100 border border-slate-800 focus:outline-none focus:border-pink-500/70 resize-none leading-relaxed"
                />

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    'Remove background',
                    'Make lighting cinematic',
                    'Add a red sports car',
                    'Turn into oil painting',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEditInstruction(preset)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isEditing || !editImageBase64 || !editInstruction.trim()}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white shadow-lg transition-all cursor-pointer ${
                  isEditing || !editImageBase64 || !editInstruction.trim()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-pink-600/20'
                }`}
              >
                {isEditing ? (
                  <>
                    <RotateCw size={14} className="animate-spin" />
                    <span>Transforming Image...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={14} />
                    <span>Apply Transformation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Gallery of Generated Images */}
      <div className="mt-4 flex-1">
        <h2 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
          <ImageIcon size={16} className="text-pink-400" />
          <span>Image Gallery ({images.length})</span>
        </h2>

        {images.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-500 text-xs">
            <Palette size={32} className="mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="font-semibold text-slate-400">No images created yet</p>
            <p className="mt-1 text-slate-600">
              Type a prompt above to generate your first AI artwork.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-pink-500/40 transition-all shadow-md"
              >
                <div className="aspect-square bg-slate-950 overflow-hidden">
                  <img
                    src={img.url}
                    alt={img.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-2.5">
                  <p className="text-xs text-slate-200 font-medium truncate" title={img.prompt}>
                    {img.prompt}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {img.aspectRatio} &bull; {img.style} &bull; {img.model}
                  </p>
                </div>

                {/* Hover overlay actions */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/80 backdrop-blur-md rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setZoomedImage(img)}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                    title="Fullscreen"
                  >
                    <Maximize2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadImage(img.url, img.prompt)}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                    title="Download"
                  >
                    <Download size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteImage(img.id)}
                    className="p-1.5 rounded hover:bg-slate-800 text-rose-400 hover:text-rose-200"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={zoomedImage.url}
              alt={zoomedImage.prompt}
              className="max-h-[75vh] w-auto rounded-xl object-contain shadow-2xl border border-slate-800"
            />
            <div className="mt-3 flex items-center justify-between w-full px-2 text-xs text-slate-300">
              <span className="truncate max-w-md">{zoomedImage.prompt}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => downloadImage(zoomedImage.url, zoomedImage.prompt)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 flex items-center gap-1"
                >
                  <Download size={13} />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => setZoomedImage(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
