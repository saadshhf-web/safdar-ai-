/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Conversation,
  ChatMessage,
  AIModel,
  AttachmentItem,
  ResponseMode,
  QuickResponseSpeed,
  ProviderType,
  Project,
  CustomAssistant,
  CanvasDocument,
  StoredFile,
  GeneratedImage,
  UserMemory,
  AppSettings,
} from './types.ts';
import { StorageService, defaultSettings } from './services/storage.ts';
import { ApiService } from './services/api.ts';
import { voiceOutput } from './services/voice.ts';

import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { ChatView } from './components/ChatView.tsx';
import { ImageStudioView } from './components/ImageStudioView.tsx';
import { CanvasView } from './components/CanvasView.tsx';
import { ProjectsView } from './components/ProjectsView.tsx';
import { AssistantsView } from './components/AssistantsView.tsx';
import { DataAnalysisView } from './components/DataAnalysisView.tsx';
import { FilesLibraryView } from './components/FilesLibraryView.tsx';
import { MemoryView } from './components/MemoryView.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { ShareModal } from './components/ShareModal.tsx';
import { ExportModal } from './components/ExportModal.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';

export default function App() {
  // Persistence state
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    StorageService.getConversations()
  );
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>(() => StorageService.getProjects());
  const [assistants, setAssistants] = useState<CustomAssistant[]>(() => StorageService.getAssistants());
  const [canvasDocs, setCanvasDocs] = useState<CanvasDocument[]>(() => StorageService.getCanvasDocs());
  const [files, setFiles] = useState<StoredFile[]>(() => StorageService.getFiles());
  const [images, setImages] = useState<GeneratedImage[]>(() => StorageService.getImages());
  const [memories, setMemories] = useState<UserMemory[]>(() => StorageService.getMemories());
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());

  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('safdar_ai_username') || 'Saad';
  });

  // UI Views & Modals
  const [activeView, setActiveView] = useState<string>('chat');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState('general');
  const [shareOpen, setShareOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // AI & Models state
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('gemini-3.8-flash');
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>('gemini');
  const [activeMode, setActiveMode] = useState<ResponseMode>('balanced');
  const [quickResponseSpeed, setQuickResponseSpeed] = useState<QuickResponseSpeed>('balanced');
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // Active streaming controller
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load backend configuration & models on mount
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const config = await ApiService.getConfigStatus();
        if (isMounted) {
          setSelectedProvider(
            (config.defaultProvider as ProviderType) || settings.defaultProvider || 'gemini'
          );
        }

        const modelList = await ApiService.getModels();
        if (isMounted && modelList.length > 0) {
          setModels(modelList);
          const found = modelList.find((m) => m.id === settings.defaultModel);
          if (found) {
            setSelectedModelId(found.id);
          } else {
            setSelectedModelId(modelList[0].id);
          }
        }

        // Test initial connection silently
        const testRes = await ApiService.testConnection(
          (config.defaultProvider as ProviderType) || 'gemini'
        );
        if (isMounted) {
          setIsConnected(testRes.success);
        }
      } catch (err) {
        console.warn('Initialization error:', err);
        if (isMounted) setIsConnected(false);
      }
    }

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // Keyboard shortcuts listener: Ctrl+Shift+Q for Quick response, etc.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + Q
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        cycleQuickResponse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickResponseSpeed]);

  const cycleQuickResponse = () => {
    const nextSpeed: Record<QuickResponseSpeed, QuickResponseSpeed> = {
      balanced: 'quick',
      quick: 'detailed',
      detailed: 'balanced',
    };
    const next = nextSpeed[quickResponseSpeed];
    setQuickResponseSpeed(next);
  };

  // Active conversation getter
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  // Create New Chat
  const handleNewChat = (customTitle?: string, initialMode: ResponseMode = 'balanced') => {
    const newConv: Conversation = {
      id: 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: customTitle || 'New Chat',
      messages: [],
      model: selectedModelId,
      provider: selectedProvider,
      mode: initialMode,
      quickResponse: quickResponseSpeed === 'quick',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updated = [newConv, ...conversations];
    setConversations(updated);
    StorageService.saveConversations(updated);
    setActiveConversationId(newConv.id);
    setActiveView('chat');
    setActiveMode(initialMode);
  };

  // Send message flow (Streaming Real External AI API)
  const handleSendMessage = async (
    text: string,
    attachments: AttachmentItem[] = [],
    enableSearch = false
  ) => {
    if (!text.trim() && attachments.length === 0) return;

    let targetConv = activeConversation;
    let currentList = [...conversations];

    // If no active conversation, create one now
    if (!targetConv) {
      const firstTitle = text ? text.slice(0, 36) : 'Attachment Query';
      const newConv: Conversation = {
        id: 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        title: firstTitle,
        messages: [],
        model: selectedModelId,
        provider: selectedProvider,
        mode: activeMode,
        quickResponse: quickResponseSpeed === 'quick',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      currentList = [newConv, ...conversations];
      targetConv = newConv;
      setActiveConversationId(newConv.id);
    }

    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments,
    };

    const assistantMessageId = 'msg_' + (Date.now() + 1);
    const placeholderAssistant: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now() + 1,
      model: selectedModelId,
      provider: selectedProvider,
      isStreaming: true,
    };

    // Update state with user message and placeholder assistant message
    const updatedMessages = [...targetConv.messages, userMessage, placeholderAssistant];
    const updatedConv: Conversation = {
      ...targetConv,
      title:
        targetConv.title === 'New Chat' && text
          ? text.slice(0, 36) + (text.length > 36 ? '...' : '')
          : targetConv.title,
      messages: updatedMessages,
      updatedAt: Date.now(),
    };

    const updatedConversations = currentList.map((c) =>
      c.id === updatedConv.id ? updatedConv : c
    );
    setConversations(updatedConversations);
    StorageService.saveConversations(updatedConversations);

    // Prepare context: user memories, project instructions, assistant instructions
    let systemInstruction = '';

    if (settings.memoryEnabled && memories.length > 0) {
      systemInstruction += `\nUser Preferences and Memory:\n` +
        memories.map((m) => `- ${m.content}`).join('\n');
    }

    if (targetConv.projectId) {
      const proj = projects.find((p) => p.id === targetConv!.projectId);
      if (proj && proj.instructions) {
        systemInstruction += `\nProject Context (${proj.name}):\n${proj.instructions}`;
      }
    }

    if (targetConv.assistantId) {
      const ast = assistants.find((a) => a.id === targetConv!.assistantId);
      if (ast && ast.instructions) {
        systemInstruction += `\nAssistant Persona (${ast.name}):\n${ast.instructions}`;
      }
    }

    // Start stream
    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    let accumulatedText = '';

    await ApiService.streamChat(
      {
        message: text,
        conversation: targetConv.messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        provider: selectedProvider,
        model: selectedModelId,
        quickResponse: quickResponseSpeed === 'quick',
        mode: activeMode,
        webSearch: enableSearch,
        attachments,
        systemInstruction,
      },
      {
        onChunk: (chunk) => {
          accumulatedText += chunk;
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== targetConv!.id) return c;
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, content: accumulatedText, isStreaming: true }
                    : m
                ),
              };
            })
          );
        },
        onDone: (fullText, sources) => {
          setIsStreaming(false);
          const finalContent = fullText || accumulatedText;
          setConversations((prev) => {
            const finalConvs = prev.map((c) => {
              if (c.id !== targetConv!.id) return c;
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMessageId
                    ? {
                        ...m,
                        content: finalContent,
                        isStreaming: false,
                        sources: sources.length > 0 ? sources : undefined,
                      }
                    : m
                ),
              };
            });
            StorageService.saveConversations(finalConvs);
            return finalConvs;
          });

          // Auto-read voice if enabled
          if (settings.autoRead && finalContent) {
            voiceOutput.speak(finalContent, {
              rate: settings.voiceSpeed,
              voiceName: settings.voiceName,
            });
          }
        },
        onError: (errMsg) => {
          setIsStreaming(false);
          setConversations((prev) => {
            const finalConvs = prev.map((c) => {
              if (c.id !== targetConv!.id) return c;
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMessageId
                    ? {
                        ...m,
                        content: accumulatedText,
                        isStreaming: false,
                        error: errMsg,
                      }
                    : m
                ),
              };
            });
            StorageService.saveConversations(finalConvs);
            return finalConvs;
          });
        },
      },
      abortControllerRef.current.signal
    );
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  const handleRegenerateMessage = (msgId: string) => {
    if (!activeConversation) return;
    const msgIdx = activeConversation.messages.findIndex((m) => m.id === msgId);
    if (msgIdx <= 0) return;

    // Previous user message
    const previousUserMsg = activeConversation.messages[msgIdx - 1];
    if (previousUserMsg.role === 'user') {
      // Remove failed or old assistant message
      const pruned = activeConversation.messages.slice(0, msgIdx);
      const updatedConv = { ...activeConversation, messages: pruned };
      const updatedList = conversations.map((c) => (c.id === updatedConv.id ? updatedConv : c));
      setConversations(updatedList);
      StorageService.saveConversations(updatedList);

      // Resend
      handleSendMessage(previousUserMsg.content, previousUserMsg.attachments, webSearchEnabled);
    }
  };

  const handleEditMessage = (msgId: string, newContent: string) => {
    if (!activeConversation) return;
    const msgIdx = activeConversation.messages.findIndex((m) => m.id === msgId);
    if (msgIdx < 0) return;

    // Truncate messages after edited user message
    const pruned = activeConversation.messages.slice(0, msgIdx);
    const updatedConv = { ...activeConversation, messages: pruned };
    const updatedList = conversations.map((c) => (c.id === updatedConv.id ? updatedConv : c));
    setConversations(updatedList);
    StorageService.saveConversations(updatedList);

    handleSendMessage(newContent, [], webSearchEnabled);
  };

  const handleToggleLike = (msgId: string, isLike: boolean) => {
    if (!activeConversation) return;
    const updatedMessages = activeConversation.messages.map((m) => {
      if (m.id !== msgId) return m;
      return isLike
        ? { ...m, liked: !m.liked, disliked: false }
        : { ...m, disliked: !m.disliked, liked: false };
    });
    const updatedConv = { ...activeConversation, messages: updatedMessages };
    const updatedList = conversations.map((c) => (c.id === updatedConv.id ? updatedConv : c));
    setConversations(updatedList);
    StorageService.saveConversations(updatedList);
  };

  // Conversation Management
  const handleRenameConversation = (id: string, newTitle: string) => {
    const updated = conversations.map((c) => (c.id === id ? { ...c, title: newTitle } : c));
    setConversations(updated);
    StorageService.saveConversations(updated);
  };

  const handleTogglePin = (id: string) => {
    const updated = conversations.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c));
    setConversations(updated);
    StorageService.saveConversations(updated);
  };

  const handleToggleArchive = (id: string) => {
    const updated = conversations.map((c) =>
      c.id === id ? { ...c, isArchived: !c.isArchived } : c
    );
    setConversations(updated);
    StorageService.saveConversations(updated);
  };

  const handleDeleteConversation = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    StorageService.saveConversations(updated);
    if (activeConversationId === id) {
      setActiveConversationId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleClearCurrentChat = () => {
    if (!activeConversation) return;
    const updatedConv = { ...activeConversation, messages: [] };
    const updated = conversations.map((c) => (c.id === updatedConv.id ? updatedConv : c));
    setConversations(updated);
    StorageService.saveConversations(updated);
  };

  const handleClearAllChats = () => {
    setConversations([]);
    setActiveConversationId(null);
    StorageService.clearAllConversations();
  };

  // Projects Integration
  const handleSaveProject = (proj: Project) => {
    StorageService.saveProject(proj);
    setProjects(StorageService.getProjects());
  };

  const handleDeleteProject = (id: string) => {
    StorageService.deleteProject(id);
    setProjects(StorageService.getProjects());
  };

  const handleStartProjectChat = (proj: Project) => {
    const newConv: Conversation = {
      id: 'conv_' + Date.now(),
      title: `${proj.name} Chat`,
      messages: [],
      model: selectedModelId,
      provider: selectedProvider,
      mode: 'coding',
      quickResponse: false,
      projectId: proj.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newConv, ...conversations];
    setConversations(updated);
    StorageService.saveConversations(updated);
    setActiveConversationId(newConv.id);
    setActiveView('chat');
  };

  // Custom Assistants Integration
  const handleSaveAssistant = (ast: CustomAssistant) => {
    StorageService.saveAssistant(ast);
    setAssistants(StorageService.getAssistants());
  };

  const handleDeleteAssistant = (id: string) => {
    StorageService.deleteAssistant(id);
    setAssistants(StorageService.getAssistants());
  };

  const handleChatWithAssistant = (ast: CustomAssistant) => {
    const newConv: Conversation = {
      id: 'conv_' + Date.now(),
      title: `${ast.name} Chat`,
      messages: [],
      model: ast.model || selectedModelId,
      provider: selectedProvider,
      mode: 'balanced',
      quickResponse: false,
      assistantId: ast.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newConv, ...conversations];
    setConversations(updated);
    StorageService.saveConversations(updated);
    setActiveConversationId(newConv.id);
    setActiveView('chat');
  };

  // Canvas Integration
  const handleSaveCanvasDoc = (doc: CanvasDocument) => {
    StorageService.saveCanvasDoc(doc);
    setCanvasDocs(StorageService.getCanvasDocs());
  };

  const handleDeleteCanvasDoc = (id: string) => {
    StorageService.deleteCanvasDoc(id);
    setCanvasDocs(StorageService.getCanvasDocs());
  };

  // Files & Images Integration
  const handleSaveFile = (file: StoredFile) => {
    StorageService.saveFile(file);
    setFiles(StorageService.getFiles());
  };

  const handleDeleteFile = (id: string) => {
    StorageService.deleteFile(id);
    setFiles(StorageService.getFiles());
  };

  const handleClearFiles = () => {
    StorageService.clearAllFiles();
    setFiles([]);
  };

  const handleAskAboutFile = (file: StoredFile) => {
    setActiveView('chat');
    handleNewChat(`Query: ${file.name}`);
    const prompt = file.textContent
      ? `Analyze this file "${file.name}":\n\n${file.textContent.slice(0, 4000)}`
      : `Analyze this attached file: ${file.name}`;
    const attachments = file.dataUrl
      ? [
          {
            id: 'att_' + Date.now(),
            name: file.name,
            size: file.size,
            mimeType: file.type,
            base64: file.dataUrl,
          },
        ]
      : [];
    handleSendMessage(prompt, attachments, false);
  };

  const handleSaveImage = (img: GeneratedImage) => {
    StorageService.saveImage(img);
    setImages(StorageService.getImages());
  };

  const handleDeleteImage = (id: string) => {
    StorageService.deleteImage(id);
    setImages(StorageService.getImages());
  };

  // Memories Integration
  const handleAddMemory = (content: string, category?: string) => {
    StorageService.addMemory(content, category);
    setMemories(StorageService.getMemories());
  };

  const handleDeleteMemory = (id: string) => {
    StorageService.deleteMemory(id);
    setMemories(StorageService.getMemories());
  };

  const handleClearMemories = () => {
    StorageService.clearAllMemories();
    setMemories([]);
  };

  // Settings update
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    setSelectedProvider(newSettings.defaultProvider);
    setSelectedModelId(newSettings.defaultModel);
    setQuickResponseSpeed(newSettings.quickResponseMode);
  };

  // Print layout action (Requirement 33)
  const handlePrint = () => {
    window.print();
  };

  // Export full JSON database
  const handleExportAllData = () => {
    const jsonStr = StorageService.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safdar_ai_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden ${
        settings.theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => {
          setActiveConversationId(id);
          setActiveView('chat');
        }}
        onNewChat={() => handleNewChat()}
        onRenameConversation={handleRenameConversation}
        onTogglePin={handleTogglePin}
        onToggleArchive={handleToggleArchive}
        onDeleteConversation={handleDeleteConversation}
        activeView={activeView}
        onSelectView={(view) => setActiveView(view)}
        isOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenSettings={() => {
          setSettingsInitialTab('general');
          setSettingsOpen(true);
        }}
        onOpenProfile={() => setProfileOpen(true)}
        userName={userName}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          models={models}
          selectedModelId={selectedModelId}
          onSelectModel={(id) => setSelectedModelId(id)}
          selectedProvider={selectedProvider}
          onChangeProvider={(p) => setSelectedProvider(p)}
          quickResponseSpeed={quickResponseSpeed}
          onCycleQuickResponse={cycleQuickResponse}
          isConnected={isConnected}
          onOpenConnectionTest={() => {
            setSettingsInitialTab('developer');
            setSettingsOpen(true);
          }}
          onPrint={handlePrint}
          onExport={() => setExportOpen(true)}
          onShare={() => setShareOpen(true)}
          onClearChat={handleClearCurrentChat}
          onOpenSettings={() => {
            setSettingsInitialTab('general');
            setSettingsOpen(true);
          }}
          hasActiveMessages={Boolean(activeConversation && activeConversation.messages.length > 0)}
          conversationTitle={activeConversation?.title}
        />

        {/* View Switcher */}
        {activeView === 'chat' && (
          <ChatView
            conversation={activeConversation}
            onSendMessage={handleSendMessage}
            isStreaming={isStreaming}
            onStopStreaming={handleStopStreaming}
            onRegenerateMessage={handleRegenerateMessage}
            onEditMessage={handleEditMessage}
            onLikeMessage={(id) => handleToggleLike(id, true)}
            onDislikeMessage={(id) => handleToggleLike(id, false)}
            webSearchEnabled={webSearchEnabled}
            onToggleWebSearch={() => setWebSearchEnabled(!webSearchEnabled)}
            activeMode={activeMode}
            onChangeMode={(m) => setActiveMode(m)}
            quickResponseSpeed={quickResponseSpeed}
            onCycleQuickResponse={cycleQuickResponse}
            enterToSend={settings.enterToSend}
            onOpenSettings={() => {
              setSettingsInitialTab('developer');
              setSettingsOpen(true);
            }}
            onOpenCanvas={() => setActiveView('canvas')}
            onOpenImageStudio={() => setActiveView('image-studio')}
            onOpenDataAnalysis={() => setActiveView('data-analysis')}
            onOpenFileUpload={() => setActiveView('files')}
          />
        )}

        {activeView === 'canvas' && (
          <CanvasView
            canvasDocs={canvasDocs}
            onSaveDoc={handleSaveCanvasDoc}
            onDeleteDoc={handleDeleteCanvasDoc}
            selectedProvider={selectedProvider}
          />
        )}

        {activeView === 'image-studio' && (
          <ImageStudioView
            images={images}
            onSaveImage={handleSaveImage}
            onDeleteImage={handleDeleteImage}
            selectedProvider={selectedProvider}
          />
        )}

        {activeView === 'projects' && (
          <ProjectsView
            projects={projects}
            onSaveProject={handleSaveProject}
            onDeleteProject={handleDeleteProject}
            onStartProjectChat={handleStartProjectChat}
          />
        )}

        {activeView === 'assistants' && (
          <AssistantsView
            assistants={assistants}
            onSaveAssistant={handleSaveAssistant}
            onDeleteAssistant={handleDeleteAssistant}
            onChatWithAssistant={handleChatWithAssistant}
          />
        )}

        {activeView === 'data-analysis' && (
          <DataAnalysisView
            onAskAboutData={(summary, prompt) => {
              setActiveView('chat');
              handleNewChat('Data Intelligence Report');
              handleSendMessage(`${prompt}\n\n${summary}`, [], false);
            }}
            selectedProvider={selectedProvider}
          />
        )}

        {activeView === 'files' && (
          <FilesLibraryView
            files={files}
            onSaveFile={handleSaveFile}
            onDeleteFile={handleDeleteFile}
            onClearFiles={handleClearFiles}
            onAskAboutFile={handleAskAboutFile}
          />
        )}

        {activeView === 'memory' && (
          <MemoryView
            memories={memories}
            memoryEnabled={settings.memoryEnabled}
            onToggleMemory={(enabled) =>
              handleUpdateSettings({ ...settings, memoryEnabled: enabled })
            }
            onAddMemory={handleAddMemory}
            onDeleteMemory={handleDeleteMemory}
            onClearMemories={handleClearMemories}
          />
        )}
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        models={models}
        onClearAllChats={handleClearAllChats}
        onClearAllFiles={handleClearFiles}
        onExportAllData={handleExportAllData}
        initialTab={settingsInitialTab}
      />

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        conversation={activeConversation}
      />

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        conversation={activeConversation}
        onPrint={handlePrint}
      />

      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        userName={userName}
        onUpdateUserName={(newName) => {
          setUserName(newName);
          localStorage.setItem('safdar_ai_username', newName);
        }}
        totalChatsCount={conversations.length}
        totalProjectsCount={projects.length}
      />
    </div>
  );
}
