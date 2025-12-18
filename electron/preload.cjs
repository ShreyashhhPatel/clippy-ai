const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("clippy", {
  // Commands
  sendCommand: (cmd) => ipcRenderer.invoke("command", cmd),
  getClipboard: () => ipcRenderer.invoke("clipboard"),
  
  // Window controls
  minimize: () => ipcRenderer.send("window-minimize"),
  close: () => ipcRenderer.send("window-close"),
  
  // Settings
  getSettings: () => ipcRenderer.invoke("get-settings"),
  saveSettings: (settings) => ipcRenderer.invoke("save-settings", settings),
  getApiKeysStatus: () => ipcRenderer.invoke("get-api-keys-status"),
  
  // Chat history
  getChatHistory: () => ipcRenderer.invoke("get-chat-history"),
  saveChatHistory: (history) => ipcRenderer.invoke("save-chat-history", history),
  clearChatHistory: () => ipcRenderer.invoke("clear-chat-history"),
  
  // LLM APIs (via main process to avoid CORS)
  ollamaChat: (params) => ipcRenderer.invoke("ollama-chat", params),
  ollamaStatus: () => ipcRenderer.invoke("ollama-status"),
  geminiChat: (params) => ipcRenderer.invoke("gemini-chat", params),
  
  // OpenAI Whisper API for speech-to-text
  openaiWhisper: (params) => ipcRenderer.invoke("openai-whisper", params),
  
  // macOS Native Speech Recognition
  macosSpeechStart: (params) => ipcRenderer.invoke("macos-speech-start", params),
  macosSpeechStop: () => ipcRenderer.invoke("macos-speech-stop"),
  macosSpeechAvailable: () => ipcRenderer.invoke("macos-speech-available"),
});
