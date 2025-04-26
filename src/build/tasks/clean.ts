import { execSync } from 'child_process';
import type { BuildTask } from 'src/build/types/BuildTask';
import { getDefaultTaskProperties } from 'src/build/utils/getDefaultTaskProperties';
import fs from 'fs';

export default {
    ...getDefaultTaskProperties(__filename),
    action: () => {
        return fs.promises
            .rm('.build-tmp', {
                recursive: true,
            })
            .catch(err => {
                if (err.code !== 'ENOENT') {
                    console.error('Error removing .build-tmp:', err);
                    throw err;
                }
            });
    },
} satisfies BuildTask;
