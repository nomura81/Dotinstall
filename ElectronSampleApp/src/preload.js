const electron = require('electron');

// ender process で使用するパッケージの定義
process.once('loaded', () => {
    global.ipcRenderer = electron.ipcRenderer;
    global.remote = electron.remote;
})