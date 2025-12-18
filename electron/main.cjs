const { app, BrowserWindow, Tray, Menu, globalShortcut, nativeImage, session } = require("electron");
const path = require("path");

// Load environment variables from .env file
require("dotenv").config({ path: path.join(__dirname, "../.env") });

require("./ipcHandlers.cjs");

// Speech recognition disabled in Electron - use browser version instead

let mainWindow;
let tray;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 380,
    height: 550,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    resizable: true,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      // Enable features needed for Speech Recognition
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  // No special permissions needed

  // Load the app
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  // Create a simple tray icon (16x16 for macOS)
  const icon = nativeImage.createFromDataURL(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFRSURBVDiNpZMxSwNBEIXf7t0lISQgaGNhYyFYWFj4A+wECwULC0H8A1ZaiIX4B+wEK0EQO7GwsBJsbKy0srC0sLGwiIiY3O7s2NwlZ84EfLDLMDPfvtkd4J+lGr0sy8ZE5BaAUEptW2v3O4lGCbyYTqcfI6I0LXsv8BKIbU9E5LWI3HifK/ByMpm8AmCtrVlrNwEchU6LQP7xAthAqmEAPpfL5csAAMBae2mtvQXgaDabXQAQxHF8GEXRBYDGbrfbbTabl8Ph8DyKogsR2REREJEzAI2u6y6llN1Op3OcZdl1/z4C0Hu9Xi+O42sRuQRQr9Vq9+v1+qn3/jAMw6soimZEZDedTq8AqH6//9RxnJkkSc4BNKy19SAIrgG0JpPJGQAt13UXATRY+0GSJOcAGvP5/DiO46soimaaptkFUB8Ohyd5np8DaOZ5fjKZTM7+9P2/6gt/NZLJHJEoJQAAAABJRU5ErkJggg=="
  );

  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show Clippy",
      click: () => mainWindow.show(),
    },
    {
      label: "Hide Clippy",
      click: () => mainWindow.hide(),
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("Clippy AI");
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Register global shortcut (Cmd+Shift+Space on Mac, Ctrl+Shift+Space on Windows/Linux)
  globalShortcut.register("CommandOrControl+Shift+Space", () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});


