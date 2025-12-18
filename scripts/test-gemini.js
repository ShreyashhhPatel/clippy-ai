#!/usr/bin/env node

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.log('❌ GEMINI_API_KEY not set. Add it to .mise.local.toml');
  process.exit(1);
}

fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
  .then(res => res.json())
  .then(data => {
    if (data.models) {
      console.log('✅ Gemini API key is valid!');
      console.log(`📦 Available models: ${data.models.length}`);
    } else {
      console.log('❌ Error:', data.error?.message || 'Unknown error');
    }
  })
  .catch(err => {
    console.log('❌ Network error:', err.message);
  });







