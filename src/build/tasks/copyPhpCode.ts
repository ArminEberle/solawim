import { finalPluginPath } from 'src/build/config/buildConfig';
import { copyFolderRecursive } from 'src/utils/copyFiles';
import { getDefaultTaskProperties } from '../utils/getDefaultTaskProperties';
import { BuildTask } from '../types/BuildTask';

export default {
    ...getDefaultTaskProperties(__filename),
    action: (): Promise<void> => copyFolderRecursive('php', finalPluginPath),
} satisfies BuildTask;