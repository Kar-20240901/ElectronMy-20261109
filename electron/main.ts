import { app, BrowserWindow } from "electron";
import * as path from "path";
import electron from "./script/electron";

function createWindow() {
  const mainWindow = new BrowserWindow({
    minWidth: 800,
    minHeight: 700,

    webPreferences: {
      preload: path.join(__dirname, "./script/preload.js"),
    },

    frame: false, // 去掉默认的标题栏
    titleBarStyle: "customButtonsOnHover", // 隐藏mac左上角的红绿灯
  });

  if (app.isPackaged) {
    mainWindow.loadURL("http://localhost:5173/");
  } else {
    // 打开开发工具
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL("http://localhost:5173/");
  }

  electron(mainWindow); // 初始化：electron
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
