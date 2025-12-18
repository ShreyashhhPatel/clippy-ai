# 📋 Clippy AI - Project Rules

**Version:** 1.0  
**Last Updated:** December 2024

---

## 1️⃣ Project Identity & Goals

### Project Overview
Clippy AI is a floating desktop AI assistant built with Electron and React.
It provides instant AI access via a global shortcut without disrupting user workflow.

### Goals
- ✅ Fast, always-on-top AI access
- ✅ Local-first privacy with Ollama
- ✅ Optional cloud AI via Gemini
- ✅ Minimal UI, low cognitive load
- ✅ Cross-platform support (macOS, Windows, Linux)

### Non-Goals
- ❌ No full chat app replacement
- ❌ No background data collection
- ❌ No auto-start services without user consent
- ❌ No mobile platforms
- ❌ No browser extensions
- ❌ No enterprise auth or multi-user accounts

---

## 2️⃣ Supported Platforms & Scope

### Supported Platforms
- **macOS** (primary development platform)
- **Windows** (full support)
- **Linux** (best effort support)

### Out of Scope
- Mobile platforms (iOS, Android)
- Browser extensions
- Enterprise authentication
- Multi-user accounts
- Cloud synchronization

---

## 3️⃣ Architecture Rules

### Electron Main Process Handles:
- ✅ Window creation and management
- ✅ Global keyboard shortcuts
- ✅ System tray integration
- ✅ OS-level APIs
- ✅ File system operations
- ✅ Clipboard access
- ✅ Shell commands

### Renderer Process (React UI):
- ✅ React UI only
- ❌ No Node.js access
- ❌ No direct OS calls
- ✅ IPC communication only

### Communication Rules:
- ✅ IPC only via preload bridge
- ❌ No `remote` module usage
- ✅ All sensitive operations in main process
- ✅ Context bridge for secure API exposure

### File Structure:
```
clippy-ai/
├── electron/          # Main process
│   ├── main.cjs       # Window, tray, shortcuts
│   ├── preload.cjs    # Secure IPC bridge
│   └── ipcHandlers.cjs # API handlers
├── renderer/          # Renderer process
│   └── src/
│       ├── components/ # React components
│       ├── services/   # Business logic
│       └── store/      # State management
```

---

## 4️⃣ Security Rules

### Electron Security (CRITICAL):
```javascript
// MUST be enabled:
contextIsolation: true    // ✅ ENABLED
nodeIntegration: false    // ✅ DISABLED
webSecurity: true         // ✅ ENABLED
sandbox: true             // ✅ ENABLED (where possible)
```

### Sensitive Operations:
All of these MUST happen in main process ONLY:
- ✅ File system access
- ✅ Clipboard operations
- ✅ Shell command execution
- ✅ API key access
- ✅ Environment variable reading

### Secret Management:
- ❌ No secrets committed to repo
- ✅ API keys in `.env` file only
- ✅ `.env` MUST be in `.gitignore`
- ✅ Keys loaded via `process.env` in main process
- ❌ Never expose keys to renderer process
- ✅ UI shows status indicators only (✓ or ✗)

### Data Privacy:
- ✅ All data stored locally
- ✅ No telemetry or analytics
- ✅ No automatic updates without consent
- ✅ Clear provider indication (Local vs Cloud)

---

## 5️⃣ AI Provider Rules

### Local AI (Ollama)
- ✅ Default provider
- ✅ No network calls
- ✅ User must start Ollama manually
- ✅ Never send data externally
- ✅ Privacy-first approach

### Cloud AI (Gemini)
- ✅ Explicit user opt-in
- ✅ Show provider clearly in UI
- ✅ Fail gracefully if API key missing
- ✅ Warn about data being sent to cloud
- ✅ API key required

### General Provider Rules:
- ✅ Providers must be swappable via `llmService`
- ✅ UI must not depend on provider-specific logic
- ✅ Abstract provider interface in `services/llmService.js`
- ✅ Easy to add new providers
- ✅ Graceful degradation if provider unavailable

---

## 6️⃣ Command Handling Rules

### Supported Commands:
- ✅ Math evaluation (`2 + 2 * 5`)
- ✅ Open URLs (`open github.com`)
- ✅ Clipboard operations (`clipboard`, `summarize clipboard`)
- ✅ Copy text (`copy <text>`)

### Disallowed Commands:
- ❌ Arbitrary shell execution
- ❌ File deletion/modification
- ❌ Network scanning
- ❌ System configuration changes
- ❌ Process management

