import {
  Conversation,
  Project,
  CustomAssistant,
  CanvasDocument,
  StoredFile,
  GeneratedImage,
  UserMemory,
  AppSettings,
} from '../types.ts';

const STORAGE_KEYS = {
  CONVERSATIONS: 'safdar_ai_conversations',
  PROJECTS: 'safdar_ai_projects',
  ASSISTANTS: 'safdar_ai_assistants',
  CANVAS_DOCS: 'safdar_ai_canvas_docs',
  FILES: 'safdar_ai_files',
  IMAGES: 'safdar_ai_images',
  MEMORIES: 'safdar_ai_memories',
  SETTINGS: 'safdar_ai_settings',
};

export const defaultSettings: AppSettings = {
  theme: 'dark',
  defaultProvider: 'gemini',
  defaultModel: 'gemini-3.8-flash',
  quickResponseMode: 'balanced',
  fontSize: 'medium',
  chatDensity: 'comfortable',
  enterToSend: true,
  voiceName: '',
  voiceSpeed: 1.0,
  autoRead: false,
  memoryEnabled: false,
};

// Safe storage helper with JSON serialization
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

export const StorageService = {
  // Settings
  getSettings(): AppSettings {
    return getStored<AppSettings>(STORAGE_KEYS.SETTINGS, defaultSettings);
  },
  saveSettings(settings: AppSettings): void {
    setStored(STORAGE_KEYS.SETTINGS, settings);
  },

  // Conversations (starts completely empty)
  getConversations(): Conversation[] {
    return getStored<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
  },
  saveConversations(conversations: Conversation[]): void {
    setStored(STORAGE_KEYS.CONVERSATIONS, conversations);
  },
  getConversation(id: string): Conversation | undefined {
    const all = this.getConversations();
    return all.find((c) => c.id === id);
  },
  saveConversation(conv: Conversation): void {
    const all = this.getConversations();
    const index = all.findIndex((c) => c.id === conv.id);
    if (index >= 0) {
      all[index] = conv;
    } else {
      all.unshift(conv);
    }
    this.saveConversations(all);
  },
  deleteConversation(id: string): void {
    const all = this.getConversations().filter((c) => c.id !== id);
    this.saveConversations(all);
  },
  clearAllConversations(): void {
    setStored(STORAGE_KEYS.CONVERSATIONS, []);
  },

  // Projects (starts completely empty)
  getProjects(): Project[] {
    return getStored<Project[]>(STORAGE_KEYS.PROJECTS, []);
  },
  saveProjects(projects: Project[]): void {
    setStored(STORAGE_KEYS.PROJECTS, projects);
  },
  saveProject(project: Project): void {
    const all = this.getProjects();
    const index = all.findIndex((p) => p.id === project.id);
    if (index >= 0) {
      all[index] = project;
    } else {
      all.unshift(project);
    }
    this.saveProjects(all);
  },
  deleteProject(id: string): void {
    const all = this.getProjects().filter((p) => p.id !== id);
    this.saveProjects(all);
  },

  // Custom Assistants (starts completely empty)
  getAssistants(): CustomAssistant[] {
    return getStored<CustomAssistant[]>(STORAGE_KEYS.ASSISTANTS, []);
  },
  saveAssistants(assistants: CustomAssistant[]): void {
    setStored(STORAGE_KEYS.ASSISTANTS, assistants);
  },
  saveAssistant(assistant: CustomAssistant): void {
    const all = this.getAssistants();
    const index = all.findIndex((a) => a.id === assistant.id);
    if (index >= 0) {
      all[index] = assistant;
    } else {
      all.unshift(assistant);
    }
    this.saveAssistants(all);
  },
  deleteAssistant(id: string): void {
    const all = this.getAssistants().filter((a) => a.id !== id);
    this.saveAssistants(all);
  },

  // Canvas Documents (starts completely empty)
  getCanvasDocs(): CanvasDocument[] {
    return getStored<CanvasDocument[]>(STORAGE_KEYS.CANVAS_DOCS, []);
  },
  saveCanvasDocs(docs: CanvasDocument[]): void {
    setStored(STORAGE_KEYS.CANVAS_DOCS, docs);
  },
  saveCanvasDoc(doc: CanvasDocument): void {
    const all = this.getCanvasDocs();
    const index = all.findIndex((d) => d.id === doc.id);
    if (index >= 0) {
      all[index] = doc;
    } else {
      all.unshift(doc);
    }
    this.saveCanvasDocs(all);
  },
  deleteCanvasDoc(id: string): void {
    const all = this.getCanvasDocs().filter((d) => d.id !== id);
    this.saveCanvasDocs(all);
  },

  // Files Library (starts completely empty)
  getFiles(): StoredFile[] {
    return getStored<StoredFile[]>(STORAGE_KEYS.FILES, []);
  },
  saveFiles(files: StoredFile[]): void {
    setStored(STORAGE_KEYS.FILES, files);
  },
  saveFile(file: StoredFile): void {
    const all = this.getFiles();
    all.unshift(file);
    this.saveFiles(all);
  },
  deleteFile(id: string): void {
    const all = this.getFiles().filter((f) => f.id !== id);
    this.saveFiles(all);
  },
  clearAllFiles(): void {
    setStored(STORAGE_KEYS.FILES, []);
  },

  // Generated Images (starts completely empty)
  getImages(): GeneratedImage[] {
    return getStored<GeneratedImage[]>(STORAGE_KEYS.IMAGES, []);
  },
  saveImages(images: GeneratedImage[]): void {
    setStored(STORAGE_KEYS.IMAGES, images);
  },
  saveImage(img: GeneratedImage): void {
    const all = this.getImages();
    all.unshift(img);
    this.saveImages(all);
  },
  deleteImage(id: string): void {
    const all = this.getImages().filter((img) => img.id !== id);
    this.saveImages(all);
  },

  // Memories (starts completely empty)
  getMemories(): UserMemory[] {
    return getStored<UserMemory[]>(STORAGE_KEYS.MEMORIES, []);
  },
  saveMemories(memories: UserMemory[]): void {
    setStored(STORAGE_KEYS.MEMORIES, memories);
  },
  addMemory(content: string, category = 'General'): UserMemory {
    const all = this.getMemories();
    const memory: UserMemory = {
      id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      content,
      category,
      createdAt: Date.now(),
    };
    all.unshift(memory);
    this.saveMemories(all);
    return memory;
  },
  deleteMemory(id: string): void {
    const all = this.getMemories().filter((m) => m.id !== id);
    this.saveMemories(all);
  },
  clearAllMemories(): void {
    setStored(STORAGE_KEYS.MEMORIES, []);
  },

  // Export full user database as JSON
  exportAllData(): string {
    const payload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      conversations: this.getConversations(),
      projects: this.getProjects(),
      assistants: this.getAssistants(),
      canvasDocs: this.getCanvasDocs(),
      files: this.getFiles(),
      images: this.getImages(),
      memories: this.getMemories(),
      settings: this.getSettings(),
    };
    return JSON.stringify(payload, null, 2);
  },
};
