import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export interface GithubAsset {
    name: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    browser_download_url: string;
}

export async function getScrcpyAsset(version?: string): Promise<GithubAsset | undefined> {
    // scrcpy 的 release tag 形如 `v2.4`，用户输入 `2.4` 时自动补 `v`
    const tag = version ? (version.startsWith("v") ? version : `v${version}`) : "";
    const apiUrl = tag
        ? `https://api.github.com/repos/Genymobile/scrcpy/releases/tags/${tag}`
        : "https://api.github.com/repos/Genymobile/scrcpy/releases/latest";
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const response = await fetch(apiUrl, { headers: { "User-Agent": "adb-helper" } });
    if (response.status === 404) {
        throw new Error(`can not find scrcpy version: ${version}`);
    }
    if (!response.ok) {
        throw new Error(`github api error: ${response.status}`);
    }
    const data = await response.json() as { assets: GithubAsset[] };
    const isWin = process.platform.startsWith("win");
    const isMac = process.platform.startsWith("darwin");
    const isLinux = process.platform.startsWith("linux");
    const arch = process.arch === "arm64" ? "aarch64" : "x64";
    let platformPrefix = "";
    if (isWin) {
        platformPrefix = "scrcpy-win64";
    } else if (isMac) {
        platformPrefix = `scrcpy-macos-${arch}`;
    } else if (isLinux) {
        platformPrefix = `scrcpy-linux-${arch}`;
    }
    if (!platformPrefix) {
        return undefined;
    }
    let asset = data.assets.find((a) => a.name.startsWith(platformPrefix));
    if (!asset) {
        const fallback = isWin ? "scrcpy-win64"
            : isMac ? "scrcpy-macos" : "scrcpy-linux";
        asset = data.assets.find((a) => a.name.startsWith(fallback));
    }
    return asset;
}

export function findScrcpyBinDir(root: string, depth = 0): string | undefined {
    if (depth > 6) {
        return undefined;
    }
    const isWin = process.platform.startsWith("win");
    const isMac = process.platform.startsWith("darwin");
    const isLinux = process.platform.startsWith("linux");
    const scrcpyName = isWin ? "scrcpy.exe" : "scrcpy";
    let entries: string[];
    try {
        entries = readdirSync(root);
    } catch {
        return undefined;
    }
    for (const e of entries) {
        const full = join(root, e);
        try {
            const st = statSync(full);
            if (st.isDirectory()) {
                const found = findScrcpyBinDir(full, depth + 1);
                if (found) {
                    return found;
                }
            } else if (e === scrcpyName) {
                return root;
            }
        } catch {
            // ignore
        }
    }
    return undefined;
}