### Command Safety Rules:
All commands must:
- ✅ Be explicitly parsed in `commandParser.js`
- ✅ Have a safe fallback
- ✅ Return user-friendly errors
- ✅ Validate input before execution
- ✅ Never execute arbitrary code

### URL Handling:
- ✅ Auto-add `.com` if no extension provided
- ✅ Validate URL format before opening
- ✅ Use system default browser
- ✅ No JavaScript execution in URLs

---

## 7️⃣ UI / UX Rules

### Floating Window Behavior:
- ✅ Always stay on top
- ✅ Never steal focus unexpectedly
- ✅ Open/close via `Cmd/Ctrl + Shift + Space`
- ✅ Draggable by title bar
- ✅ Resizable
- ✅ Remember position on restart

### Animations:
- ✅ Subtle and fast (<300ms)
- ✅ No blocking animations
- ✅ Smooth transitions with Framer Motion
- ✅ 60fps target

### Design Principles:
- ✅ Glass-morphism preferred
- ✅ Minimal text density
- ✅ Keyboard-first interactions
- ✅ Clear visual hierarchy
- ✅ Accessible color contrast

### Keyboard Shortcuts:
- ✅ `Cmd/Ctrl + Shift + Space` - Toggle window
- ✅ `Cmd/Ctrl + K` - Start voice input (browser only)
- ✅ `Esc` - Stop recording / Close modals
- ✅ `Enter` - Submit message
- ✅ All shortcuts must be documented

### Voice Input (Browser Only):
- ✅ Microphone available in browser only
- ❌ No microphone in Electron app
- ✅ Clear indication of recording state
- ✅ Visual feedback during recording

---

## 8️⃣ State & Persistence Rules

### State Management:
- ✅ Zustand for global state
- ✅ Chat history stored locally only
- ❌ No cloud sync
- ✅ `electron-store` for persistent settings

### What to Persist:
- ✅ Provider selection (local/gemini)
- ✅ Model choice
- ✅ Assistant personality/style
- ✅ Window position and size
- ✅ User preferences (sound, language)

### What NOT to Persist:
- ❌ API responses
- ❌ Clipboard contents
- ❌ Temporary UI state
- ❌ Error messages
- ❌ API keys (use `.env` instead)

### Store Structure:
```javascript
// chatStore.js - Ephemeral
- messages (array)
- isLoading (boolean)

// settingsStore.js - Persistent
- provider (string)
- model (string)
- style (string)
- sound (boolean)
```

---

## 9️⃣ Error Handling Rules

### General Principles:
- ✅ Never crash the app
- ✅ Show friendly UI errors
- ✅ Log technical details to console only
- ✅ Provide actionable error messages
- ✅ Graceful degradation

### Specific Error Scenarios:

**Ollama not running:**
```
❌ "Ollama not found. Please start Ollama first."
✅ Show setup hint with link
```

**Gemini key missing:**
```
❌ "Gemini API key not configured."
✅ Prompt user to add key to .env file
```

**Network error:**
```
❌ "Network error. Check your connection."
✅ Suggest retry
```

**Microphone permission denied:**
```
❌ "Microphone access denied."
✅ Show system settings instructions
```

### Error Logging:
- ✅ Console logs for development
- ✅ No error reporting to external services
- ✅ User-friendly error messages in UI
- ✅ Technical details in DevTools only

---

## 🔟 Code Style & Structure Rules

### File Organization:
- ✅ One responsibility per file
- ✅ No business logic in React components
- ✅ Services live in `/services`
- ✅ IPC handlers isolated in `ipcHandlers.cjs`
- ✅ Components in `/components`
- ✅ State in `/store`

### Naming Conventions:
- ✅ `camelCase` for JavaScript/TypeScript variables
- ✅ `PascalCase` for React components
- ✅ `kebab-case` for file names
- ✅ `SCREAMING_SNAKE_CASE` for constants

### Code Quality:
- ✅ ESLint for linting
- ✅ Prettier for formatting (if configured)
- ✅ No `console.log` in production
- ✅ Use emoji prefixes for logs (🎤, ✅, ❌, ⚠️)
- ✅ Comments for complex logic only

### React Best Practices:
- ✅ Functional components only
- ✅ Hooks for state management
- ✅ Custom hooks for reusable logic
- ✅ Props destructuring
- ✅ Minimal prop drilling

---

## 1️⃣1️⃣ Contribution Guidelines

