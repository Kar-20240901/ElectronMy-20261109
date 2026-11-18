const fs = require("fs");
const path = require("path");

const src = path.resolve("src/assets/icon-tray.png");
const destDir = path.resolve("electron-dist/src/assets");
const dest = path.join(destDir, "icon-tray.png");

if (!fs.existsSync(dest)) {
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
}
