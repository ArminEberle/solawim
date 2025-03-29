import { finalPluginPath, localWebServerPath } from 'src/build/config/buildConfig';
import { copyFolderRecursive } from 'src/utils/copyFiles';
import { BuildTask } from '../types/BuildTask';
import { getDefaultTaskProperties } from '../utils/getDefaultTaskProperties';
import rewriteSolawimPhp from './rewriteSolawimPhp';

export default {
    ...getDefaultTaskProperties(__filename),
    action: () => {
        copyFolderRecursive(finalPluginPath, localWebServerPath);
    },
    dependencies: [rewriteSolawimPhp],
} satisfies BuildTask;