### Commit Standards:
- ✅ Small, focused commits
- ✅ Descriptive commit messages
- ✅ Format: `type: description`
  - `feat:` new feature
  - `fix:` bug fix
  - `docs:` documentation
  - `style:` formatting
  - `refactor:` code restructuring
  - `security:` security fixes

### Pull Request Rules:
- ✅ No direct pushes to main
- ✅ PRs must not break global shortcut
- ✅ Test all features before PR
- ✅ Update documentation if needed

### Testing Checklist:
- ✅ Global shortcut works
- ✅ Both Ollama and Gemini work
- ✅ Commands execute correctly
- ✅ Settings persist on restart
- ✅ No console errors
- ✅ Window behavior correct

---

## 1️⃣2️⃣ Demo & Recording Constraints

### Pre-Demo Checklist:
- ✅ Global shortcut must work before recording
- ✅ Ollama must be running
- ✅ DevTools closed during demo
- ✅ No debug logs visible
- ✅ Chat history cleared
- ✅ Clean desktop environment
- ✅ Do Not Disturb enabled

### Demo Safety Rules:
- ✅ Test all features before recording
- ✅ Have backup examples ready
- ✅ No profanity in examples
- ✅ Professional use cases only
- ✅ Blur API keys if showing settings

### Recording Environment:
- ✅ 1920x1080 resolution
- ✅ Clean desktop (no clutter)
- ✅ Close unnecessary apps
- ✅ Cursor highlighting enabled
- ✅ Smooth mouse movements

---

## 1️⃣3️⃣ Development Workflow

### Setup:
```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build for production
npm run build

# Package app
npm run package
```

### Environment Variables:
```env
# Required for OpenAI Whisper (browser only)
OPENAI_API_KEY=sk-proj-YOUR_KEY

# Required for Gemini
GEMINI_API_KEY=YOUR_KEY

# Development mode
NODE_ENV=development
```

### Development Tools:
- ✅ Vite for fast hot reload
- ✅ React DevTools (optional)
- ✅ Electron DevTools (`Cmd+Option+I`)

---

## 1️⃣4️⃣ Deployment Rules

### Building:
- ✅ Test on all platforms before release
- ✅ Version bump in `package.json`
- ✅ Update `CHANGELOG.md`
- ✅ Create GitHub release

### Distribution:
- ✅ macOS: `.dmg` file
- ✅ Windows: `.exe` installer
- ✅ Linux: `.AppImage`

### Release Checklist:
- ✅ All features tested
- ✅ No console errors
- ✅ Documentation updated
- ✅ Security audit passed
- ✅ No API keys in code
- ✅ `.env.example` provided

---

## 1️⃣5️⃣ Maintenance Rules

### Regular Tasks:
- ✅ Update dependencies monthly
- ✅ Rotate API keys every 90 days
- ✅ Review security best practices
- ✅ Test on latest OS versions
- ✅ Monitor API usage

### Breaking Changes:
- ✅ Document in `CHANGELOG.md`
- ✅ Provide migration guide
- ✅ Bump major version
- ✅ Notify users

---

## 📚 Quick Reference

### Key Files:
- `electron/main.cjs` - Main process entry
- `electron/preload.cjs` - IPC bridge
- `electron/ipcHandlers.cjs` - API handlers
- `renderer/src/App.jsx` - React root
- `renderer/src/services/llmService.js` - AI providers
- `renderer/src/services/commandParser.js` - Command handling
- `.env` - API keys (DO NOT COMMIT)

### Important Commands:
```bash
npm run dev          # Start development
npm run build        # Build for production
npm run package      # Package app
pkill -9 -f electron # Kill running app
```

### Useful Links:
- Ollama: https://ollama.ai
- Gemini API: https://ai.google.dev
- Electron Docs: https://electronjs.org
- React Docs: https://react.dev

---

## ✅ Rules Summary

1. **Security First** - Context isolation, no secrets in code
2. **Local-First** - Privacy with Ollama, cloud optional
3. **Clean Architecture** - Main/renderer separation, IPC only
4. **User Experience** - Fast, minimal, keyboard-first
5. **Code Quality** - One responsibility per file, clear naming
6. **Demo Ready** - Always testable, no debug artifacts
7. **Contribution Friendly** - Clear guidelines, small commits

---

**Remember:** These rules exist to keep the project secure, maintainable, and demo-ready. When in doubt, prioritize security and user privacy.

*Last updated: December 2024*

