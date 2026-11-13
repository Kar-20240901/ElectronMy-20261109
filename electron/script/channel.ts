// electron 通道 type
export type TElectronChannel =
   "electron:move"
  | "electron:process:list"
  | "electron:process:kill"
  | "electron:minimize"
  | "electron:unmaximize"
  | "electron:isMaximized"
  | "electron:maximize"
  | "electron:close";
