import { execSync } from 'child_process';
import type { Task } from 'src/build/types/Task';

export default {
    action: (name: string) => {
        execSync('yarn vite serve .build-tmp/site --open index.html', {
            stdio: 'inherit',
        });
    },
    desc: 'This my description',
    dependencies: ['build'],
} as Task;