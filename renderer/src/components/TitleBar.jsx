import { motion } from 'framer-motion';
import { useSettingsStore } from '../store/settingsStore';
import { stop as stopSpeech } from '../services/speechService';

function TitleBar({ onSettingsClick, showSettings }) {
  const { settings, updateSettings } = useSettingsStore();

  const handleMinimize = () => {
    window.clippy?.minimize();
  };

  const handleClose = () => {
    window.clippy?.close();
  };

  const toggleProvider = () => {
    const newProvider = settings.provider === 'local' ? 'gemini' : 'local';
    updateSettings({ provider: newProvider });
  };

  const toggleSound = () => {
    const newSoundEnabled = !settings.soundEnabled;
    updateSettings({ soundEnabled: newSoundEnabled });
    // Stop any ongoing speech when disabling
    if (!newSoundEnabled) {
      stopSpeech();
    }
  };

  return (
    <div className="drag-region h-12 flex items-center justify-between px-4 border-b border-clippy-border bg-clippy-bg/50">
      <div className="flex items-center gap-2">
        {/* Clippy Logo */}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="w-6 h-6 flex items-center justify-center"
        >
          <span className="text-lg">📎</span>
        </motion.div>
        <span className="font-display font-semibold text-sm gradient-text">
          Clippy AI
        </span>
      </div>

      <div className="flex items-center gap-1 no-drag">
        {/* Sound Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSound}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            settings.soundEnabled
              ? 'text-purple-400 bg-purple-500/20 border border-purple-500/30'
              : 'text-clippy-muted hover:text-clippy-text hover:bg-clippy-surface'
          }`}
          title={settings.soundEnabled ? 'Sound ON - Click to mute' : 'Sound OFF - Click to enable'}
        >
          {settings.soundEnabled ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
        </motion.button>

        {/* Provider Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleProvider}
          className={`h-7 px-2 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-all ${
            settings.provider === 'local'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          }`}
          title={`Switch to ${settings.provider === 'local' ? 'Gemini' : 'Local'}`}
        >
          {settings.provider === 'local' ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Local
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Gemini
            </>
          )}
        </motion.button>

        {/* Settings Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onSettingsClick}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
            showSettings 
              ? 'bg-clippy-accent/20 text-clippy-accent' 
              : 'text-clippy-muted hover:text-clippy-text hover:bg-clippy-surface'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </motion.button>

        {/* Minimize Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleMinimize}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-clippy-muted hover:text-yellow-400 hover:bg-clippy-surface transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </motion.button>

        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-clippy-muted hover:text-red-400 hover:bg-clippy-surface transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}

export default TitleBar;
