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

export async function extractFile(archivePath: string, targetPath: string): Promise<void> {
    logPrint("extractFile", archivePath, targetPath);
    return new Promise<void>(async (resolve, reject) => {
        try {
            if (!existsSync(targetPath)) {
                mkdirSync(targetPath, { recursive: true });
            }
            const isZip = archivePath.endsWith(".zip");
            if (AppConst.isWin && isZip) {
                await simpleSafeSpawn("powershell.exe", ["Expand-Archive", "-Path", archivePath, "-DestinationPath", targetPath, "-Force"]);
            } else if (isZip) {
                await simpleSafeSpawn("unzip", [archivePath, "-d", targetPath]);
            } else {
                // .tar.gz / .tgz
                await simpleSafeSpawn("tar", ["-xzf", archivePath, "-C", targetPath]);
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

