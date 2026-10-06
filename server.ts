import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser with high limit for image and document uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google GenAI client if key is available
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const getOpenAIKey = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'MY_OPENAI_API_KEY') {
    return null;
  }
  return apiKey;
};

// ----------------------------------------------------
// API: Configuration Status
// ----------------------------------------------------
app.get('/api/config-status', (req, res) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const hasGemini = Boolean(geminiKey && geminiKey !== 'MY_GEMINI_API_KEY');

  const openAiKey = process.env.OPENAI_API_KEY;
  const hasOpenAi = Boolean(openAiKey && openAiKey !== 'MY_OPENAI_API_KEY');

  const defaultProvider = process.env.DEFAULT_AI_PROVIDER || (hasGemini ? 'gemini' : hasOpenAi ? 'openai' : 'gemini');

  res.json({
    geminiConfigured: hasGemini,
    openAiConfigured: hasOpenAi,
    defaultProvider,
    searchConfigured: hasGemini, // Native Google Search grounding works with Gemini 3
    imageConfigured: hasGemini || hasOpenAi,
    environment: process.env.NODE_ENV || 'development',
  });
});

// ----------------------------------------------------
// API: Available Models
// ----------------------------------------------------
app.get('/api/models', (req, res) => {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'MY_OPENAI_API_KEY');

  const models = [
    {
      id: 'gemini-3.8-flash',
      name: 'Gemini 3.8 Flash',
      provider: 'gemini',
      description: 'Ultra-fast, highly intelligent, multimodal reasoning & search grounding',
      capabilities: ['chat', 'vision', 'documents', 'web-search', 'quick-response'],
      isDefault: true,
      enabled: hasGemini,
    },
    {
      id: 'gemini-3.1-pro-preview',
      name: 'Gemini 3.1 Pro',
      provider: 'gemini',
      description: 'Deep reasoning, advanced coding, complex STEM, and large document analysis',
      capabilities: ['chat', 'vision', 'documents', 'code-expert'],
      isDefault: false,
      enabled: hasGemini,
    },
    {
      id: 'gemini-3.1-flash-lite',
      name: 'Gemini 3.1 Flash Lite',
      provider: 'gemini',
      description: 'Maximum speed, optimized for quick concise answers and lightweight chat',
      capabilities: ['chat', 'quick-response'],
      isDefault: false,
      enabled: hasGemini,
    },
    {
      id: 'gemini-3.1-flash-image',
      name: 'Gemini Image Studio',
      provider: 'gemini',
      description: 'High-fidelity image generation and editing with natural prompts',
      capabilities: ['image-generation', 'image-editing'],
      isDefault: false,
      enabled: hasGemini,
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'openai',
      description: 'Affordable, fast, intelligent multimodal model by OpenAI',
      capabilities: ['chat', 'vision', 'quick-response'],
      isDefault: false,
      enabled: hasOpenAi,
    },
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      description: 'Flagship omni-model by OpenAI with high accuracy and coding capabilities',
      capabilities: ['chat', 'vision', 'documents', 'code-expert'],
      isDefault: false,
      enabled: hasOpenAi,
    },
  ];

  res.json({ models });
});

// ----------------------------------------------------
// API: Test Connection
// ----------------------------------------------------
app.post('/api/test-connection', async (req, res) => {
  const { provider = 'gemini' } = req.body;
  const startTime = Date.now();

  if (provider === 'gemini') {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(400).json({
        success: false,
        error: 'Gemini API is not configured. Missing GEMINI_API_KEY environment variable in AI Studio Secrets.',
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Ping test. Reply with exactly one word: "Connected"',
      });
      const latencyMs = Date.now() - startTime;
      return res.json({
        success: true,
        provider: 'gemini',
        model: 'gemini-3.8-flash',
        latencyMs,
        response: response.text?.trim() || 'Connected',
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        provider: 'gemini',
        error: err.message || 'Gemini API connection error',
        details: err.status || err.code || 'UNKNOWN_ERROR',
      });
    }
  }

  if (provider === 'openai') {
    const apiKey = getOpenAIKey();
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'OpenAI API is not configured. Missing OPENAI_API_KEY in environment variables.',
      });
    }

    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Ping test. Reply with "Connected"' }],
          max_tokens: 10,
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `OpenAI returned HTTP ${resp.status}`);
      }

      const data = await resp.json();
      const latencyMs = Date.now() - startTime;
      return res.json({
        success: true,
        provider: 'openai',
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        latencyMs,
        response: data.choices?.[0]?.message?.content?.trim() || 'Connected',
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        provider: 'openai',
        error: err.message || 'OpenAI API connection error',
      });
    }
  }

  return res.status(400).json({ success: false, error: `Unsupported provider: ${provider}` });
});

