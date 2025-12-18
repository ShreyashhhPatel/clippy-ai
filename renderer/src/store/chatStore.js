import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  messages: [],
  
  // Load chat history from electron store
  loadMessages: async () => {
    try {
      const history = await window.clippy?.getChatHistory();
      if (history && history.length > 0) {
        set({ messages: history });
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  },
  
  // Add a new message
  addMessage: (message) => {
    set((state) => {
      const updated = [...state.messages, { ...message, timestamp: Date.now() }];
      // Save to electron store
      window.clippy?.saveChatHistory(updated);
      return { messages: updated };
    });
  },
  
  // Clear all messages
  clearMessages: () => {
    set({ messages: [] });
    window.clippy?.clearChatHistory();
  },
}));

// Initialize on load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    useChatStore.getState().loadMessages();
  }, 100);
}








