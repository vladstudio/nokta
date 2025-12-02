const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body }),
  setUnreadStatus: (hasUnread) => ipcRenderer.invoke('set-unread-status', hasUnread),
  isElectron: true
});
