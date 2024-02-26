import { execSync } from 'child_process';
import { finalPluginPath, localWebServerPath } from 'src/build/config/buildConfig';
import { copyFolderRecursive } from 'src/utils/copyFiles';
import { BuildTask } from '../types/BuildTask';
import buildProduction from './buildProduction';
import { getDefaultTaskProperties } from '../utils/getDefaultTaskProperties';

export default {
    ...getDefaultTaskProperties(__filename),
    dependencies: [buildProduction],
    action: async() => {
        execSync('rm -rf ' + localWebServerPath + '*');
        await copyFolderRecursive(finalPluginPath, localWebServerPath);
    },
} satisfies BuildTask;