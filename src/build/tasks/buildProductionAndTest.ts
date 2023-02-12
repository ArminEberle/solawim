import { execSync } from 'child_process';
import { finalPluginPath, localWebServerPath } from 'src/build/config/buildConfig';
import { copyFolderRecursive } from 'src/utils/copyFiles';

export default {
    dependencies: ['buildProduction'],
    action: async() => {
        execSync('rm -rf ' + localWebServerPath + '*');
        await copyFolderRecursive(finalPluginPath, localWebServerPath);
    },
};