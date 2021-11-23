# adb-helper

[![Marketplace Version](https://vsmarketplacebadge.apphb.com/version/jawa0919.adb-helper.svg)](https://marketplace.visualstudio.com/items?itemName=jawa0919.adb-helper) [![Installs](https://vsmarketplacebadge.apphb.com/installs/jawa0919.adb-helper.svg)](https://marketplace.visualstudio.com/items?itemName=jawa0919.adb-helper) [![Rating](https://vsmarketplacebadge.apphb.com/rating-star/jawa0919.adb-helper.svg)](https://marketplace.visualstudio.com/items?itemName=jawa0919.adb-helper) [![GitHub issues](https://img.shields.io/github/issues/jawa0919/adb-helper)](https://github.com/jawa0919/adb-helper/issues)

## introduction

[【中文】](./README_CN.md)

Assist in executing common ADB commands. At present, the functions include device management, WiFi connection, screenshot, application management and file management.

![Home](./docs/assets/v3/homeV3.png)

## update

- Application manager, which is used to manage the management of third-party applications on the device。

- File manager, used to manage various files on the device, similar to Android studio file management。

## Function

1. Application manager, including creating new folders, exporting files / folders, importing files, importing folders, deleting files / folders, and copying file paths.

2. adbWifi manager，Connect Android devices to the computer through WiFi, which can replace USB connection.

   ![wifiV3](./docs/assets/v3/wifiV3.gif)

3. File Management, including creating new folders, exporting files / folders, importing files, importing folders, deleting files / folders, and copying file paths.

   ![explorer](./docs/assets/v3/explorerV3.png)

   You can configure the root path. Pay attention to some permissions

   ```json
   {
     "adb-helper.explorerRootPathList": ["/", "/sdcard/Download/", "/sdcard/DCIM/", "/sdcard/Music/", "/sdcard/Android/data/"]
   }
   ```

   ![explorer](./docs/assets/v3/explorerRootPathV3.gif)

4. Screenshot

5. USB Connection listening （Implementation using Fluent SDK）

## adb

You are welcome to put forward your ideas and feedback [issues](https://github.com/jawa0919/adb-helper/issues)

```
Android Debug Bridge version 1.0.41
Version 31.0.3-7562133
Installed as E:\sdk\android\platform-tools\adb.exe
```
