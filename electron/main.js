const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// --- 窗口尺寸持久化 ---
const STATE_FILE = path.join(app.getPath('userData'), 'window-state.json');

function loadWindowState() {
    try {
        return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    } catch {
        return { width: 1280, height: 800 };
    }
}

function saveWindowState() {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const bounds = mainWindow.getBounds();
    const isMax = mainWindow.isMaximized();
    fs.writeFileSync(STATE_FILE, JSON.stringify({ ...bounds, isMaximized: isMax }));
}

function createWindow() {
    const state = loadWindowState();

    mainWindow = new BrowserWindow({
        width: state.width,
        height: state.height,
        x: state.x,
        y: state.y,
        title: '编程拾光',
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        autoHideMenuBar: true,
        show: false
    });

    if (state.isMaximized) mainWindow.maximize();
    mainWindow.show();

    mainWindow.loadFile(getGamePath('index.html'));

    // 页面加载完成后，如果是子游戏页面则注入"返回首页"按钮
    mainWindow.webContents.on('did-finish-load', () => {
        const url = mainWindow.webContents.getURL();
        // 门户首页的 URL 以 /index.html 结尾，且前一段路径是 game 或 app 根目录
        // 子游戏 URL 形如 .../吃豆人/index.html，即 index.html 前有游戏文件夹名
        const normalized = decodeURIComponent(url).replace(/\\/g, '/');
        const parts = normalized.split('/');
        const htmlIndex = parts.lastIndexOf('index.html');
        // 门户首页：index.html 直接在根目录下（前一级不是游戏子文件夹）
        const isPortal = htmlIndex >= 1 && (
            parts[htmlIndex - 1] === 'game' ||  // 开发模式
            parts[htmlIndex - 1] === 'app'      // 打包后 resources/app/
        );
        if (!isPortal) {
            mainWindow.webContents.executeJavaScript(getBackButtonScript());
        }
    });

    // 保存窗口状态
    mainWindow.on('close', saveWindowState);
    mainWindow.on('closed', () => { mainWindow = null; });

    // 游戏页面返回拦截：Alt+Left 或鼠标后退 → 回到门户首页
    mainWindow.webContents.on('before-input-event', (_e, input) => {
        if (input.alt && input.key === 'ArrowLeft') {
            navigateBackToPortal();
        }
    });
}

function navigateBackToPortal() {
    if (!mainWindow) return;
    const url = mainWindow.webContents.getURL();
    // 如果当前不在门户首页，回到首页
    if (!url.endsWith('index.html') || url.includes('/')) {
        mainWindow.loadFile(getGamePath('index.html'));
    }
}

// 获取游戏文件路径 — 开发环境用 ../ ，打包后用 resources/app/
function getGamePath(relativePath) {
    if (app.isPackaged) {
        return path.join(process.resourcesPath, 'app', relativePath);
    }
    return path.join(__dirname, '..', relativePath);
}

// 注入"返回首页"浮动按钮的 JS 代码
function getBackButtonScript() {
    return `
    (function() {
        if (document.getElementById('electron-back-btn')) return;
        const btn = document.createElement('button');
        btn.id = 'electron-back-btn';
        btn.textContent = '← 首页';
        btn.style.cssText = 'position:fixed;top:12px;left:12px;z-index:99999;' +
            'padding:6px 14px;border:none;border-radius:8px;cursor:pointer;' +
            'background:rgba(99,102,241,0.85);color:#fff;font-size:14px;' +
            'font-family:system-ui,sans-serif;backdrop-filter:blur(8px);' +
            'box-shadow:0 2px 8px rgba(0,0,0,0.3);transition:all 0.2s;opacity:0.7;';
        btn.addEventListener('mouseenter', function() { btn.style.opacity='1'; btn.style.transform='scale(1.05)'; });
        btn.addEventListener('mouseleave', function() { btn.style.opacity='0.7'; btn.style.transform='scale(1)'; });
        btn.addEventListener('click', function() { window.location.href = '../index.html'; });
        document.body.appendChild(btn);
    })();
    `;
}

app.whenReady().then(() => {
    createWindow();

    // F11 切换全屏
    globalShortcut.register('F11', () => {
        if (mainWindow) {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
    });

    // ESC 退出全屏
    globalShortcut.register('Escape', () => {
        if (mainWindow && mainWindow.isFullScreen()) {
            mainWindow.setFullScreen(false);
        }
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
