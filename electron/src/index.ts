import { app, BrowserWindow, Tray, Menu } from "electron";
import * as path from "path";
import electron from "./script/electron";

let isQuitting = false;

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
    mainWindow.loadFile(path.join(__dirname, "./fe-web-dist/index.html"));
  } else {
    // 打开开发工具，CTRL + SHIFT + I
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL("http://localhost:5173/");
  }

  mainWindow.on("close", (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  electron(mainWindow); // 初始化：electron

  return mainWindow;
}

function createTray(mainWindow: BrowserWindow) {
  const tray = new Tray(path.join(__dirname, "assets/icon-tray.png"));

  tray.setToolTip("electronmy-20261109");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "显示窗口",
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      },
    },
    { type: "separator" },
    {
      label: "退出",
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });

  tray.on("double-click", () => {
    mainWindow.show();
  });
}

app.whenReady().then(() => {
  const mainWindow = createWindow();

  createTray(mainWindow);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (!isQuitting) return;

  if (process.platform !== "darwin") {
    app.quit();
  }
});
