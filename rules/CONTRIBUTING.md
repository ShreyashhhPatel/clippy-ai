# 🤝 Contributing to Clippy AI

Thank you for your interest in contributing to Clippy AI!

---

## 📋 Before You Start

1. **Read the rules**: Check `RULES.md` for project guidelines
2. **Check existing issues**: See if your idea is already discussed
3. **Test the app**: Make sure you can run it locally

---

## 🚀 Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/clippy-ai.git
cd clippy-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

```bash
# Create .env file
cp .env.example .env

# Add your API keys (optional)
nano .env
```

### 4. Start Development

```bash
npm run dev
```

---

## 🎯 Contribution Areas

### 🐛 Bug Fixes
- Check existing issues
- Create a new issue if not found
- Reference issue in PR

### ✨ New Features
- Discuss in an issue first
- Follow architecture rules
- Update documentation

### 📚 Documentation
- Fix typos
- Improve clarity
- Add examples

### 🎨 UI/UX Improvements
- Keep glass-morphism style
- Maintain minimal design
- Test on all platforms

---

## 📝 Commit Guidelines

### Format
```
type: brief description

Longer explanation if needed
```

### Types
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting (no code change)
- `refactor:` Code restructuring
- `test:` Adding tests
- `security:` Security fixes
- `chore:` Maintenance

### Examples
```bash
git commit -m "feat: add keyboard shortcut for settings"
git commit -m "fix: global shortcut not working on Linux"
git commit -m "docs: update installation instructions"
git commit -m "security: sanitize command input"
```

---

## ✅ Pull Request Checklist

Before submitting a PR, ensure:

### Testing
- [ ] App starts without errors
- [ ] Global shortcut (`Cmd/Ctrl+Shift+Space`) works
- [ ] Both Ollama and Gemini providers work
- [ ] Commands execute correctly
- [ ] Settings persist on restart
- [ ] No console errors
- [ ] Tested on your platform (macOS/Windows/Linux)

### Code Quality
- [ ] Follows code style in `RULES.md`
- [ ] No hardcoded secrets or API keys
- [ ] No personal file paths
- [ ] Proper error handling
- [ ] Comments for complex logic

### Documentation
- [ ] Updated relevant docs
- [ ] Added comments if needed
- [ ] Updated `CHANGELOG.md` (if applicable)

### Security
- [ ] No `nodeIntegration` in renderer
- [ ] Sensitive ops in main process only
- [ ] Input validation for commands
- [ ] No arbitrary code execution

---

## 🔒 Security Guidelines

### Critical Rules
1. **Never commit API keys** - Use `.env` file
2. **Main process for sensitive ops** - File, shell, clipboard
3. **Validate all input** - Especially commands
4. **No arbitrary execution** - Whitelist commands only

### If You Find a Security Issue
- **Don't open a public issue**
- Email maintainer directly
- Provide details and reproduction steps

---

## 🎨 Code Style

### JavaScript/React
```javascript
// ✅ Good
export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Bad
export function calc(i) {
  let s = 0;
  for (let x of i) s += x.price;
  return s;
}
```

### Naming
- `camelCase` - variables, functions
- `PascalCase` - React components
- `kebab-case` - file names
- `SCREAMING_SNAKE_CASE` - constants

### File Structure
```
services/
  ├── llmService.js      # AI provider logic
  └── commandParser.js   # Command handling

components/
  ├── ChatWindow.jsx     # Main chat UI
  └── Settings.jsx       # Settings panel
```

---

## 🧪 Testing

### Manual Testing
```bash
# Start app
npm run dev

# Test checklist:
1. Global shortcut works
2. Chat with Ollama
3. Chat with Gemini (if key configured)
4. Try commands: open, math, clipboard
5. Change settings
6. Restart app (settings persist?)
7. Check for console errors
```

### Platform Testing
- **macOS**: Primary platform
- **Windows**: Test if possible
- **Linux**: Best effort

---

## 📚 Documentation Standards

### Code Comments
```javascript
// ✅ Good - explains WHY
// Use setTimeout to prevent race condition with IPC
setTimeout(() => window.close(), 100);

// ❌ Bad - explains WHAT (obvious)
// Close the window
window.close();
```

### Markdown Files
- Use clear headings
- Add code examples
- Include screenshots (if UI changes)
- Keep line length reasonable

---

## 🚫 What NOT to Contribute

### Out of Scope
- ❌ Mobile app versions
- ❌ Browser extensions
- ❌ Enterprise features (SSO, multi-user)
- ❌ Cloud sync
- ❌ Telemetry/analytics

### Architecture Violations
- ❌ Node.js in renderer process
- ❌ Bypassing IPC bridge
- ❌ Hardcoded secrets
- ❌ Arbitrary shell execution

---

## 🎯 Good First Issues

Looking for where to start? Try these:

### Easy
- Fix typos in documentation
- Add more assistant personalities
- Improve error messages
- Add keyboard shortcuts

### Medium
- Add new LLM provider
- Improve command parser
- Add more quick commands
- UI/UX improvements

### Advanced
- Cross-platform testing
- Performance optimization
- New architecture features
- Security enhancements

---

## 🤔 Questions?

- **General questions**: Open a discussion
- **Bug reports**: Open an issue
- **Feature requests**: Open an issue (discuss first)
- **Security issues**: Email maintainer

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

## 🙏 Thank You!

Every contribution helps make Clippy AI better!

### Recognition
Contributors will be:
- Listed in `CONTRIBUTORS.md`
- Mentioned in release notes
- Appreciated by the community ❤️

---

**Happy coding! 🚀**

*Last updated: December 2024*

