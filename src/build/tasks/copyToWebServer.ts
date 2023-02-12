import { finalPluginPath, localWebServerPath } from 'src/build/config/buildConfig';
import { copyFolderRecursive } from 'src/utils/copyFiles';

export default {
    action: () => {
        copyFolderRecursive(finalPluginPath, localWebServerPath);
    },
    desc: '',
    dependencies: ['rewriteSolawimPhp'],
};