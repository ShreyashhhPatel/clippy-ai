import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Message from './Message';
import CommandBar from './CommandBar';
import { useChatStore } from '../store/chatStore';

function ChatWindow() {
  const { messages } = useChatStore();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="h-full flex flex-col bg-clippy-bg">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex flex-col items-center justify-center text-center px-4"
          >
            <motion.div
              animate={{ 
                y: [0, -8, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-5xl mb-4"
            >
              📎
            </motion.div>
            <h2 className="font-display text-lg font-semibold text-clippy-text mb-2">
              Hi, I'm Clippy!
            </h2>
            <p className="text-clippy-muted text-sm mb-4">
              Your AI desktop assistant
            </p>
            <div className="space-y-2 text-xs text-clippy-muted">
              <p className="flex items-center gap-2">
                <span className="text-clippy-accent">→</span>
                <code className="bg-clippy-surface px-2 py-1 rounded">open google.com</code>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-clippy-accent">→</span>
                <code className="bg-clippy-surface px-2 py-1 rounded">summarize clipboard</code>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-clippy-accent">→</span>
                <code className="bg-clippy-surface px-2 py-1 rounded">2 + 2 * 5</code>
              </p>
            </div>
          </motion.div>
        ) : (
          messages.map((message, index) => (
            <Message 
              key={index} 
              message={message} 
              index={index} 
              isLatest={index === messages.length - 1}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Command Bar */}
      <CommandBar />
    </div>
  );
}

export default ChatWindow;



