import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('ipc', {
  send: (channel: string, data: any) => ipcRenderer.send(channel, data),
  on: (channel: string, callback: any) => ipcRenderer.on(channel, (_e, args) => callback(args)),
});
