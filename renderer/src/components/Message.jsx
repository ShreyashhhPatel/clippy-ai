import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../store/settingsStore';
import { speak, stop, isSpeaking } from '../services/speechService';

function Message({ message, index, isLatest }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const { settings } = useSettingsStore();
  const [speaking, setSpeaking] = useState(false);
  const hasSpoken = useRef(false);

  // Auto-speak new assistant messages when sound is enabled
  useEffect(() => {
    if (
      isLatest &&
      !isUser &&
      !isSystem &&
      settings.soundEnabled &&
      !hasSpoken.current &&
      message.content
    ) {
      hasSpoken.current = true;
      setSpeaking(true);
      speak(message.content, {
        rate: settings.speechRate || 1.0,
        pitch: settings.speechPitch || 1.0,
        onEnd: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    }
  }, [isLatest, isUser, isSystem, settings.soundEnabled, message.content]);

  // Handle manual play/stop
  const handleSpeakToggle = () => {
    if (speaking || isSpeaking()) {
      stop();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      speak(message.content, {
        rate: settings.speechRate || 1.0,
        pitch: settings.speechPitch || 1.0,
        onEnd: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? 'bg-clippy-user text-white rounded-br-sm'
            : isSystem
            ? 'bg-clippy-surface/50 text-clippy-muted text-xs italic border border-clippy-border rounded-bl-sm'
            : 'bg-clippy-surface text-clippy-text rounded-bl-sm border border-clippy-border'
        }`}
      >
        {!isUser && !isSystem && (
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">📎</span>
              <span className="text-xs font-medium text-clippy-accent">Clippy</span>
            </div>
            {/* Speaker button for assistant messages */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSpeakToggle}
              className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                speaking
                  ? 'text-purple-400 bg-purple-500/20'
                  : 'text-clippy-muted hover:text-clippy-text'
              }`}
              title={speaking ? 'Stop speaking' : 'Read aloud'}
            >
              {speaking ? (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </motion.button>
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </div>
    </motion.div>
  );
}

export default Message;
