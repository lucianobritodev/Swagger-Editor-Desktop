import * as electron from "electron";
import * as path from "path";

const { app, BrowserWindow, Tray, Menu, shell } = electron;
const baseURL: string = "https://editor.swagger.io";
const title: string = 'Swagger Editor Desktop'
const height: number = 600;
const width: number = 980;
const platform: string = process.platform || "linux";
const extensionIcon: string = platform === "win" ? "ico" : "png"; 

let showing: boolean = false;
let mainWindow: Electron.BrowserWindow;

function createWindow() {  
  mainWindow = new BrowserWindow({
    height,
    width,
    frame: true,
    title,
    roundedCorners: false,
    resizable: true,
    autoHideMenuBar: true,
    zoomToPageWidth: false,
    center: true,
    show: false,
    webPreferences: {
      //preload: path.join(__dirname, "/preload.js"),
      contextIsolation: false,
      nodeIntegration: true,
      devTools: false
    },
  });

  mainWindow.loadURL(baseURL);
}


function render(tray: electron.Tray) {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open",
      click: () => showOrHide()
    },
    {
      label: "Open in web browser",
      click: () => shell.openExternal(baseURL)
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => quit()
    }
  ]);

  tray.setIgnoreDoubleClickEvents(true)
  tray.setToolTip(title)
  tray.setContextMenu(contextMenu);

  tray.on('click', () => showOrHide());
  tray.on('right-click', () => contextMenu.popup());

}


function showOrHide() {
  showing = !showing;
  if(!showing)
    return mainWindow.hide();
  
  return mainWindow.show();
}


function quit() {
  mainWindow = null;
  app.exit(0);
}


if (app.dock) app.dock.hide();
if (!app.requestSingleInstanceLock()) quit();
app.disableHardwareAcceleration();


app.whenReady().then(() => {
  createWindow();

  const mainTray = new Tray(path.resolve(__dirname, '..', `assets/icons/Icon.${extensionIcon}`))
  render(mainTray);

  mainWindow.on('close', (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    showOrHide();
  });

});


app.on("window-all-closed", () => {
  if (platform !== "darwin") {
    app.quit();
  }
});