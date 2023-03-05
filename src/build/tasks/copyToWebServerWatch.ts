import chokidar from 'chokidar';
import { Stats } from 'fs';
import { localWebServerPath } from 'src/build/config/buildConfig';
import { copyFile, copyFolderRecursive } from 'src/utils/copyFiles';
import fs from 'fs/promises';
import path from 'path';
import { clearInterval } from 'timers';

export default {
    action: () => {
        const delay = 200;
        const filesToCopy = new Set<string>();
        const filesToDelete = new Set<string>();
        return new Promise(async () => {
            let interval: NodeJS.Timer | null;
            const intervalAction = async () => {
                const workerPromises: Promise<void>[] = [];
                if (filesToCopy.size > 0) {
                    for (const filePath of filesToCopy) {
                        const targetPath = path.join(localWebServerPath, filePath);
                        console.log('copying ', filePath, ' to ' + targetPath);
                        workerPromises.push(copyFile(filePath, targetPath));
                    }
                    filesToCopy.clear();
                }
                if (filesToDelete.size > 0) {
                    for (const filePath of filesToDelete) {
                        const targetPath = path.join(localWebServerPath, filePath);
                        console.log('deleting ' + targetPath);
                        workerPromises.push(fs.lstat(targetPath).then(async stat => {
                            if (stat.isDirectory()) {
                                await fs.rmdir(targetPath);
                            } else {
                                await fs.rm(targetPath);
                            }
                        }));
                    }
                    filesToDelete.clear();
                }
                await Promise.all(workerPromises);
                if(filesToCopy.size === 0 && filesToDelete.size === 0) {
                    clearInterval(interval as NodeJS.Timer);
                    interval = null;
                }
            };
            interval = setInterval(intervalAction, delay);
            const watcher = chokidar.watch('php', {
                persistent: true,
                awaitWriteFinish: true,
                atomic: true,
                ignoreInitial: true,
            });
            const addAction = async (path: string, stats: Stats) => {
                if (stats.isDirectory()) {
                    return;
                }
                if (!interval) {
                    interval = setInterval(intervalAction, delay);
                }
                filesToCopy.add(path);
                filesToDelete.delete(path);
            };
            const deleteAction = async (path: string) => {
                if (!interval) {
                    interval = setInterval(intervalAction, delay);
                }
                filesToDelete.add(path);
                filesToCopy.delete(path);
            };
            watcher.on('add', addAction);
            watcher.on('change', addAction);
            watcher.on('unlink', deleteAction);
            await copyFolderRecursive('php', localWebServerPath);
        });
    },
};