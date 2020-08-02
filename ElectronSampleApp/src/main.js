/**
 * ドットインストールの Electron 入門で作成したアプリ
 * https://dotinstall.com/lessons/basic_electron
 *
 * - main ウィンドウをクリックするとランダムで名言を表示
 * - 右クリックで背景色を変更可能
 * - アプリメニューで
 *   - About ダイアログを表示
 *   - settings ウィンドウを表示、ラジオボタンで背景色を変更可能
 *   - アプリを終了
 * - アプリ起動から3秒後にウェブサイトへアクセスさせる通知を表示
 */

'use strict';

// electron モジュールの読み込み
const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');

let mainWindow;
let settingWindow;

// メニューに表示させるものを定義
let menuTemplate = [{

    // Macの場合、最初のメニュー名は必ずアプリ名になる
    label: 'MyApp',
    submenu: [
        // { type: 'separator' } は区切り線
        // accelerator はショートカットキー
        // CmdOrCtrl は Command キーまたは Ctrl キー
        { label: 'About', accelerator: 'CmdOrCtrl+Shift+A', click: function() { showAboutDialog(); } },
        { type: 'separator' },  // 区切り線
        { label: 'Settings', accelerator: 'CmdOrCtrl+,', click: function() { showSettingsWindow(); }  },
        { type: 'separator' }, // 区切り線
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: function() { app.quit() } }
    ]
}];
let menu = Menu.buildFromTemplate(menuTemplate);

/**
 * ipc 通信で render process (index.html) に背景色情報を渡す
 */
ipcMain.on('settings_changed', (event, color) => {
    mainWindow.webContents.send('set_bgcolor', color);
});

/**
 * About ダイアログを表示
 */
function showAboutDialog() {
    dialog.showMessageBox({
        type: 'info',
        buttons: ['OK'],
        message: 'About This App',
        detail: 'This app was created by @dotinstall'
    });
}

/**
 * Settings ウィンドウを描画
 */
function showSettingsWindow() {

    // ウィンドウを生成する
    settingWindow = new BrowserWindow({  // BrowserWindow のオプション https://www.electronjs.org/docs/api/browser-window
        width: 600,
        height: 400,
        webPreferences: {                // レンダラープロセスで node モジュールを使うための設定、preload.js でモジュールを読み込んでおく
            nodeIntegration: false,
            contextIsolation: false,
            preload: __dirname + "/preload.js"
        }
    });
    settingWindow.loadURL('file://' + __dirname + '/settings.html');  // ファイルの読み込み、__dirname は現在のディレクトリ名
    settingWindow.webContents.openDevTools();                         // Chrome の DevTool でデバッグ
    // settingWindow.show();

    // ウィンドウが閉じられたときの処理
    settingWindow.on('closed', function() {
        settingWindow = null;
    });
}

/**
 * ウィンドウを描画する関数
 */
function createWindow() {

    // メニューを設定する
    Menu.setApplicationMenu(menu);

    // main ウィンドウを生成
    mainWindow = new BrowserWindow({  // BrowserWindow のオプション https://www.electronjs.org/docs/api/browser-window
        width: 600,
        height: 400,
        webPreferences: {             // レンダラープロセスで node モジュールを使うための設定、preload.js でモジュールを読み込んでおく
            nodeIntegration: false,
            contextIsolation: false,
            preload: __dirname + "/preload.js"
        }
    });
    mainWindow.loadURL('file://' + __dirname + '/index.html');  // ファイルの読み込み、__dirname は現在のディレクトリ名
    // mainWindow.webContents.openDevTools();                      // Chrome の DevTool でデバッグ

    // ウィンドウが閉じられたときの処理
    mainWindow.on('closed', function() {
        mainWindow = null;
    });
}

/**
 * アプリの初期化が終わったときに呼び出されるイベント
 */
app.on('ready', function() {
    createWindow();
});

/**
 * 全てのウィンドウが閉じられたときに呼び出されるイベント
 */
app.on('window-all-closed', function() {

    // Mac だとウィンドウが閉じられてもアプリが終了するわけではない、ドッグメニューやスポットライトから呼び出せる
    // Window や Linux の場合は終了

    // Mac 以外のOSの場合
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

/**
 * Mac でドッグメニューやスポットライトからアプリを呼び出したときに呼び出されるイベント
 */
app.on('activate', function() {
    if (mainWindow === null) {
        createWindow();
    }
});