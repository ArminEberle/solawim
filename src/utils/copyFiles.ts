import fs from 'fs';
import path from 'path';
import { ensureParentDirExists } from 'src/utils/ensureParentDirExists';

/**
 * Copies a file from sourcePath to destPath, ensuring that the destination directory exists.
 * @param sourcePath
 * @param destPath
 */
export const copyFile = async (sourcePath: string, destPath: string): Promise<void> => {
    await ensureParentDirExists(destPath);
    return fs.promises.copyFile(sourcePath, destPath);
};

export async function copyFolderRecursiveAndWatch(source: string, target: string): Promise<void> {
    await copyFolderRecursive(source, target);
    fs.watch(source, { recursive: true }, async (eventType, filename) => {
        if (eventType === 'change') {
            await copyFile(path.join(source, filename), path.join(target, filename));
        }
    });
}

export async function copyFolderRecursive(source: string, target: string): Promise<void> {
    let files = [];

    // Check if folder needs to be created or integrated
    await fs.promises.mkdir(target, { recursive: true });

    // Copy
    if ((await fs.promises.lstat(source)).isDirectory()) {
        files = await fs.promises.readdir(source);
        await Promise.all(
            files.map(file =>
                (async function () {
                    const curSource = path.join(source, file);
                    const targetPath = path.join(target, file);
                    if ((await fs.promises.lstat(curSource)).isDirectory()) {
                        await copyFolderRecursive(curSource, targetPath);
                    } else {
                        await copyFile(curSource, targetPath);
                    }
                })(),
            ),
        );
    }
}
