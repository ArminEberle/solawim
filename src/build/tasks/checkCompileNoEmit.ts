import { exec } from 'child_process';
import type { BuildTask } from 'src/build/types/BuildTask';
import { getDefaultTaskProperties } from 'src/build/utils/getDefaultTaskProperties';

export default {
    ...getDefaultTaskProperties(__filename),
    action: async () => {
        return new Promise<void>((resolve, reject) => {
            exec('yarn tsc --noEmit --project tsconfig.json', (error, stdout, _stderr) => {
                if (error) {
                    console.error(`Error during type checking`, stdout);
                    reject(error);
                    return;
                }
                console.log(`Type checking passed: ${stdout}`);
                resolve();
            });
        });
    },
} satisfies BuildTask;
