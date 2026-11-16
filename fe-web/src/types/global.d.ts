export {};

// electron 通道 type
export type TElectronChannel =
  "electron:move"
  | "electron:process:list"
  | "electron:process:killProcessForPid"
  | "electron:process:killProcessForPName"
  | "electron:minimize"
  | "electron:unmaximize"
  | "electron:isMaximized"
  | "electron:maximize"
  | "electron:close";


export interface IIpcRenderer {
  invoke(channel: TElectronChannel, data?: any);
  send(channel: TElectronChannel, data?: any);
  on(
    channel: TElectronChannel,
    listener: (event: IpcRendererEvent, data?: any) => void,
  );
  removeAllListeners(channel: TElectronChannel)
}

declare global {
  interface Window {
    apiUrl?: string;
    ipcRenderer?: IIpcRenderer;
  }
}
