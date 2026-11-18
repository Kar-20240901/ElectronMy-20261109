import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { TElectronChannel } from "./channel";

window.addEventListener("DOMContentLoaded", () => {});

// 渲染进程（html）给主进程发送消息
contextBridge.exposeInMainWorld("ipcRenderer", {
  // 使用：.then，即可拿到返回值，备注：主进程要使用：ipcMain.handle(channel, listener) 接收才行
  invoke(channel: TElectronChannel, data?: any) {
    return ipcRenderer.invoke(channel, data);
  },

  // 需要使用：ipcRenderer.on(channel, listener)，才可以拿到主进程的返回值：ipcMain.on(channel, listener)
  send(channel: TElectronChannel, data?: any) {
    ipcRenderer.send(channel, data);
  },

  on(
    channel: TElectronChannel,
    listener: (event: IpcRendererEvent, data?: any) => void,
  ) {
    ipcRenderer.on(channel, listener);
  },

  removeAllListeners(channel: TElectronChannel) {
    ipcRenderer.removeAllListeners(channel);
  },
});
