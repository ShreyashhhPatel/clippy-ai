/**
 * Speech Service - Text-to-Speech & Speech-to-Text
 * Uses Web Speech API (works in Electron/Chromium)
 */

// ═══════════════════════════════════════════════════════════════
// TEXT-TO-SPEECH (TTS)
// ═══════════════════════════════════════════════════════════════

let currentUtterance = null;

export function speak(text, options = {}) {
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-speech not supported');
    return;
  }

  // Cancel any ongoing speech
  stop();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Configure voice settings
  utterance.rate = options.rate || 1.0;      // 0.1 to 10
  utterance.pitch = options.pitch || 1.0;    // 0 to 2
  utterance.volume = options.volume || 1.0;  // 0 to 1
  
  // Try to use a nice voice
  const voices = speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => 
    v.name.includes('Samantha') ||  // macOS
    v.name.includes('Google') ||     // Chrome
    v.name.includes('Microsoft') ||  // Windows
    v.lang.startsWith('en')
  );
  
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  // Event handlers
  utterance.onstart = () => {
    currentUtterance = utterance;
  };
  
  utterance.onend = () => {
    currentUtterance = null;
    if (options.onEnd) options.onEnd();
  };
  
  utterance.onerror = (event) => {
    console.error('Speech error:', event.error);
    currentUtterance = null;
    if (options.onError) options.onError(event.error);
  };

  speechSynthesis.speak(utterance);
}

export function stop() {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function isSpeaking() {
  return speechSynthesis?.speaking || false;
}

// ═══════════════════════════════════════════════════════════════
// SPEECH-TO-TEXT (STT)
// ═══════════════════════════════════════════════════════════════

let recognition = null;
let isRecognitionActive = false;
let mediaRecorder = null;
let audioChunks = [];

export function startListening(options = {}) {
  return new Promise((resolve, reject) => {
    // Check if speech recognition is available
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      reject(new Error('Speech recognition not supported in this browser'));
      return;
    }

    // Don't start if already listening
    if (isRecognitionActive) {
      console.warn('Recognition already active');
      stopListening();
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    // Configure recognition
    recognition.continuous = options.continuous || false;
    recognition.interimResults = options.interimResults !== false; // Default true
    recognition.lang = options.lang || 'en-US';
    recognition.maxAlternatives = 1;

    let finalTranscript = '';
    let lastInterimTime = Date.now();

    recognition.onstart = () => {
      isRecognitionActive = true;
      console.log('🎤 Speech recognition started');
      if (options.onStart) options.onStart();
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          console.log(`✓ Final: "${transcript}" (confidence: ${confidence})`);
        } else {
          interimTranscript += transcript;
          lastInterimTime = Date.now();
        }
      }
      
      // Call interim callback with current transcription
      if (options.onInterim) {
        const currentText = (finalTranscript + interimTranscript).trim();
        options.onInterim(currentText);
      }
      
      // Call result callback when we get final results
      if (finalTranscript && options.onResult) {
        options.onResult(finalTranscript.trim());
      }
    };

    recognition.onend = () => {
      isRecognitionActive = false;
      recognition = null;
      console.log('🎤 Speech recognition ended');
      
      const result = finalTranscript.trim();
      
      if (options.onEnd) {
        options.onEnd(result);
      }
      
      resolve(result);
    };

    recognition.onerror = async (event) => {
      isRecognitionActive = false;
      recognition = null;
      
      console.error('🎤 Speech recognition error:', event.error);
      console.error('🎤 Full error event:', event);
      
      // Handle different error types
      let errorMessage = event.error;
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'no-speech';
          resolve(''); // Resolve with empty string instead of rejecting
          return;
        case 'audio-capture':
          errorMessage = 'not-allowed';
          break;
        case 'not-allowed':
          errorMessage = 'not-allowed';
          break;
        case 'network':
          // Network error - could be actual network or mic access issue
          // Test actual mic access
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            console.log('✅ Mic is accessible, network error is real network issue');
            errorMessage = 'Web Speech API connection failed. Try again or check internet.';
          } catch (micError) {
            console.error('❌ Mic not accessible:', micError);
            errorMessage = 'Microphone access denied. Check System Settings → Privacy → Microphone';
          }
          break;
        case 'aborted':
          // User stopped, not really an error
          resolve(finalTranscript.trim());
          return;
        default:
          errorMessage = event.error;
      }
      
      if (options.onError) {
        options.onError(errorMessage);
      }
      
      reject(new Error(errorMessage));
    };

    // Start recognition
    try {
      recognition.start();
    } catch (error) {
      isRecognitionActive = false;
      recognition = null;
      reject(error);
    }
  });
}

export function stopListening() {
  if (recognition) {
    console.log('🎤 Stopping speech recognition...');
    try {
      recognition.stop();
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
    recognition = null;
    isRecognitionActive = false;
  }
}

export function isListening() {
  return isRecognitionActive || recognition !== null;
}

// Abort recognition immediately
export function abortListening() {
  if (recognition) {
    console.log('🎤 Aborting speech recognition...');
    try {
      recognition.abort();
    } catch (error) {
      console.error('Error aborting recognition:', error);
    }
    recognition = null;
    isRecognitionActive = false;
  }
}

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════

export function isSupported() {
  return {
    tts: 'speechSynthesis' in window,
    stt: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
  };
}

// Load voices (some browsers need this)
if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = () => {
    speechSynthesis.getVoices();
  };
}

