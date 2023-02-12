import chokidar from 'chokidar';
import { localWebServerPath } from 'src/build/config/buildConfig';
import { copyFolderRecursive } from 'src/utils/copyFiles';

export default {
    action: () => {
        return new Promise(async(resolve) => {
            await copyFolderRecursive('php', localWebServerPath);
            const watcher = chokidar.watch('php', {
                persistent: true,
                awaitWriteFinish: true,
            });
            const copyAction = async() => {
                await copyFolderRecursive('php', localWebServerPath);
            };
            watcher.on('change', copyAction);
            // watcher.on('add', copyAction);
            watcher.on('addDir', copyAction);
        });
    },
};