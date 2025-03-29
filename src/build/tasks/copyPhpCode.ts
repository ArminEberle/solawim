import { finalPluginPath } from 'src/build/config/buildConfig';
import { copyFolderRecursive } from 'src/utils/copyFiles';
import { BuildTask } from '../types/BuildTask';
import { getDefaultTaskProperties } from '../utils/getDefaultTaskProperties';

export default {
    ...getDefaultTaskProperties(__filename),
    action: (): Promise<void> => copyFolderRecursive('php', finalPluginPath),
} satisfies BuildTask;
