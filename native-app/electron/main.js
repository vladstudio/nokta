const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, Notification, dialog } = require('electron');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const configPath = path.join(app.getPath('userData'), 'config.json');
const store = {
  get: (key) => { try { return JSON.parse(fs.readFileSync(configPath, 'utf8'))[key]; } catch { return undefined; } },
  set: (key, val) => { const data = store.getAll(); data[key] = val; fs.writeFileSync(configPath, JSON.stringify(data)); },
  delete: (key) => { const data = store.getAll(); delete data[key]; fs.writeFileSync(configPath, JSON.stringify(data)); },
  getAll: () => { try { return JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch { return {}; } }
};

let mainWindow, tray;

const promptServerUrl = () => {
  try {
    const result = execSync(`osascript -e 'display dialog "Enter your Nokta server URL:" default answer "https://" with title "Nokta"' -e 'text returned of result'`, { encoding: 'utf8' });
    return result.trim().replace(/\/+$/, '');
  } catch { return null; }
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200, height: 800, minWidth: 400, minHeight: 300,
    title: 'Nokta', show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true }
  });
  mainWindow.on('close', e => { e.preventDefault(); mainWindow.hide(); });

  let serverUrl = store.get('serverUrl');
  if (!serverUrl) {
    serverUrl = promptServerUrl();
    if (!serverUrl) { app.quit(); return; }
    store.set('serverUrl', serverUrl);
  }
  mainWindow.loadURL(serverUrl);
  mainWindow.once('ready-to-show', () => mainWindow.show());
};

const createTray = () => {
  const icon = nativeImage.createFromPath(path.join(__dirname, '../assets/icon-black.png')).resize({ width: 16, height: 16 });
  tray = new Tray(icon);
  tray.setToolTip('Nokta');

  const updateMenu = () => {
    const isAutostart = app.getLoginItemSettings().openAtLogin;
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Open Nokta', click: () => mainWindow.show() },
      { label: 'Start on Login', type: 'checkbox', checked: isAutostart, click: () => {
        app.setLoginItemSettings({ openAtLogin: !isAutostart });
        updateMenu();
      }},
      { type: 'separator' },
      { label: 'Change Server', click: () => {
        const url = promptServerUrl();
        if (url) { store.set('serverUrl', url); mainWindow.loadURL(url); }
        mainWindow.show();
      }},
      { label: 'Quit', click: () => { mainWindow.destroy(); app.quit(); }}
    ]));
  };
  updateMenu();
  tray.on('click', () => mainWindow.show());
};

app.whenReady().then(() => { createWindow(); createTray(); });
app.on('activate', () => mainWindow?.show());
app.on('window-all-closed', e => e.preventDefault());

// IPC for notifications from renderer
ipcMain.handle('show-notification', (_, { title, body }) => {
  if (Notification.isSupported()) new Notification({ title, body }).show();
});
