# SAFDAR AI

> **"Your Intelligent AI Assistant"**

SAFDAR AI is a modern, fast, reliable, and secure full-stack AI platform built from scratch. It connects to the official Google Gemini API (with models like `gemini-3.8-flash`, `gemini-3.1-pro-preview`, and `gemini-3.1-flash-lite-image`) and official OpenAI API providers through a protected backend architecture.

---

## Table of Contents

1. [Key Features](#key-features)
2. [Architecture Overview](#architecture-overview)
3. [Installation & Development Setup](#installation--development-setup)
4. [Gemini API Configuration](#gemini-api-configuration)
5. [OpenAI Provider Configuration](#openai-provider-configuration)
6. [Image Generation & Editing Configuration](#image-generation--editing-configuration)
7. [Web Search Grounding](#web-search-grounding)
8. [Voice Input & Output Configuration](#voice-input--output-configuration)
9. [Database & Storage Architecture](#database--storage-architecture)
10. [Authentication & Multi-User Architecture](#authentication--multi-user-architecture)
11. [Production Deployment](#production-deployment)
12. [Security Guidelines](#security-guidelines)
13. [Troubleshooting & Connection Testing](#troubleshooting--connection-testing)

---

## 1. Key Features

- **Real External AI Execution**: Every prompt (e.g. *"Saad name meaning"*, *"What is HTML?"*, *"Write a Python calculator"*) queries the configured Gemini or OpenAI backend and streams authentic answers.
- **⚡ Quick Response Mode**: Switch between `⚡ Quick`, `⚖️ Balanced`, and `🧠 Detailed` (keyboard shortcut: `Ctrl + Shift + Q`).
- **Real-Time Streaming**: Uses Server-Sent Events (SSE) to render answers smoothly chunk-by-chunk.
- **Multimodal Vision & File Analysis**: Upload images, PDFs, CSV, JSON, and source code files for deep document interrogation.
- **🎨 Image Studio**: Generate high-fidelity visual art and edit existing images with natural language instructions.
- **🌐 Real Web Search Grounding**: Connects with live search tools to retrieve fresh web data with verifiable citations and links.
- **📝 Interactive Canvas**: Edit documents and code side-by-side with instant AI rewriting, debugging, and grammar corrections.
- **📁 Projects Workspace**: Create project containers (e.g. *"Medical Store Software"*) with dedicated rules, notes, files, and chats.
- **🤖 Custom AI Assistants**: Build specialized personas (e.g. Coding Assistant, English Teacher, Business Advisor, Study Mentor).
- **📊 Server-Side Data Analysis**: Upload CSV/JSON to compute column statistics, detect missing values, and review distributions safely.
- **🎙️ Real Voice Input & Output**: Speech-to-text microphone input and customizable text-to-speech voice readback with speed adjustments.
- **🧠 User-Controlled Memory**: Explicitly save preferences and knowledge across sessions with clear deletion controls.
- **Export & Print**: Clean print stylesheets (`window.print()`) and one-click exports to Markdown (`.md`), Plain Text (`.txt`), and JSON (`.json`).
- **Clean Empty Start**: Zero dummy messages or fake pre-populated records.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SAFDAR AI Client (React)                 │
│  - Plus Jakarta Sans & JetBrains Mono Typography            │
│  - Responsive Sidebar, Chat View, Canvas, Image Studio      │
│  - Voice Input (Web Speech API) & Voice Output (TTS)        │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / SSE (/api/chat, /api/image/generate)
┌──────────────────────────────▼──────────────────────────────┐
│                    SAFDAR AI Backend (Node/Express)         │
│  - Server-side environment secrets (GEMINI_API_KEY)         │
│  - Server-Sent Events (SSE) streaming engine                │
│  - Request validation, rate safeguards & prompt injection   │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│       Google Gemini API      │ │          OpenAI API          │
│   @google/genai SDK v2.4+    │ │   Official HTTP Endpoints    │
│  - gemini-3.8-flash          │ │  - gpt-4o / gpt-4o-mini      │
│  - gemini-3.1-pro-preview    │ │  - dall-e-3                  │
│  - gemini-3.1-flash-image    │ └──────────────────────────────┘
└──────────────────────────────┘
```

---

## 3. Installation & Development Setup

### Prerequisites
- Node.js 18.x or 20.x
- npm or pnpm

### Clone & Install
```bash
git clone <repo-url>
cd safdar-ai
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your keys:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
OPENAI_API_KEY="optional_openai_key"
DEFAULT_AI_PROVIDER="gemini"
PORT=3000
```

### Start Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:3000` with the Express API and Vite middlewares attached.

---

## 4. Gemini API Configuration

1. Obtain an API key from Google AI Studio ([aistudio.google.com](https://aistudio.google.com)).
2. Set the key in your `.env` file or AI Studio Secrets under `GEMINI_API_KEY`.
3. SAFDAR AI loads this key inside `server.ts` using the modern `@google/genai` TypeScript SDK:
```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});
```

---

## 5. OpenAI Provider Configuration

To enable OpenAI as a provider:
1. Provide `OPENAI_API_KEY` in `.env`.
2. Set `DEFAULT_AI_PROVIDER="openai"` if you want OpenAI as the default.
3. Users can switch providers on the fly in **Settings > AI Provider & Models**.

---

## 6. Image Generation & Editing Configuration

SAFDAR AI includes an Image Studio supporting:
- Prompt-based generation (with aspect ratio selection: `1:1`, `16:9`, `9:16`, `4:3`).
- Multimodal Image-to-Image editing (e.g. *"Remove background"*, *"Adjust lighting to neon"*).
- The backend delegates requests to `gemini-3.1-flash-lite-image` or OpenAI `dall-e-3`.

---

## 7. Web Search Grounding

When the **Web Search** button is toggled ON:
- The backend enables Google Search grounding (`tools: [{ googleSearch: {} }]`).
- Search results are synthesized by the model with authentic source citations returned to the user interface.

---

## 8. Voice Input & Output Configuration

- **Voice Input**: Uses the native Web Speech API `webkitSpeechRecognition`. Click the microphone button in the input dock to dictate prompts in real time.
- **Voice Output**: Uses `window.speechSynthesis`. Click the speaker icon on any assistant message to listen. Speech speed and voices can be configured in **Settings > Voice & Speech**.

---

## 9. Database & Storage Architecture

SAFDAR AI includes a decoupled storage abstraction in `src/services/storage.ts`.
- **Local Mode**: Uses `localStorage` with JSON serialization for fast, zero-configuration local development.
- **Production Cloud Mode**: Ready for drop-in migration to Firebase Firestore or Supabase by implementing the same `StorageService` interface.

---

## 10. Authentication & Multi-User Architecture

The system features an integrated user profile and session abstraction (`src/components/ProfileModal.tsx`). To enable cloud multi-user synchronization:
- Wire Firebase Authentication or Supabase Auth in `src/services/auth.ts`.
- Associate conversation records with `user.uid`.

---

## 11. Production Deployment

### Build Application
```bash
npm run build
```
This compiles the React SPA bundle to `/dist`.

### Start Full-Stack Server
```bash
npm start
```
The Express server in `server.ts` serves static assets from `/dist` and mounts all `/api/*` routes.

---

## 12. Security Guidelines

1. **Server-Side Credentials**: API keys (`GEMINI_API_KEY`, `OPENAI_API_KEY`) are loaded on the server side only. Never expose them to client JavaScript or localStorage.
2. **Input Validation**: All incoming requests to `/api/chat` and `/api/analyze-data` are sanitized and validated.
3. **Arbitrary Code Execution Prevention**: The data analysis engine computes statistics and parses tabular records safely on the server without `eval()` or unsanitized code execution.
4. **Clean Print Output**: Print sheets exclude sidebar controls, form buttons, and private session metadata.

---

## 13. Troubleshooting & Connection Testing

To verify your AI connection at any time:
1. Click the **Check API** / **Connected** status indicator in the top navbar.
2. Click **[Test Gemini Connection]** or **[Test OpenAI Connection]**.
3. The server will execute an authentic test ping and display round-trip latency (e.g. `✓ Gemini API Connected - 140ms`) or provide error guidance if the key is missing or invalid.
