import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../store/settingsStore';
import { useChatStore } from '../store/chatStore';
import { checkOllamaStatus } from '../services/llmService';
import { isSupported, getSupportedLanguages } from '../services/speechService';

const STYLES = {
  default: "You are Clippy, a helpful and friendly desktop AI assistant. Be concise but warm.",
  concise: "You are Clippy. Respond briefly and efficiently. No fluff.",
  dev: "You are Clippy, a senior software engineer assistant. Provide technical, precise answers with code examples when appropriate.",
  creative: "You are Clippy, a creative assistant. Be imaginative, playful, and think outside the box.",
  professional: "You are Clippy, a professional business assistant. Be formal, clear, and thorough."
};

const OLLAMA_MODELS = [
  { id: 'llama3', name: 'Llama 3', desc: 'Meta\'s latest' },
  { id: 'llama3.2', name: 'Llama 3.2', desc: 'Newest Llama' },
  { id: 'mistral', name: 'Mistral', desc: 'Fast & capable' },
  { id: 'codellama', name: 'Code Llama', desc: 'For coding' },
  { id: 'phi3', name: 'Phi-3', desc: 'Microsoft small' },
];

const GEMINI_MODELS = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', desc: 'Fast & free tier' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Latest & fastest' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Most capable' },
];

function Settings({ onClose }) {
  const { settings, updateSettings, loadSettings } = useSettingsStore();
  const { clearMessages } = useChatStore();
  const [ollamaStatus, setOllamaStatus] = useState({ running: false, models: [] });
  const [apiKeysStatus, setApiKeysStatus] = useState({ openai: false, gemini: false });
  const speechSupport = isSupported();

  useEffect(() => {
    loadSettings();
    checkOllamaStatus().then(setOllamaStatus);
    // Check API keys status from .env
    window.clippy?.getApiKeysStatus().then(status => {
      if (status) setApiKeysStatus(status);
    });
  }, []);


  const handleStyleChange = (style) => {
    updateSettings({ style });
  };

  const handleProviderChange = (provider) => {
    updateSettings({ provider });
  };

  const handleOllamaModelChange = (ollamaModel) => {
    updateSettings({ ollamaModel });
  };

  const handleGeminiModelChange = (geminiModel) => {
    updateSettings({ geminiModel });
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all chat history?')) {
      clearMessages();
    }
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-4 space-y-5 bg-clippy-bg">
      {/* Provider Toggle - Primary Feature */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-clippy-muted uppercase tracking-wide">
          AI Provider
        </label>
        <div className="flex gap-2 p-1 bg-clippy-surface rounded-xl border border-clippy-border">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => handleProviderChange('local')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              settings.provider === 'local'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-clippy-muted hover:text-clippy-text'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Local
            </div>
            <div className="text-[10px] mt-0.5 opacity-70">Ollama</div>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => handleProviderChange('gemini')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              settings.provider === 'gemini'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-clippy-muted hover:text-clippy-text'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cloud
            </div>
            <div className="text-[10px] mt-0.5 opacity-70">Gemini</div>
          </motion.button>
        </div>
      </div>

      {/* Ollama Status (when local selected) */}
      {settings.provider === 'local' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
            ollamaStatus.running
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${ollamaStatus.running ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          {ollamaStatus.running ? (
            <span>Ollama running • {ollamaStatus.models.length} models available</span>
          ) : (
            <span>Ollama not running • Run: <code className="bg-clippy-surface px-1 rounded">ollama serve</code></span>
          )}
        </motion.div>
      )}

      {/* Gemini API Key Input (when cloud selected) */}
      {settings.provider === 'gemini' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <label className="text-xs font-medium text-clippy-muted uppercase tracking-wide">
            Gemini API Key
          </label>
              <input
            type="password"
            value={settings.geminiApiKey || ''}
            onChange={(e) => updateSettings({ geminiApiKey: e.target.value })}
            placeholder="Enter your Gemini API key"
            className="w-full px-3 py-2 bg-clippy-surface border border-clippy-border rounded-lg text-sm text-clippy-text placeholder-clippy-muted focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
          <p className="text-[10px] text-clippy-muted">
            Get your free API key from{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Google AI Studio
            </a>
          </p>
        </motion.div>
      )}

      {/* Model Selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-clippy-muted uppercase tracking-wide">
          Model
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(settings.provider === 'local' ? OLLAMA_MODELS : GEMINI_MODELS).map((model) => {
            const isSelected = settings.provider === 'local' 
              ? settings.ollamaModel === model.id 
              : settings.geminiModel === model.id;
            const accentColor = settings.provider === 'local' ? 'emerald' : 'blue';
            
            return (
              <motion.button
                key={model.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => settings.provider === 'local' 
                  ? handleOllamaModelChange(model.id) 
                  : handleGeminiModelChange(model.id)
                }
                className={`p-3 rounded-lg border text-left transition-colors ${
                  isSelected
                    ? `border-${accentColor}-500/50 bg-${accentColor}-500/10 text-${accentColor}-400`
                    : 'border-clippy-border bg-clippy-surface text-clippy-text hover:border-clippy-accent/50'
                }`}
                style={isSelected ? {
                  borderColor: settings.provider === 'local' ? 'rgb(16 185 129 / 0.5)' : 'rgb(59 130 246 / 0.5)',
                  backgroundColor: settings.provider === 'local' ? 'rgb(16 185 129 / 0.1)' : 'rgb(59 130 246 / 0.1)',
                  color: settings.provider === 'local' ? 'rgb(52 211 153)' : 'rgb(96 165 250)'
                } : {}}
              >
                <div className="text-sm font-medium">{model.name}</div>
                <div className="text-xs text-clippy-muted mt-0.5">{model.desc}</div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Style Selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-clippy-muted uppercase tracking-wide">
          Assistant Style
        </label>
        <div className="space-y-2">
          {Object.keys(STYLES).map((style) => (
            <motion.button
              key={style}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleStyleChange(style)}
              className={`w-full p-3 rounded-lg border text-left transition-colors ${
                settings.style === style
                  ? 'border-clippy-accent bg-clippy-accent/10'
                  : 'border-clippy-border bg-clippy-surface hover:border-clippy-accent/50'
              }`}
            >
              <div className={`text-sm font-medium capitalize ${
                settings.style === style ? 'text-clippy-accent' : 'text-clippy-text'
              }`}>
                {style}
              </div>
              <div className="text-xs text-clippy-muted mt-1 line-clamp-1">
                {STYLES[style].substring(0, 50)}...
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Speech Recognition Settings */}
      {speechSupport.stt && (
        <div className="space-y-3 pt-2 border-t border-clippy-border">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-clippy-muted uppercase tracking-wide">
              🎤 Speech-to-Text
            </label>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Available
            </div>
          </div>

          {/* STT Provider Selection */}
          <div className="space-y-2">
            <label className="text-xs text-clippy-muted">Provider</label>
            <div className="flex gap-2 p-1 bg-clippy-surface rounded-xl border border-clippy-border">
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => updateSettings({ sttProvider: 'macos' })}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  settings.sttProvider === 'macos'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-clippy-muted hover:text-clippy-text'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  🍎 macOS Native
                </div>
                <div className="text-[9px] mt-0.5 opacity-70">Best • Offline</div>
              </motion.button>
              
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => updateSettings({ sttProvider: 'browser' })}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  settings.sttProvider === 'browser'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-clippy-muted hover:text-clippy-text'
                }`}
              >
                <div>Browser</div>
                <div className="text-[9px] mt-0.5 opacity-70">Free</div>
              </motion.button>
              
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => updateSettings({ sttProvider: 'openai' })}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  settings.sttProvider === 'openai'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-clippy-muted hover:text-clippy-text'
                }`}
              >
                <div>Whisper</div>
                <div className="text-[9px] mt-0.5 opacity-70">Paid</div>
              </motion.button>
            </div>
          </div>

          {/* OpenAI API Key Status (when Whisper selected) */}
          {settings.sttProvider === 'openai' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                apiKeysStatus.openai
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${apiKeysStatus.openai ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              {apiKeysStatus.openai ? (
                <span>OpenAI API key configured in .env ✓</span>
              ) : (
                <span>OpenAI API key not found • Add <code className="bg-clippy-surface px-1 rounded">OPENAI_API_KEY</code> to .env file</span>
              )}
            </motion.div>
          )}

          {/* Warning for selected provider */}
          <div className={`flex items-start gap-2 p-3 rounded-lg border ${
            settings.sttProvider === 'macos'
              ? 'bg-purple-500/10 border-purple-500/30'
              : settings.sttProvider === 'openai'
              ? 'bg-blue-500/10 border-blue-500/30'
              : 'bg-amber-500/10 border-amber-500/30'
          }`}>
            <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
              settings.sttProvider === 'macos' 
                ? 'text-purple-400' 
                : settings.sttProvider === 'openai' ? 'text-blue-400' : 'text-amber-400'
            }`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              {settings.sttProvider === 'macos' ? (
                <>
                  <div className="text-xs font-medium text-purple-400 mb-0.5">🍎 macOS Native (Recommended)</div>
                  <div className="text-xs text-purple-400/80 leading-relaxed">
                    Uses Apple's Speech Framework. Best accuracy, works offline, completely private. macOS only.
                  </div>
                </>
              ) : settings.sttProvider === 'openai' ? (
                <>
                  <div className="text-xs font-medium text-blue-400 mb-0.5">OpenAI Whisper (Paid)</div>
                  <div className="text-xs text-blue-400/80 leading-relaxed">
                    More accurate transcription. Requires OpenAI API key and costs per minute. Internet required.
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs font-medium text-amber-400 mb-0.5">Browser STT (Free)</div>
                  <div className="text-xs text-amber-400/80 leading-relaxed">
                    Uses Google Speech API (built into browser). Free but requires internet connection.
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <label className="text-xs text-clippy-muted">Language</label>
            <select
              value={settings.speechLanguage || 'en-US'}
              onChange={(e) => updateSettings({ speechLanguage: e.target.value })}
              className="w-full bg-clippy-surface border border-clippy-border rounded-lg px-3 py-2 text-sm text-clippy-text focus:border-clippy-accent/50 transition-colors"
            >
              {getSupportedLanguages().map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Auto-submit toggle */}
          <div className="flex items-center justify-between p-3 bg-clippy-surface border border-clippy-border rounded-lg">
            <div>
              <div className="text-sm text-clippy-text font-medium">Auto-submit voice input</div>
              <div className="text-xs text-clippy-muted mt-0.5">Automatically send after speech recognition</div>
            </div>
            <button
              onClick={() => updateSettings({ autoSubmitVoice: !settings.autoSubmitVoice })}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                settings.autoSubmitVoice ? 'bg-clippy-accent' : 'bg-clippy-border'
              }`}
            >
              <motion.div
                animate={{ x: settings.autoSubmitVoice ? 20 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>

          {/* Keyboard Shortcut Info */}
          <div className="text-xs text-clippy-muted bg-clippy-surface/50 px-3 py-2 rounded-lg">
            <p className="font-medium mb-1">Voice Input Shortcuts:</p>
            <div className="space-y-0.5">
              <p>• Press <kbd className="bg-clippy-surface px-1.5 py-0.5 rounded border border-clippy-border">⌘/Ctrl</kbd> + <kbd className="bg-clippy-surface px-1.5 py-0.5 rounded border border-clippy-border">K</kbd> to start</p>
              <p>• Press <kbd className="bg-clippy-surface px-1.5 py-0.5 rounded border border-clippy-border">Esc</kbd> to stop</p>
              <p>• Click microphone button</p>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="space-y-2 pt-2 border-t border-clippy-border">
        <label className="text-xs font-medium text-red-400/80 uppercase tracking-wide">
          Danger Zone
        </label>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleClearHistory}
          className="w-full p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
        >
          Clear Chat History
        </motion.button>
      </div>

      {/* Keyboard Shortcut Info */}
      <div className="text-center text-xs text-clippy-muted pt-2">
        <p>Toggle Window: <kbd className="bg-clippy-surface px-1.5 py-0.5 rounded text-clippy-accent">⌘/Ctrl</kbd> + <kbd className="bg-clippy-surface px-1.5 py-0.5 rounded text-clippy-accent">⇧</kbd> + <kbd className="bg-clippy-surface px-1.5 py-0.5 rounded text-clippy-accent">Space</kbd></p>
      </div>
    </div>
  );
}

export default Settings;