// ----------------------------------------------------
// API: Chat (SSE Streaming & Regular JSON)
// ----------------------------------------------------
app.post('/api/chat', async (req, res) => {
  const {
    message,
    conversation = [],
    provider: requestedProvider,
    model: requestedModel,
    quickResponse = false,
    mode = 'balanced',
    webSearch = false,
    attachments = [],
    systemInstruction: customInstruction = '',
    targetLanguage,
    tone = 'professional',
    stream = true,
  } = req.body;

  if (!message && (!attachments || attachments.length === 0)) {
    return res.status(400).json({ error: 'Message or attachment is required.' });
  }

  // Determine provider
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'MY_OPENAI_API_KEY');

  let provider = requestedProvider;
  if (!provider) {
    provider = process.env.DEFAULT_AI_PROVIDER || (hasGemini ? 'gemini' : 'openai');
  }

  // Build system instructions based on mode and settings
  let systemPrompt = `You are SAFDAR AI, "Your Intelligent AI Assistant" — a modern, fast, professional, and reliable AI assistant platform.
Always identify as SAFDAR AI. Provide accurate, helpful, well-structured, clear answers formatted with clean Markdown. Use code blocks with language specifiers when writing code.`;

  if (quickResponse || mode === 'quick') {
    systemPrompt += `\nCRITICAL QUICK RESPONSE MODE ACTIVATED: Keep your response extremely direct, concise, and to the point. State key facts or answer immediately without unnecessary preamble, boilerplate, or filler phrases.`;
  } else if (mode === 'detailed') {
    systemPrompt += `\nDETAILED MODE: Provide thorough, in-depth explanations with background concepts, examples, nuances, and step-by-step guidance.`;
  } else if (mode === 'coding') {
    systemPrompt += `\nCODING SPECIALIST MODE: Provide clean, modern, production-grade code. Include comments where necessary. Explain design patterns and handle edge cases, bugs, and performance optimization cleanly.`;
  } else if (mode === 'study') {
    systemPrompt += `\nSTUDY & TEACHING MODE: Act as a master educator. Break down complex topics into clear steps, provide intuitive real-world analogies, include interactive questions or flashcard summaries, and verify comprehension.`;
  } else if (mode === 'writing') {
    systemPrompt += `\nPROFESSIONAL WRITER MODE: Adopt a ${tone} tone. Craft eloquent, captivating, and polished text with flawless grammar, strong narrative flow, and purposeful structure.`;
  } else if (mode === 'translation') {
    systemPrompt += `\nTRANSLATION SPECIALIST MODE: Translate accurately into ${targetLanguage || 'the requested language'}. Preserve cultural nuance, idioms, tone, and formatting. If translating between English and Urdu / Roman Urdu / Arabic / Pashto / Punjabi, ensure natural fluency.`;
  }

  if (customInstruction) {
    systemPrompt += `\n\nUser Custom Persona / Instructions:\n${customInstruction}`;
  }

  // ==========================================
  // GEMINI PROVIDER
  // ==========================================
  if (provider === 'gemini') {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(400).json({
        error: 'Gemini API is not configured.',
        details: 'Missing GEMINI_API_KEY in environment variables. Please check the Secrets panel in AI Studio.',
      });
    }

    const modelName = requestedModel || (quickResponse ? 'gemini-3.8-flash' : 'gemini-3.8-flash');

    try {
      // Build contents array for @google/genai
      const contents: any[] = [];

      // Add conversation history (up to last 16 turns to maintain relevant context)
      const recentHistory = conversation.slice(-16);
      for (const turn of recentHistory) {
        if (turn.role === 'user') {
          contents.push({
            role: 'user',
            parts: [{ text: turn.content }],
          });
        } else if (turn.role === 'assistant' || turn.role === 'model') {
          contents.push({
            role: 'model',
            parts: [{ text: turn.content }],
          });
        }
      }

      // Build current user message parts
      const currentParts: any[] = [];

      // Attachments (images, PDFs, documents)
      if (attachments && Array.isArray(attachments)) {
        for (const att of attachments) {
          if (att.base64 && att.mimeType) {
            currentParts.push({
              inlineData: {
                data: att.base64.replace(/^data:[^;]+;base64,/, ''),
                mimeType: att.mimeType,
              },
            });
          }
        }
      }

      if (message) {
        currentParts.push({ text: message });
      }

      contents.push({
        role: 'user',
        parts: currentParts,
      });

      // Configure tools: Google Search grounding if webSearch is enabled
      const tools: any[] = [];
      if (webSearch) {
        tools.push({ googleSearch: {} });
      }

      // Helper for resilient fallback on transient 503/UNAVAILABLE errors
      const tryGenerateStream = async (targetModel: string) => {
        return await ai.models.generateContentStream({
          model: targetModel,
          contents,
          config: {
            systemInstruction: systemPrompt,
            tools: tools.length > 0 ? tools : undefined,
          },
        });
      };

      const tryGenerateUnary = async (targetModel: string) => {
        return await ai.models.generateContent({
          model: targetModel,
          contents,
          config: {
            systemInstruction: systemPrompt,
            tools: tools.length > 0 ? tools : undefined,
          },
        });
      };

      const modelCandidates = [
        modelName,
        'gemini-flash-latest',
        'gemini-3.1-flash-lite',
      ].filter((m, i, arr) => arr.indexOf(m) === i);

      if (stream) {
        // SSE Setup
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();

        let responseStream: any = null;
        for (const candidate of modelCandidates) {
          try {
            responseStream = await tryGenerateStream(candidate);
            break;
          } catch (err: any) {
            const errStr = JSON.stringify(err);
            if (errStr.includes('503') || errStr.includes('UNAVAILABLE') || errStr.includes('429')) {
              console.warn(`Transient error on ${candidate}, attempting fallback...`);
              continue;
            }
            throw err;
          }
        }

        if (!responseStream) {
          throw new Error('All model candidates encountered high demand. Please try again.');
        }

        let fullText = '';
        const sources: Array<{ title: string; url: string }> = [];

        for await (const chunk of responseStream) {
          const chunkText = chunk.text;
          if (chunkText) {
            fullText += chunkText;
            res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunkText })}\n\n`);
          }

          // Check for grounding metadata
          const candidate = chunk.candidates?.[0];
          if (candidate?.groundingMetadata?.groundingChunks) {
            for (const gChunk of candidate.groundingMetadata.groundingChunks) {
              if (gChunk.web?.uri && gChunk.web?.title) {
                if (!sources.some((s) => s.url === gChunk.web!.uri)) {
                  sources.push({ title: gChunk.web.title, url: gChunk.web.uri });
                }
              }
            }
          }
        }

        // Send sources and done event
        res.write(`data: ${JSON.stringify({ type: 'done', fullText, sources })}\n\n`);
        return res.end();
      } else {
        // Unary response with fallback
        let response: any = null;
        for (const candidate of modelCandidates) {
          try {
            response = await tryGenerateUnary(candidate);
            break;
          } catch (err: any) {
            const errStr = JSON.stringify(err);
            if (errStr.includes('503') || errStr.includes('UNAVAILABLE') || errStr.includes('429')) {
              console.warn(`Transient error on ${candidate}, attempting fallback...`);
              continue;
            }
            throw err;
          }
        }

        if (!response) {
          throw new Error('All model candidates encountered high demand. Please try again.');
        }

        const reply = response.text || '';
        const sources: Array<{ title: string; url: string }> = [];

        const candidate = response.candidates?.[0];
        if (candidate?.groundingMetadata?.groundingChunks) {
          for (const gChunk of candidate.groundingMetadata.groundingChunks) {
            if (gChunk.web?.uri && gChunk.web?.title) {
              sources.push({ title: gChunk.web.title, url: gChunk.web.uri });
            }
          }
        }

        return res.json({ reply, sources });
      }
    } catch (err: any) {
      console.error('Gemini error:', err);
      const errorMessage = err.message || 'Gemini API failed to generate a response.';
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`);
        return res.end();
      }
      return res.status(500).json({
        error: "Safdar AI couldn't generate a response from Gemini.",
        details: errorMessage,
      });
    }
  }

  // ==========================================
  // OPENAI PROVIDER
  // ==========================================
  if (provider === 'openai') {
    const apiKey = getOpenAIKey();
    if (!apiKey) {
      return res.status(400).json({
        error: 'OpenAI API is not configured.',
        details: 'Missing OPENAI_API_KEY in environment variables. Please configure your key in settings or .env.',
      });
    }

    const modelName = requestedModel || process.env.OPENAI_MODEL || 'gpt-4o-mini';

    try {
      const messages: any[] = [{ role: 'system', content: systemPrompt }];

      const recentHistory = conversation.slice(-16);
      for (const turn of recentHistory) {
        messages.push({
          role: turn.role === 'assistant' || turn.role === 'model' ? 'assistant' : 'user',
          content: turn.content,
        });
      }

      // Add attachments as image_url if image
      if (attachments && attachments.length > 0) {
        const userContent: any[] = [{ type: 'text', text: message || 'Analyze attached content' }];
        for (const att of attachments) {
          if (att.mimeType?.startsWith('image/')) {
            userContent.push({
              type: 'image_url',
              image_url: { url: att.base64 },
            });
          }
        }
        messages.push({ role: 'user', content: userContent });
      } else {
        messages.push({ role: 'user', content: message });
      }

      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();

        const openAiResp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelName,
            messages,
            stream: true,
          }),
        });

        if (!openAiResp.ok) {
          const errJson = await openAiResp.json().catch(() => ({}));
          throw new Error(errJson?.error?.message || `OpenAI returned status ${openAiResp.status}`);
        }

        const reader = openAiResp.body?.getReader();
        if (!reader) throw new Error('Failed to read OpenAI stream');

        const decoder = new TextDecoder();
        let fullText = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine || !cleanLine.startsWith('data: ')) continue;
            const dataStr = cleanLine.replace('data: ', '').trim();
            if (dataStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(dataStr);
              const chunk = parsed.choices?.[0]?.delta?.content || '';
              if (chunk) {
                fullText += chunk;
                res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
              }
            } catch {
              // Ignore partial JSON
            }
          }
        }

        res.write(`data: ${JSON.stringify({ type: 'done', fullText, sources: [] })}\n\n`);
        return res.end();
      } else {
        const openAiResp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelName,
            messages,
          }),
        });

        if (!openAiResp.ok) {
          const errJson = await openAiResp.json().catch(() => ({}));
          throw new Error(errJson?.error?.message || `OpenAI returned status ${openAiResp.status}`);
        }

        const data = await openAiResp.json();
        const reply = data.choices?.[0]?.message?.content || '';
        return res.json({ reply, sources: [] });
      }
    } catch (err: any) {
      console.error('OpenAI chat error:', err);
      const errorMessage = err.message || 'OpenAI API failed to generate response.';
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`);
        return res.end();
      }
      return res.status(500).json({
        error: "Safdar AI couldn't generate a response from OpenAI.",
        details: errorMessage,
      });
    }
  }

  return res.status(400).json({ error: `Unsupported provider: ${provider}` });
});

// ----------------------------------------------------
// API: Image Generation (Real Gemini / OpenAI DALL-E)
// ----------------------------------------------------
app.post('/api/image/generate', async (req, res) => {
  const {
    prompt,
    aspectRatio = '1:1',
    style = 'natural',
    provider: requestedProvider,
  } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required for image generation.' });
  }

  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'MY_OPENAI_API_KEY');

  const provider = requestedProvider || (hasGemini ? 'gemini' : hasOpenAi ? 'openai' : 'gemini');

  if (provider === 'gemini') {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(400).json({
        error: 'Image generation is not configured.',
        details: 'Missing GEMINI_API_KEY. Configure your Gemini API Key in the AI Studio Secrets panel.',
      });
    }

    try {
      // Use gemini-3.1-flash-lite-image as per SKILL.md
      const enhancedPrompt = `${prompt}, style: ${style}, high quality, crisp details`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          },
        },
      });

      let imageUrl: string | null = null;
      let textDesc: string = '';

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
          } else if (part.text) {
            textDesc += part.text;
          }
        }
      }

      if (!imageUrl) {
        return res.status(500).json({
          error: "Safdar AI couldn't generate an image from the model.",
          details: textDesc || 'The image model did not return image data.',
        });
      }

      return res.json({
        success: true,
        imageUrl,
        prompt,
        aspectRatio,
        provider: 'gemini',
        model: 'gemini-3.1-flash-lite-image',
      });
    } catch (err: any) {
      console.error('Image gen error:', err);
      return res.status(500).json({
        error: 'Failed to generate image with Gemini.',
        details: err.message || 'Image generation error',
      });
    }
  }

  if (provider === 'openai') {
    const apiKey = getOpenAIKey();
    if (!apiKey) {
      return res.status(400).json({
        error: 'Image generation is not configured for OpenAI.',
        details: 'Missing OPENAI_API_KEY. Add it in settings.',
      });
    }

    try {
      const resp = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt,
          n: 1,
          size: aspectRatio === '16:9' ? '1792x1024' : aspectRatio === '9:16' ? '1024x1792' : '1024x1024',
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `OpenAI returned status ${resp.status}`);
      }

      const data = await resp.json();
      const imageUrl = data.data?.[0]?.url;
      return res.json({
        success: true,
        imageUrl,
        prompt,
        aspectRatio,
        provider: 'openai',
        model: 'dall-e-3',
      });
    } catch (err: any) {
      return res.status(500).json({
        error: 'Failed to generate image with OpenAI.',
        details: err.message,
      });
    }
  }

  return res.status(400).json({ error: 'Image generation is not configured for this provider.' });
});

// ----------------------------------------------------
// API: Image Editing
// ----------------------------------------------------
app.post('/api/image/edit', async (req, res) => {
  const { imageBase64, mimeType = 'image/png', instruction } = req.body;

  if (!imageBase64 || !instruction) {
    return res.status(400).json({ error: 'Both image and editing instruction are required.' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.status(400).json({
      error: 'Image editing is not configured.',
      details: 'Missing GEMINI_API_KEY.',
    });
  }

  try {
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType,
            },
          },
          {
            text: instruction,
          },
        ],
      },
    });

    let imageUrl: string | null = null;
    let textDesc: string = '';

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textDesc += part.text;
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: "Safdar AI couldn't edit the image.",
        details: textDesc || 'The model did not return modified image bytes.',
      });
    }

    return res.json({
      success: true,
      imageUrl,
      instruction,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Image editing failed.',
      details: err.message,
    });
  }
});

// ----------------------------------------------------
// API: Server-side Data Analysis (CSV/JSON/Text)
// ----------------------------------------------------
app.post('/api/analyze-data', async (req, res) => {
  const { content, format = 'csv', fileName = 'dataset' } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Data content is required for analysis.' });
  }

  try {
    let rows: any[] = [];
    let headers: string[] = [];

    if (format === 'csv' || fileName.endsWith('.csv')) {
      const lines = content.trim().split('\n');
      if (lines.length > 0) {
        headers = lines[0].split(',').map((h: string) => h.trim().replace(/^["']|["']$/g, ''));
        rows = lines.slice(1).map((line: string) => {
          const values = line.split(',').map((v: string) => v.trim().replace(/^["']|["']$/g, ''));
          const rowObj: Record<string, any> = {};
          headers.forEach((h, idx) => {
            const raw = values[idx];
            const num = Number(raw);
            rowObj[h] = !isNaN(num) && raw !== '' ? num : raw;
          });
          return rowObj;
        });
      }
    } else if (format === 'json' || fileName.endsWith('.json')) {
      const parsed = JSON.parse(content);
      rows = Array.isArray(parsed) ? parsed : [parsed];
      if (rows.length > 0 && typeof rows[0] === 'object') {
        headers = Object.keys(rows[0]);
      }
    }

    // Compute basic statistics safely
    const stats: Record<string, { type: string; missing: number; unique?: number; min?: number; max?: number; avg?: number }> = {};

    headers.forEach((h) => {
      let missing = 0;
      const values = rows.map((r) => r[h]).filter((v) => {
        if (v === undefined || v === null || v === '') {
          missing++;
          return false;
        }
        return true;
      });

      const isNumeric = values.length > 0 && values.every((v) => typeof v === 'number');
      if (isNumeric) {
        const sum = values.reduce((a, b) => a + b, 0);
        stats[h] = {
          type: 'numeric',
          missing,
          min: Math.min(...values),
          max: Math.max(...values),
          avg: Number((sum / values.length).toFixed(2)),
        };
      } else {
        const uniqueSet = new Set(values);
        stats[h] = {
          type: 'text/category',
          missing,
          unique: uniqueSet.size,
        };
      }
    });

    return res.json({
      success: true,
      fileName,
      totalRows: rows.length,
      totalColumns: headers.length,
      headers,
      preview: rows.slice(0, 10),
      stats,
    });
  } catch (err: any) {
    return res.status(400).json({
      error: 'Data parsing failed.',
      details: err.message,
    });
  }
});

// ----------------------------------------------------
// Setup Vite in Dev or Static files in Prod
// ----------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[SAFDAR AI] Full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SAFDAR AI server:', err);
});
