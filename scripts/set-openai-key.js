#!/usr/bin/env node

/**
 * Quick script to set OpenAI API key in Clippy AI settings
 * Usage: node scripts/set-openai-key.js YOUR_API_KEY
 */

const Store = require('electron-store');
const path = require('path');

const apiKey = process.argv[2];

if (!apiKey) {
  console.error('❌ Error: No API key provided');
  console.log('\nUsage:');
  console.log('  node scripts/set-openai-key.js YOUR_API_KEY');
  console.log('\nExample:');
  console.log('  node scripts/set-openai-key.js sk-proj-abc123...');
  process.exit(1);
}

if (!apiKey.startsWith('sk-')) {
  console.warn('⚠️  Warning: OpenAI API keys usually start with "sk-"');
  console.warn('   Make sure you provided the correct key\n');
}

try {
  // Initialize electron-store (same as main process)
  const store = new Store();
  
  // Get current settings
  const currentSettings = store.get('settings', {});
  
  // Update with OpenAI API key
  const newSettings = {
    ...currentSettings,
    openaiApiKey: apiKey,
    sttProvider: 'openai', // Automatically switch to OpenAI Whisper
  };
  
  // Save settings
  store.set('settings', newSettings);
  
  console.log('✅ OpenAI API key saved successfully!');
  console.log('');
  console.log('Settings updated:');
  console.log('  • OpenAI API Key: ' + apiKey.substring(0, 15) + '...' + apiKey.substring(apiKey.length - 4));
  console.log('  • STT Provider: OpenAI Whisper (automatic)');
  console.log('');
  console.log('🎉 You can now use OpenAI Whisper for speech-to-text!');
  console.log('   Restart Clippy AI if it\'s running.');
  
} catch (error) {
  console.error('❌ Error saving API key:', error.message);
  process.exit(1);
}


