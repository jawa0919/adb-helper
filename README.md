# adb-helper

[![Marketplace Version](https://vsmarketplacebadge.apphb.com/version/jawa0919.adb-helper.svg)](https://marketplace.visualstudio.com/items?itemName=jawa0919.adb-helper) [![Installs](https://vsmarketplacebadge.apphb.com/installs/jawa0919.adb-helper.svg)](https://marketplace.visualstudio.com/items?itemName=jawa0919.adb-helper) [![Rating](https://vsmarketplacebadge.apphb.com/rating-star/jawa0919.adb-helper.svg)](https://marketplace.visualstudio.com/items?itemName=jawa0919.adb-helper) [![GitHub issues](https://img.shields.io/github/issues/jawa0919/adb-helper)](https://github.com/jawa0919/adb-helper/issues)

## Introduction

[【English】](./README.md)|[【中文】](./README_zh.md)

Help execute 'ADB' common commands. Device management, `ip/pair`connection, device screenshot, application management, file management.

![Home](./docs/img/home.png)

## Function

### AdbController

- [x] restartAdb: restart ADB
- [x] refreshDeviceManager：refresh Device/APK
- [x] ipConnect：input ip Connect devices.
- [x] ipConnectHistory：Displays the history of using ip connect
- [x] pairDevicesScanner：Scanner pair connect
- [x] pairDevicesUsingQRCode：Use QR Code pair connect
- [x] pairDevicesUsingCode：Use Code pair connect
- [x] installToDevice：Install the APK file in the workspace to the device
- [x] chooseApkFilter：Select APK type, -3:third-party(default), -s:system, -e:enabled, -d:disabled

![AdbController](./docs/img/AdbController.gif)

### DeviceController

- [x] screenshot
- [x] installApk
- [x] inputText
- [x] showDeviceInfo
- [x] startScrcpy: start Scrcpy [https://github.com/Genymobile/scrcpy](https://github.com/Genymobile/scrcpy)
- [x] rebootDevice:
- [x] powerOffDevice:
- [x] useIpConnect: Connect using IP

![DeviceController](./docs/img/DeviceController.gif)

### ApkController

- [x] wipeApkData:
- [x] uninstallApk:
- [x] exportApk:
- [x] stopApk:
- [x] copeApkId:

![ApkController](./docs/img/ApkController.png)

### ExplorerController

- [x] refreshExplorerManager
- [x] chooseDevice
- [x] chooseRootPath

### FileController

> In the file management system, the open file is a copy of the local image of the device file.

> In the `/data/data/` directory, the directory cannot be obtained due to lack of permission. The related file directory is simulated.

- [x] openFile
- [x] openInTheSide
- [x] openInLocalExplorer
- [x] newFolder
- [x] copyPath
- [x] rename
- [x] delete
- [x] uploadFile
- [x] uploadFolder
- [x] saveAs

![FileController](./docs/img/FileController.png)

### daemon

> When 'flutter' is not found, you need click `refreshDeviceManager` to update the device list.

- [x] flutter daemon: Monitor device connection / disconnection. Auto refresh list

## Configure

- [x] explorerRootPathList: Quick access list, the first item in the default list is displayed

  ```json
  [
      "/sdcard/",
      "/",
      "/data/data/",
      "/sdcard/Android/data/",
      "/sdcard/DCIM/",
      "/sdcard/Download/",
  ],
  ```

- [x] adbBinPath
- [x] androidSdkPath
- [x] flutterSdkPath
- [x] scrcpyBinPath

  If you have configured relevant environment variables, the relevant configuration can be ignored

## About

[https://github.com/Genymobile/scrcpy](https://github.com/Genymobile/scrcpy)

## Last

You are welcome to put forward your ideas and feedback [issues](https://github.com/jawa0919/adb-helper/issues)
