#!/usr/bin/env node
import { execSync } from 'child_process';

console.log('📎 Clippy AI');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Node: ${process.version}`);

try {
  const npmVersion = execSync('npm -v', { encoding: 'utf8' }).trim();
  console.log(`npm: v${npmVersion}`);
} catch {}

console.log('');
console.log('🔧 Available commands:');
console.log('  mise run dev           - Start dev server');
console.log('  mise run build         - Build for production');
console.log('  mise run format        - Format code with Prettier');
console.log('  mise run lint          - Lint code with ESLint');
console.log('  mise run new-component -- Name');
console.log('  mise run new-store     -- name');
console.log('  mise run new-service   -- name');
console.log('  mise run test-ollama   - Test Ollama connection');
console.log('  mise run test-gemini   - Test Gemini API');
console.log('  mise run clean         - Clean build artifacts');
console.log('  mise run reset         - Reset app settings');
console.log('');
console.log('📁 Project structure:');
console.log('  renderer/src/components/  - React components');
console.log('  renderer/src/store/       - Zustand stores');
console.log('  renderer/src/services/    - API services');
console.log('  electron/                 - Main process');







