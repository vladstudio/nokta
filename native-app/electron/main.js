const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, Notification, net } = require('electron');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const configPath = path.join(app.getPath('userData'), 'config.json');
const store = {
  get: (key) => { try { return JSON.parse(fs.readFileSync(configPath, 'utf8'))[key]; } catch { return undefined; } },
  set: (key, val) => { const data = store.getAll(); data[key] = val; fs.writeFileSync(configPath, JSON.stringify(data)); },
  getAll: () => { try { return JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch { return {}; } }
};

let mainWindow, tray, trayIcons;

const promptServerUrl = () => {
  try {
    return execSync(`osascript -e 'display dialog "Enter your Nokta server URL:" default answer "https://" with title "Nokta"' -e 'text returned of result'`, { encoding: 'utf8' }).trim().replace(/\/+$/, '');
  } catch { return null; }
};

const validateServer = (url) => new Promise(resolve => {
  const req = net.request({ url: `${url}/api/nokta`, method: 'GET' });
  req.on('response', res => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => { try { resolve(JSON.parse(data).app === 'nokta'); } catch { resolve(false); } });
  });
  req.on('error', () => resolve(false));
  setTimeout(() => { req.abort(); resolve(false); }, 5000);
  req.end();
});

const showError = (msg) => execSync(`osascript -e 'display alert "Error" message "${msg}"'`);

const promptAndValidateServer = async () => {
  while (true) {
    const url = promptServerUrl();
    if (!url) return null;
    if (await validateServer(url)) return url;
    showError('Invalid Nokta server. Please check the URL and try again.');
  }
};

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1200, height: 800, minWidth: 400, minHeight: 300,
    title: 'Nokta', show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true }
  });
  mainWindow.on('close', e => { e.preventDefault(); mainWindow.hide(); });

  let serverUrl = store.get('serverUrl');
  if (!serverUrl || !(await validateServer(serverUrl))) {
    serverUrl = await promptAndValidateServer();
    if (!serverUrl) { app.quit(); return; }
    store.set('serverUrl', serverUrl);
  }
  mainWindow.loadURL(serverUrl);
  mainWindow.once('ready-to-show', () => mainWindow.show());
};

const createTray = () => {
  const createTemplateIcon = (filename) => {
    const icon = nativeImage.createFromPath(path.join(__dirname, '../assets', filename)).resize({ width: 16, height: 16 });
    icon.setTemplateImage(true);
    return icon;
  };
  trayIcons = { normal: createTemplateIcon('icon-black.png'), unread: createTemplateIcon('icon-black-unread.png') };
  tray = new Tray(trayIcons.normal);
  tray.setToolTip('Nokta');

  const updateMenu = () => {
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Open Nokta', click: () => mainWindow.show() },
      { label: 'Start on Login', type: 'checkbox', checked: app.getLoginItemSettings().openAtLogin, click: () => {
        app.setLoginItemSettings({ openAtLogin: !app.getLoginItemSettings().openAtLogin });
        updateMenu();
      }},
      { type: 'separator' },
      { label: 'Change Server', click: async () => {
        const url = await promptAndValidateServer();
        if (url) { store.set('serverUrl', url); mainWindow.loadURL(url); }
        mainWindow.show();
      }},
      { label: 'Quit', click: () => { mainWindow.destroy(); app.quit(); }}
    ]));
  };
  updateMenu();
  tray.on('click', () => mainWindow.show());
};

app.whenReady().then(async () => { await createWindow(); createTray(); });
app.on('activate', () => mainWindow?.show());
app.on('window-all-closed', e => e.preventDefault());

ipcMain.handle('show-notification', (_, { title, body }) => {
  if (Notification.isSupported()) new Notification({ title, body }).show();
});

ipcMain.handle('set-unread-status', (_, hasUnread) => {
  if (tray && trayIcons) tray.setImage(hasUnread ? trayIcons.unread : trayIcons.normal);
});
