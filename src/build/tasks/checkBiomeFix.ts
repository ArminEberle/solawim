import { execSync } from 'child_process';
import type { BuildTask } from 'src/build/types/BuildTask';
import { getDefaultTaskProperties } from 'src/build/utils/getDefaultTaskProperties';

/**
 * Runs Biome on all configured files and fixes them where possible
 */
export default {
    ...getDefaultTaskProperties(__filename),
    action: (_taskName, taskLog) => {
        taskLog('Fixing Biome issues');
        execSync('yarn biome check --write .');
    },
    description: 'Runs biome on all TypeScript files and fixes them where possible',
} satisfies BuildTask;
