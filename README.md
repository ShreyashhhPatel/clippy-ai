# 📎 Clippy AI

A modern, floating AI desktop assistant powered by OpenAI. Clippy is back, and this time with GPT-4!

![Clippy AI Preview](./docs/preview.png)

## ✨ Features

- **🪟 Floating Widget** - Always-on-top, draggable assistant window
- **💬 AI Chat** - Powered by OpenAI GPT-4o/GPT-4/GPT-3.5
- **⚡ Quick Commands**:
  - `open google.com` - Open websites
  - `summarize clipboard` - Summarize clipboard content
  - `2 + 2 * 5` - Quick math calculations
  - `copy text here` - Copy text to clipboard
- **🎨 Multiple Personalities** - Switch between different assistant styles
- **📜 Chat History** - Persistent conversation history
- **⌨️ Global Shortcut** - Toggle with `Cmd/Ctrl + Shift + Space`
- **🖥️ Cross-Platform** - Works on macOS, Windows, and Linux

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Desktop Framework | Electron.js |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Animations | Framer Motion |
| AI Integration | OpenAI API |
| Storage | electron-store |
| Packaging | electron-builder |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/ShreyashhhPatel/clippy-ai.git
cd clippy-ai

# Install dependencies
npm install

# Start development
npm run dev
```

### Configuration

1. Launch the app
2. Click the ⚙️ settings icon
3. Enter your OpenAI API key
4. Choose your preferred model and assistant style

## 📦 Building for Production

```bash
# Build for current platform
npm run dist

# Build for specific platform
npm run dist:mac
npm run dist:win
npm run dist:linux
```

Built packages will be in the `release/` directory.

## 🎮 Commands

| Command | Description |
|---------|-------------|
| `open <url>` | Open a website in default browser |
| `summarize clipboard` | Summarize text from clipboard using AI |
| `clipboard` | Show clipboard contents |
| `copy <text>` | Copy text to clipboard |
| `<math expression>` | Evaluate math (e.g., `2+2*5`) |

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Shift + Space` | Toggle Clippy visibility |

## 🎨 Assistant Styles

- **Default** - Friendly and helpful
- **Concise** - Brief, to-the-point responses
- **Developer** - Technical, code-focused
- **Creative** - Imaginative and playful
- **Professional** - Formal business tone

## 📁 Project Structure

```
clippy-ai/
├── electron/
│   ├── main.js          # Electron main process
│   ├── preload.js       # Secure IPC bridge
│   └── ipcHandlers.js   # Command handlers
├── renderer/
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── components/
│       │   ├── ChatWindow.jsx
│       │   ├── Message.jsx
│       │   ├── CommandBar.jsx
│       │   ├── Settings.jsx
│       │   └── TitleBar.jsx
│       ├── store/
│       │   ├── chatStore.js
│       │   └── settingsStore.js
│       ├── services/
│       │   ├── llmService.js
│       │   └── commandParser.js
│       └── styles/
│           └── index.css
├── package.json
├── vite.config.js
├── tailwind.config.js
└── electron-builder.yml
```

## 🔒 Security

- Uses Electron's `contextBridge` for secure IPC
- No `nodeIntegration` in renderer
- API key stored locally using electron-store
- All sensitive operations handled in main process

## 🛣️ Roadmap

- [ ] Voice input (Web Speech API)
- [ ] Screenshot capture & analysis
- [ ] Local LLM support (Ollama)
- [ ] Plugin system
- [ ] Auto-start on boot
- [ ] Conversation export

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

**Built with ❤️ and AI assistance**

*Time taken: ~2 hours*
*AI Tool: Claude (Anthropic) via Cursor IDE*








