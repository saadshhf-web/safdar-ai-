export interface SpeechRecognitionService {
  isSupported: boolean;
  start: (onResult: (text: string) => void, onError?: (err: any) => void) => void;
  stop: () => void;
}

// Browser Speech Recognition abstraction
export class VoiceInputManager {
  private recognition: any = null;
  public isListening = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }
    }
  }

  get isSupported(): boolean {
    return Boolean(this.recognition);
  }

  start(
    onResult: (text: string, isFinal: boolean) => void,
    onStateChange: (listening: boolean) => void,
    onError?: (err: any) => void
  ) {
    if (!this.recognition) {
      onError?.(new Error('Speech recognition not supported in this browser.'));
      return;
    }

    this.recognition.onstart = () => {
      this.isListening = true;
      onStateChange(true);
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const text = final || interim;
      if (text) {
        onResult(text, Boolean(final));
      }
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      this.isListening = false;
      onStateChange(false);
      onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onStateChange(false);
    };

    try {
      this.recognition.start();
    } catch {
      // Already running
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Ignored
      }
      this.isListening = false;
    }
  }
}

// Browser Speech Synthesis (TTS) abstraction
export class VoiceOutputManager {
  public isSpeaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  get isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (!this.isSupported) return [];
    return window.speechSynthesis.getVoices();
  }

  speak(
    text: string,
    options: {
      rate?: number;
      pitch?: number;
      voiceName?: string;
      onStart?: () => void;
      onEnd?: () => void;
    } = {}
  ) {
    if (!this.isSupported) return;

    this.stop();

    // Clean markdown before speaking
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[#*_~>-]/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;

    if (options.voiceName) {
      const voices = this.getVoices();
      const match = voices.find((v) => v.name === options.voiceName);
      if (match) utterance.voice = match;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      options.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      options.onEnd?.();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  pause() {
    if (this.isSupported && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  }

  resume() {
    if (this.isSupported && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }

  stop() {
    if (this.isSupported) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }
}

export const voiceInput = new VoiceInputManager();
export const voiceOutput = new VoiceOutputManager();
