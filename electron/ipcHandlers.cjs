const { ipcMain, shell, clipboard, BrowserWindow, net } = require("electron");
const Store = require("electron-store");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");

const store = new Store();

const STYLE_PROMPTS = {
  default: "You are Clippy, a helpful and friendly desktop AI assistant. Be concise but warm. Keep responses focused and practical.",
  concise: "You are Clippy. Respond briefly and efficiently. No fluff, just essential information.",
  dev: "You are Clippy, a senior software engineer assistant. Provide technical, precise answers with code examples when appropriate. Be direct and thorough.",
  creative: "You are Clippy, a creative assistant. Be imaginative, playful, and think outside the box. Make interactions fun and engaging.",
  professional: "You are Clippy, a professional business assistant. Be formal, clear, and thorough in your responses."
};

// Helper function for HTTP requests using Node's https
const https = require('https');
const http = require('http');

function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(60000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Ollama API handler
ipcMain.handle("ollama-chat", async (_, { messages, style, model }) => {
  const systemPrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.default;
  
  try {
    const response = await makeRequest(
      'http://127.0.0.1:11434/api/chat',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        model: model || 'mistral:latest',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
          }))
        ],
        stream: false,
      }
    );
    
    if (response.data?.message?.content) {
      return { success: true, content: response.data.message.content };
    }
    return { success: false, error: response.data?.error || 'No response from Ollama' };
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return { success: false, error: 'Ollama is not running. Start it with: ollama serve' };
    }
    return { success: false, error: error.message || 'Failed to connect to Ollama' };
  }
});

// Check Ollama status
ipcMain.handle("ollama-status", async () => {
  try {
    const response = await makeRequest(
      'http://127.0.0.1:11434/api/tags',
      { method: 'GET' }
    );
    return { running: true, models: response.data?.models || [] };
  } catch {
    return { running: false, models: [] };
  }
});

// Gemini API handler
ipcMain.handle("gemini-chat", async (_, { messages, style, model, apiKey }) => {
  // Use provided API key, or fall back to environment variable
  const geminiApiKey = apiKey || process.env.GEMINI_API_KEY;
  
  if (!geminiApiKey) {
    return { success: false, error: 'Gemini API key not found. Please add it in Settings or in .env file' };
  }
  
  const systemPrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.default;
  const geminiModel = model || 'gemini-2.0-flash';
  
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));
  
  try {
    const response = await makeRequest(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        contents: contents,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }
    );
    
    if (response.status === 200 && response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return { success: true, content: response.data.candidates[0].content.parts[0].text };
    }
    
    if (response.status === 403) {
      return { success: false, error: 'Invalid Gemini API key' };
    }
    if (response.status === 429) {
      return { success: false, error: 'Rate limit exceeded. Try again later.' };
    }
    
    return { success: false, error: response.data?.error?.message || 'Gemini request failed' };
  } catch (error) {
    return { success: false, error: error.message || 'Network error' };
  }
});

// Command handling
ipcMain.handle("command", async (_, command) => {
  const cmd = command.toLowerCase().trim();
  
  // Open URL command
  if (cmd.startsWith("open ")) {
    const url = command.replace(/^open\s+/i, "").trim();
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    shell.openExternal(fullUrl);
    return { type: "system", content: `Opening ${url}...` };
  }

  // Clipboard commands
  if (cmd === "summarize clipboard" || cmd === "clipboard") {
    const text = clipboard.readText();
    if (!text) {
      return { type: "clipboard", content: "", error: "Clipboard is empty" };
    }
    return { type: "clipboard", content: text };
  }

  // Copy to clipboard
  if (cmd.startsWith("copy ")) {
    const text = command.replace(/^copy\s+/i, "").trim();
    clipboard.writeText(text);
    return { type: "system", content: "Copied to clipboard!" };
  }

  // Math evaluation
  if (/^[\d+\-*/().\s]+$/.test(cmd)) {
    try {
      const result = Function(`"use strict"; return (${cmd})`)();
      return { type: "math", content: result.toString() };
    } catch (e) {
      return { type: "error", content: "Invalid math expression" };
    }
  }

  // Not a command
  return null;
});

// Clipboard access
ipcMain.handle("clipboard", () => clipboard.readText());

// Window controls
ipcMain.on("window-minimize", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win.minimize();
});

ipcMain.on("window-close", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win.hide();
});

// Settings management
ipcMain.handle("get-settings", () => {
  return store.get("settings", {
    provider: "local",
    ollamaModel: "mistral:latest",
    geminiModel: "gemini-2.0-flash",
    style: "default",
    soundEnabled: true,
    speechRate: 1.0,
    speechPitch: 1.0,
    sttProvider: "browser", // Default to browser (free, no rate limits)
    speechLanguage: "en-US",
    autoSubmitVoice: true,
  });
});

