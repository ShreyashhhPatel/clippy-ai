import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatWindow from './components/ChatWindow';
import Settings from './components/Settings';
import TitleBar from './components/TitleBar';

function App() {
  const [showSettings, setShowSettings] = useState(false);

  // Request microphone permission on startup (browser only)
  useEffect(() => {
    const requestMicPermission = async () => {
      // Only in browser (not Electron)
      if (!window.clippy && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          console.log('🎤 Requesting microphone permission...');
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log('✅ Microphone permission granted');
          // Stop the stream immediately - we just needed permission
          stream.getTracks().forEach(track => track.stop());
        } catch (error) {
          console.warn('⚠️ Microphone permission denied:', error);
          // Not critical - user can still use text input
        }
      }
    };

    requestMicPermission();
  }, []);

  return (
    <div className="w-full h-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full h-full glass rounded-2xl overflow-hidden flex flex-col border border-clippy-border shadow-2xl"
      >
        <TitleBar 
          onSettingsClick={() => setShowSettings(!showSettings)} 
          showSettings={showSettings}
        />
        
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {showSettings ? (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <Settings onClose={() => setShowSettings(false)} />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <ChatWindow />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default App;







