import { execSync, } from 'child_process';
import build from 'src/build/tasks/build';
import type { BuildTask, } from 'src/build/types/BuildTask';
import { getDefaultTaskProperties, } from 'src/build/utils/getDefaultTaskProperties';

export default {
    ...getDefaultTaskProperties(__filename),
    action: (name: string) => {
        console.log(name);
        execSync('yarn vite serve .build-tmp/site --open index.html', {
            stdio: 'inherit',
        });
    },
    dependencies: [build, ],
} satisfies BuildTask;