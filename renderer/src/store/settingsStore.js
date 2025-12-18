import { create } from 'zustand';

const DEFAULT_SETTINGS = {
  provider: 'local', // 'local' (Ollama) or 'gemini'
  ollamaModel: 'mistral:latest',
  geminiModel: 'gemini-2.0-flash',
  geminiApiKey: '',         // Gemini API key (stored in app, fallback to .env)
  style: 'default',
  // Sound settings
  soundEnabled: true,       // TTS on/off
  speechRate: 1.0,          // 0.5 to 2.0
  speechPitch: 1.0,         // 0.5 to 1.5
  // Speech-to-text settings
  sttProvider: 'browser',   // 'browser' (free, online), or 'openai' (paid, accurate)
  speechLanguage: 'en-US',  // Language for speech recognition
  autoSubmitVoice: true,    // Auto-submit after voice input
};

export const useSettingsStore = create((set) => ({
  settings: DEFAULT_SETTINGS,
  
  // Load settings from electron store
  loadSettings: async () => {
    try {
      const saved = await window.clippy?.getSettings();
      if (saved) {
        set({ settings: { ...DEFAULT_SETTINGS, ...saved } });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },
  
  // Update settings
  updateSettings: (newSettings) => {
    set((state) => {
      const updated = { ...state.settings, ...newSettings };
      // Save to electron store
      window.clippy?.saveSettings(updated);
      return { settings: updated };
    });
  },
}));

// Initialize on load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    useSettingsStore.getState().loadSettings();
  }, 100);
}


