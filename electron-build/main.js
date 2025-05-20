"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const wait_on_1 = __importDefault(require("wait-on"));
let mainWindow;
let splashWindow;
let nextServer;
function createSplashWindow() {
    splashWindow = new electron_1.BrowserWindow({
        width: 700,
        height: 500,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: false,
        skipTaskbar: true,
    });
    splashWindow.loadFile(path_1.default.join(__dirname, '..', 'assets', 'splash.html'));
}
function createMainWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        show: false, // don't show until ready
        title: 'ACASA - Automated Compliance Auditing Software with AI',
        icon: path_1.default.join(__dirname, '..', 'assets', 'acasa.png'),
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
    });
    mainWindow.loadURL('http://localhost:3000');
    // When ready, show main window and close splash
    mainWindow.webContents.on('did-finish-load', () => {
        if (splashWindow)
            splashWindow.close();
        mainWindow.show();
    });
    mainWindow.setMenuBarVisibility(false);
}
electron_1.app.whenReady().then(async () => {
    // 1) Show splash screen
    createSplashWindow();
    // 2) Launch Next.js standalone server
    const serverDir = path_1.default.join(__dirname, '..', '.next', 'standalone');
    nextServer = (0, child_process_1.spawn)(process.execPath, ['server.js'], {
        cwd: serverDir,
        stdio: 'inherit',
    });
    nextServer.on('error', (err) => {
        if (err.code === 'ENOENT')
            return;
        console.error('Next.js server process error:', err);
    });
    // 3) Wait for Next.js to be ready
    try {
        await new Promise((resolve, reject) => {
            (0, wait_on_1.default)({ resources: ['tcp:3000'] }, (err) => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
    catch (e) {
        console.error('Failed to start Next.js server:', e);
        electron_1.app.quit();
        return;
    }
    // 4) Load main window
    createMainWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});
// 5) Clean up on window close
electron_1.app.on('window-all-closed', () => {
    if (nextServer)
        nextServer.kill();
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
//# sourceMappingURL=main.js.map