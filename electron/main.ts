import { app, BrowserWindow } from 'electron';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import waitOn from 'wait-on';

let mainWindow: BrowserWindow;
let splashWindow: BrowserWindow;
let nextServer: ChildProcess;

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 700,
    height: 500,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
  });

  splashWindow.loadFile(path.join(__dirname, '..', 'assets', 'splash.html'));
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // don't show until ready
    title: 'ACASA - Automated Compliance Auditing Software with AI',
    icon: path.join(__dirname, '..', 'assets', 'acasa.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  mainWindow.loadURL('http://localhost:3000');

  // When ready, show main window and close splash
  mainWindow.webContents.on('did-finish-load', () => {
    if (splashWindow) splashWindow.close();
    mainWindow.show();
  });

  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(async () => {
  // 1) Show splash screen
  createSplashWindow();

  // 2) Launch Next.js standalone server
  const serverDir = path.join(__dirname, '..', '.next', 'standalone');
  nextServer = spawn(process.execPath, ['server.js'], {
    cwd: serverDir,
    stdio: 'inherit',
  });

  nextServer.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'ENOENT') return;
    console.error('Next.js server process error:', err);
  });

  // 3) Wait for Next.js to be ready
  try {
    await new Promise<void>((resolve, reject) => {
      waitOn({ resources: ['tcp:3000'] }, (err: Error | null) => {
        if (err) return reject(err);
        resolve();
      });
    });
  } catch (e) {
    console.error('Failed to start Next.js server:', e);
    app.quit();
    return;
  }

  // 4) Load main window
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// 5) Clean up on window close
app.on('window-all-closed', () => {
  if (nextServer) nextServer.kill();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