// Get API keys status (without exposing the actual keys)
ipcMain.handle("get-api-keys-status", () => {
  return {
    openai: !!process.env.OPENAI_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
  };
});

// macOS Native Speech Recognition
let speechProcess = null;

ipcMain.handle("macos-speech-start", async (_, { language }) => {
  return new Promise((resolve, reject) => {
    try {
      const swiftScript = path.join(__dirname, "speechRecognition.swift");
      
      // Compile and run Swift script
      speechProcess = spawn("swift", [swiftScript]);
      
      let partialText = "";
      let hasAuthorized = false;
      
      speechProcess.stdout.on("data", (data) => {
        const output = data.toString().trim();
        console.log("[Speech]", output);
        
        if (output === "AUTHORIZED") {
          hasAuthorized = true;
        } else if (output.startsWith("PARTIAL:")) {
          partialText = output.replace("PARTIAL:", "");
        } else if (output.startsWith("FINAL:")) {
          const finalText = output.replace("FINAL:", "");
          resolve({ success: true, text: finalText });
        } else if (output.startsWith("RESULT:")) {
          const result = output.replace("RESULT:", "");
          resolve({ success: true, text: result });
        } else if (output.startsWith("ERROR:")) {
          const error = output.replace("ERROR:", "");
          reject(new Error(error));
        }
      });
      
      speechProcess.stderr.on("data", (data) => {
        console.error("[Speech Error]", data.toString());
      });
      
      speechProcess.on("close", (code) => {
        console.log("[Speech] Process exited with code", code);
        speechProcess = null;
        if (!hasAuthorized) {
          resolve({ success: false, error: "Speech recognition not authorized" });
        }
      });
      
      speechProcess.on("error", (error) => {
        console.error("[Speech] Process error:", error);
        reject(error);
      });
      
    } catch (error) {
      console.error("[Speech] Failed to start:", error);
      reject(error);
    }
  });
});

ipcMain.handle("macos-speech-stop", async () => {
  if (speechProcess) {
    speechProcess.kill("SIGINT");
    speechProcess = null;
  }
  return { success: true };
});

ipcMain.handle("macos-speech-available", async () => {
  // Check if we're on macOS
  return {
    available: process.platform === "darwin",
    platform: process.platform
  };
});

ipcMain.handle("save-settings", (_, settings) => {
  store.set("settings", settings);
  return true;
});

// Chat history management
ipcMain.handle("get-chat-history", () => {
  return store.get("chatHistory", []);
});

ipcMain.handle("save-chat-history", (_, history) => {
  store.set("chatHistory", history);
  return true;
});

ipcMain.handle("clear-chat-history", () => {
  store.set("chatHistory", []);
  return true;
});

// OpenAI Whisper API handler for speech-to-text
ipcMain.handle("openai-whisper", async (_, { audioBlob, language }) => {
  // Get API key from environment variable
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return { success: false, error: 'OpenAI API key not found in .env file. Please add OPENAI_API_KEY to .env' };
  }

  try {
    // Create temporary file for audio
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `clippy-audio-${Date.now()}.webm`);
    
    // Write audio blob to temporary file
    fs.writeFileSync(tempFilePath, Buffer.from(audioBlob));

    // Create form data
    const form = new FormData();
    form.append('file', fs.createReadStream(tempFilePath));
    form.append('model', 'whisper-1');
    if (language && language !== 'auto') {
      form.append('language', language.split('-')[0]); // 'en-US' -> 'en'
    }

    // Make request to OpenAI Whisper API
    const response = await new Promise((resolve, reject) => {
      form.submit({
        host: 'api.openai.com',
        path: '/v1/audio/transcriptions',
        protocol: 'https:',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }, (err, res) => {
        if (err) {
          reject(err);
          return;
        }

        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            resolve({ status: res.statusCode, data });
          } catch {
            resolve({ status: res.statusCode, data: body });
          }
        });
      });
    });

    // Clean up temporary file
    try {
      fs.unlinkSync(tempFilePath);
    } catch (e) {
      console.warn('Failed to delete temp file:', e);
    }

    // Check response
    if (response.status === 200 && response.data?.text) {
      return { success: true, text: response.data.text };
    }

    if (response.status === 401) {
      return { success: false, error: 'Invalid OpenAI API key' };
    }
    if (response.status === 429) {
      return { success: false, error: 'Rate limit exceeded. Try again later.' };
    }

    return { 
      success: false, 
      error: response.data?.error?.message || 'Whisper transcription failed' 
    };
  } catch (error) {
    console.error('Whisper API error:', error);
    return { success: false, error: error.message || 'Network error' };
  }
});
