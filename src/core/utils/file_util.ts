import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { logPrint } from "./util";
import { AppConst } from "../app/AppConst";
import { simpleSafeSpawn } from "../utils/processes";

export async function downloadFile(url: string, targetPath: string): Promise<void> {
    logPrint("downloadFile", url, targetPath);
    return new Promise<void>(async (resolve, reject) => {
        try {
            if (!existsSync(AppConst.homePath)) {
                mkdirSync(AppConst.homePath, { recursive: true });
            }
            const response = await fetch(url);
            const buffer = Buffer.from(await response.arrayBuffer());
            writeFileSync(targetPath, buffer);
            response.arrayBuffer();
            Promise.resolve();
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

export async function zipFile(zipPath: string, targetPath: string): Promise<void> {
    logPrint("zipFile", zipPath, targetPath);
    return new Promise<void>(async (resolve, reject) => {
        try {
            if (AppConst.isWin) {
                await simpleSafeSpawn("powershell.exe", ["Expand-Archive", "-Path", zipPath, "-DestinationPath", targetPath]);
            } else {
                await simpleSafeSpawn("unzip", [zipPath, '-d', targetPath]);;
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

