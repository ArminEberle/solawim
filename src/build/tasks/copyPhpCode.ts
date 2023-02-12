import { finalPluginPath } from 'src/build/config/buildConfig';
import { copyFolderRecursive } from 'src/utils/copyFiles';

export default {
    action: (): Promise<void> => copyFolderRecursive('php', finalPluginPath),
    desc: '',
};