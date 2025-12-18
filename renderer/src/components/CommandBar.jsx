import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import { useSettingsStore } from '../store/settingsStore';
import { askLLM } from '../services/llmService';
import { isCommand, executeCommand } from '../services/commandParser';
import { startListening, stopListening, isListening, isSupported, startWhisperListening, stopWhisperListening, startMacOSSpeechRecognition, stopMacOSSpeechRecognition } from '../services/speechService';

function CommandBar() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [listeningTime, setListeningTime] = useState(0);
  const [showVoiceWarning, setShowVoiceWarning] = useState(false);
  const { addMessage } = useChatStore();
  const { settings } = useSettingsStore();
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const speechSupport = isSupported();
  
  // Detect if running in Electron - Voice disabled in Electron
  const isElectron = !!(window.clippy);
  const voiceInputAvailable = speechSupport.stt && !isElectron; // Only enable in browser

  // Timer for recording duration
  useEffect(() => {
    if (isRecording) {
      setListeningTime(0);
      timerRef.current = setInterval(() => {
        setListeningTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setListeningTime(0);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  // Keyboard shortcut for voice input (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K to start voice input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && voiceInputAvailable) {
        e.preventDefault();
        handleVoiceInput();
      }
      // Escape to stop recording
      if (e.key === 'Escape' && isRecording) {
        e.preventDefault();
        stopListening();
        setIsRecording(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, voiceInputAvailable]);


  // Voice input handler
  const handleVoiceInput = async () => {
    if (!speechSupport.stt) {
      addMessage({ 
        role: 'assistant', 
        content: '🎤 Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.' 
      });
      return;
    }

    // If already recording, stop it
    if (isRecording) {
      console.log('Stopping voice input...');
      const useMacOS = settings.sttProvider === 'macos';
      const useWhisper = settings.sttProvider === 'openai';
      if (useMacOS) {
        stopMacOSSpeechRecognition();
      } else if (useWhisper) {
        stopWhisperListening();
      } else {
      stopListening();
      }
      setIsRecording(false);
      return;
    }

    // Show warning on first use
    const hasSeenWarning = localStorage.getItem('clippy-voice-warning-seen');
    if (!hasSeenWarning) {
      setShowVoiceWarning(true);
      localStorage.setItem('clippy-voice-warning-seen', 'true');
      
      // Auto-hide after 8 seconds
      setTimeout(() => {
        setShowVoiceWarning(false);
      }, 8000);
    }

    // Clear input and start recording
    setInput('');
    setIsRecording(true);
    
    // Focus input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Check which STT provider to use
    const useMacOS = settings.sttProvider === 'macos';
    const useWhisper = settings.sttProvider === 'openai' && false; // Disabled for now
    
    try {
      let transcript;
      
      if (useMacOS) {
        // Use macOS native Speech Recognition (best quality, offline!)
        transcript = await startMacOSSpeechRecognition({
          lang: settings.speechLanguage || 'en-US',
          
          onStart: () => {
            console.log('🍎 Started macOS native speech...');
            setInput('');
          },
          
          onResult: (text) => {
            console.log('🍎 macOS result:', text);
            setInput(text);
          },
          
          onEnd: (finalText) => {
            console.log('🍎 macOS ended:', finalText);
          },
          
          onError: (error) => {
            console.error('🍎 macOS error:', error);
          }
        });
      } else if (useWhisper) {
        // Use OpenAI Whisper (more accurate, API key from .env)
        transcript = await startWhisperListening({
          lang: settings.speechLanguage || 'en-US',
          
          onStart: () => {
            console.log('🎤 Started Whisper recording...');
            setInput('🎤 Recording...');
          },
          
          onResult: (text) => {
            console.log('🎤 Whisper result:', text);
            setInput(text);
          },
          
          onEnd: (finalText) => {
            console.log('🎤 Whisper ended:', finalText);
          },
          
          onError: (error) => {
            console.error('🎤 Whisper error:', error);
          }
        });
      } else {
        // Use Web Speech API (free, browser built-in)
        transcript = await startListening({
          lang: settings.speechLanguage || 'en-US',
          interimResults: true,
          
          onStart: () => {
            console.log('🎤 Started Web Speech API...');
            setInput(''); // Keep empty
          },
          
        onInterim: (text) => {
            // Keep input empty during recording - user doesn't want text shown
            // setInput(text);
          },
          
          onResult: (text) => {
            console.log('🎤 Got result:', text);
          },
          
          onEnd: (finalText) => {
            console.log('🎤 Recording ended, final text:', finalText);
        }
      });
      }
      
      setIsRecording(false);
      
      if (transcript && transcript.trim()) {
        setInput(transcript);
        
        // Auto-submit after voice input (if enabled in settings)
        if (settings.autoSubmitVoice !== false) {
        setTimeout(() => {
            if (inputRef.current?.form) {
              inputRef.current.form.requestSubmit();
            }
          }, 300);
        }
      } else {
        // No speech detected
        setInput('');
        addMessage({ 
          role: 'system', 
          content: '🎤 No speech detected. Try again!' 
        });
      }
    } catch (error) {
      setIsRecording(false);
      console.error('Speech recognition error:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // Provide helpful error messages
      let errorMsg = error.message;
      
      if (error.message === 'network') {
        errorMsg = 'Voice requires internet. Check connection.';
      } else if (error.message === 'not-allowed' || error.name === 'NotAllowedError') {
        errorMsg = 'Microphone blocked. Allow mic access in System Settings → Privacy → Microphone';
      } else if (error.message === 'no-speech') {
        errorMsg = 'No speech detected.';
      } else if (error.message === 'audio-capture' || error.name === 'NotFoundError') {
        errorMsg = 'No microphone found.';
      } else if (error.message === 'Speech recognition not supported in this browser') {
        errorMsg = 'Browser doesn\'t support speech. Use Chrome/Safari/Edge.';
      } else {
        errorMsg = `Mic error: ${error.message}`;
      }
      
      addMessage({ role: 'assistant', content: errorMsg });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    addMessage({ role: 'user', content: userMessage });

    // Check if it's a command
    if (isCommand(userMessage)) {
      setIsLoading(true);
      const result = await executeCommand(userMessage);
      
      if (result.type === 'clipboard') {
        // Clipboard content - send to LLM for summarization
        if (result.error) {
          addMessage({ role: 'assistant', content: result.error });
        } else if (userMessage.toLowerCase().includes('summarize')) {
          // Summarize the clipboard content
          try {
            const summary = await askLLM(
              [{ role: 'user', content: `Please summarize this text concisely:\n\n${result.content}` }],
              settings.style,
              settings // Pass full settings for provider selection
            );
            addMessage({ role: 'assistant', content: summary });
          } catch (error) {
            addMessage({ role: 'assistant', content: `Clipboard content:\n\n${result.content}` });
          }
        } else {
          addMessage({ role: 'assistant', content: `Clipboard content:\n\n${result.content}` });
        }
      } else if (result.type === 'math') {
        addMessage({ role: 'assistant', content: `= ${result.content}` });
      } else if (result.type === 'system') {
        addMessage({ role: 'system', content: result.content });
      } else if (result.type === 'error') {
        addMessage({ role: 'assistant', content: `Error: ${result.content}` });
      }
      
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const { messages } = useChatStore.getState();
      const response = await askLLM(
        messages.filter(m => m.role !== 'system').slice(-10),
        settings.style,
        settings // Pass full settings for provider selection
      );
      addMessage({ role: 'assistant', content: response });
    } catch (error) {
      addMessage({ 
        role: 'assistant', 
        content: `Sorry, I encountered an error: ${error.message}` 
      });
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-clippy-border bg-clippy-bg/50">
      {/* Voice Input Warning (First Time) */}
      <AnimatePresence>
        {showVoiceWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-2 px-3 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <div className="text-xs font-medium text-amber-400 mb-0.5">Voice input uses Google Speech API</div>
                <div className="text-xs text-amber-400/80 leading-relaxed">
                  Requires internet connection. Audio is processed by Google servers.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVoiceWarning(false)}
                className="text-amber-400/60 hover:text-amber-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Status Banner */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg"
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-red-500 rounded-full"
                />
                <span className="text-red-500 font-medium">Recording...</span>
                <span className="text-clippy-muted text-xs">
                  {Math.floor(listeningTime / 60)}:{(listeningTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-clippy-muted">
                <kbd className="px-1.5 py-0.5 bg-clippy-surface rounded border border-clippy-border">Esc</kbd>
                <span>to stop</span>
              </div>
            </div>
            
            {/* Audio Waveform Animation */}
            <div className="flex items-center justify-center gap-0.5 mt-2 h-6">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: ['20%', '100%', '20%'],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.05,
                    ease: 'easeInOut',
                  }}
                  className="w-1 bg-red-500/60 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        {/* Voice Input Button - Available in both browser and Electron */}
        {voiceInputAvailable && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleVoiceInput}
            disabled={isLoading}
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                : 'bg-clippy-surface border border-clippy-border text-clippy-muted hover:text-clippy-text hover:border-clippy-accent/50'
            } disabled:opacity-50`}
            title={isRecording ? 'Stop recording (Esc)' : 'Voice input (Cmd/Ctrl + K)'}
          >
            <AnimatePresence mode="wait">
              {isRecording ? (
                <motion.svg
                  key="recording"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </motion.svg>
              ) : (
                <motion.svg
                  key="mic"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </motion.svg>
              )}
            </AnimatePresence>
            
            {/* Pulse effect when recording */}
            {isRecording && (
              <motion.div
                className="absolute inset-0 rounded-xl bg-red-500"
                animate={{
                  scale: [1, 1.4],
                  opacity: [0.5, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            )}
          </motion.button>
        )}

        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isRecording 
                ? '' 
                : voiceInputAvailable 
                  ? 'Ask anything or press Cmd/Ctrl+K for voice...'
                  : 'Ask anything or type a command...'
            }
            disabled={isLoading || isRecording}
            className={`w-full bg-clippy-surface border rounded-xl px-4 py-2.5 text-sm text-clippy-text placeholder-clippy-muted focus:border-clippy-accent/50 focus:ring-1 focus:ring-clippy-accent/20 transition-all disabled:opacity-50 ${
              isRecording ? 'border-red-500/50 ring-2 ring-red-500/20' : 'border-clippy-border'
            }`}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
              <span className="typing-dot w-1.5 h-1.5 bg-clippy-accent rounded-full"></span>
              <span className="typing-dot w-1.5 h-1.5 bg-clippy-accent rounded-full"></span>
              <span className="typing-dot w-1.5 h-1.5 bg-clippy-accent rounded-full"></span>
            </div>
          )}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isLoading || !input.trim()}
          className="w-10 h-10 rounded-xl bg-clippy-accent text-clippy-bg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </motion.button>
      </div>
    </form>
  );
}

export default CommandBar;
