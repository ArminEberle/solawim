import { execSync, } from 'child_process';
import type { BuildTask, } from 'src/build/types/BuildTask';
import { getDefaultTaskProperties, } from 'src/build/utils/getDefaultTaskProperties';

export default {
    ...getDefaultTaskProperties(__filename),
    action: () => {
        execSync('rm -rf .build-tmp');
    },
} satisfies BuildTask;