// ═══════════════════════════════════════════════════════════════
// OPENAI WHISPER (STT) - More accurate, requires API key
// ═══════════════════════════════════════════════════════════════

export function startWhisperListening(options = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      
      audioChunks = [];
      isRecognitionActive = true;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstart = () => {
        console.log('🎤 Whisper recording started');
        if (options.onStart) options.onStart();
      };
      
      mediaRecorder.onstop = async () => {
        isRecognitionActive = false;
        console.log('🎤 Whisper recording stopped');
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
        
        if (audioChunks.length === 0) {
          if (options.onEnd) options.onEnd('');
          resolve('');
          return;
        }
        
        try {
          // Create audio blob
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          audioChunks = [];
          
          // Convert to array buffer
          const arrayBuffer = await audioBlob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Send to main process for Whisper API call (API key from .env)
          const result = await window.clippy?.openaiWhisper({
            audioBlob: Array.from(uint8Array),
            language: options.lang || 'en-US',
          });
          
          if (result?.success && result.text) {
            console.log('✓ Whisper transcription:', result.text);
            if (options.onResult) options.onResult(result.text);
            if (options.onEnd) options.onEnd(result.text);
            resolve(result.text);
          } else {
            const error = result?.error || 'Transcription failed';
            console.error('❌ Whisper error:', error);
            if (options.onError) options.onError(error);
            reject(new Error(error));
          }
        } catch (error) {
          console.error('❌ Whisper processing error:', error);
          if (options.onError) options.onError(error.message);
          reject(error);
        }
      };
      
      mediaRecorder.onerror = (event) => {
        isRecognitionActive = false;
        console.error('🎤 Whisper recording error:', event.error);
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
        
        if (options.onError) options.onError(event.error);
        reject(new Error(event.error || 'Recording failed'));
      };
      
      // Start recording
      mediaRecorder.start();
      
    } catch (error) {
      isRecognitionActive = false;
      console.error('❌ Microphone access error:', error);
      
      let errorMessage = 'not-allowed';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'not-allowed';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'audio-capture';
      } else {
        errorMessage = error.message;
      }
      
      if (options.onError) options.onError(errorMessage);
      reject(new Error(errorMessage));
    }
  });
}

export function stopWhisperListening() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    console.log('🎤 Stopping Whisper recording...');
    mediaRecorder.stop();
  }
}

// Get available languages for speech recognition
// ═══════════════════════════════════════════════════════════════
// MACOS NATIVE SPEECH RECOGNITION - Best quality, offline
// ═══════════════════════════════════════════════════════════════

let macosRecognitionActive = false;

export async function startMacOSSpeechRecognition(options = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if available
      const availability = await window.clippy?.macosSpeechAvailable();
      if (!availability?.available) {
        reject(new Error('macOS Speech Recognition not available on this platform'));
        return;
      }

      macosRecognitionActive = true;
      console.log('🍎 Starting macOS native speech recognition...');
      
      if (options.onStart) {
        options.onStart();
      }

      // Start recognition
      const result = await window.clippy?.macosSpeechStart({
        language: options.lang || 'en-US'
      });

      macosRecognitionActive = false;

      if (result?.success && result.text) {
        console.log('🍎 macOS recognition result:', result.text);
        if (options.onResult) {
          options.onResult(result.text);
        }
        if (options.onEnd) {
          options.onEnd(result.text);
        }
        resolve(result.text);
      } else {
        const error = result?.error || 'Recognition failed';
        console.error('🍎 macOS recognition error:', error);
        if (options.onError) {
          options.onError(error);
        }
        reject(new Error(error));
      }
    } catch (error) {
      macosRecognitionActive = false;
      console.error('🍎 macOS recognition error:', error);
      if (options.onError) {
        options.onError(error.message);
      }
      reject(error);
    }
  });
}

export async function stopMacOSSpeechRecognition() {
  if (macosRecognitionActive) {
    console.log('🍎 Stopping macOS recognition...');
    await window.clippy?.macosSpeechStop();
    macosRecognitionActive = false;
  }
}

export async function isMacOSSpeechAvailable() {
  try {
    const result = await window.clippy?.macosSpeechAvailable();
    return result?.available || false;
  } catch {
    return false;
  }
}

export function getSupportedLanguages() {
  return [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)' },
    { code: 'ru-RU', name: 'Russian' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'hi-IN', name: 'Hindi' },
  ];
}

export default {
  speak,
  stop,
  isSpeaking,
  startListening,
  stopListening,
  abortListening,
  isListening,
  isSupported,
  getSupportedLanguages,
  startWhisperListening,
  stopWhisperListening,
  startMacOSSpeechRecognition,
  stopMacOSSpeechRecognition,
  isMacOSSpeechAvailable,
};





