// LLM Service - Uses IPC to main process for API calls (avoids CORS issues)

// Ollama API (Local) - via main process
async function askOllama(messages, style = 'default', model = 'llama3') {
  const result = await window.clippy?.ollamaChat({
    messages,
    style,
    model
  });
  
  if (result?.success) {
    return result.content;
  }
  throw new Error(result?.error || 'Failed to connect to Ollama');
}

// Google Gemini API - via main process (API key from settings or .env)
async function askGemini(messages, style = 'default', model = 'gemini-1.5-flash', apiKey = null) {
  // If running in Electron, use IPC
  if (window.clippy?.geminiChat) {
    const result = await window.clippy.geminiChat({
      messages,
      style,
      model,
      apiKey
    });
    
    if (result?.success) {
      return result.content;
    }
    throw new Error(result?.error || 'Gemini request failed');
  }
  
  // If running in browser, make direct API call
  if (!apiKey) {
    throw new Error('Gemini API key required. Please add it in Settings.');
  }
  
  const STYLE_PROMPTS = {
    default: "You are Clippy, a helpful and friendly desktop AI assistant. Be concise but warm.",
    concise: "You are Clippy. Respond briefly and efficiently. No fluff.",
    dev: "You are Clippy, a senior software engineer assistant. Provide technical, precise answers with code examples when appropriate.",
    creative: "You are Clippy, a creative assistant. Be imaginative, playful, and think outside the box.",
    professional: "You are Clippy, a professional business assistant. Be formal, clear, and thorough."
  };
  
  const systemPrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.default;
  const geminiModel = model || 'gemini-2.0-flash';
  
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: contents,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        })
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gemini API error');
    }
    
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('No response from Gemini');
    }
    
    return content;
  } catch (error) {
    throw new Error(error.message || 'Failed to connect to Gemini');
  }
}

// Main export - routes to the correct provider
export async function askLLM(messages, style = 'default', settings = {}) {
  const provider = settings.provider || 'local';

  switch (provider) {
    case 'local':
      return askOllama(messages, style, settings.ollamaModel || 'llama3');
    
    case 'gemini':
      return askGemini(messages, style, settings.geminiModel || 'gemini-2.0-flash', settings.geminiApiKey);
    
    default:
      return askOllama(messages, style, settings.ollamaModel || 'llama3');
  }
}

// Check if Ollama is running - via main process
export async function checkOllamaStatus() {
  try {
    const result = await window.clippy?.ollamaStatus();
    return result || { running: false, models: [] };
  } catch {
    return { running: false, models: [] };
  }
}
