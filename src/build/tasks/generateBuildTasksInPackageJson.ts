import fs from 'fs';
import type { BuildTask } from 'src/build/types/BuildTask';
import { getDefaultTaskProperties, getTaskName } from 'src/build/utils/getDefaultTaskProperties';

export default {
    ...getDefaultTaskProperties(__filename),
    action: (_taskName: string) => {
        const scripts: Record<string, string> = {};
        for (const buildTask of fs.readdirSync('src/build/tasks')) {
            if (!buildTask.endsWith('.ts')) {
                continue;
            }
            const taskName = getTaskName(buildTask);
            scripts[taskName] = `tsx src/build/build.ts ${taskName}`;
            if (taskName.startsWith('dev')) {
                scripts[`${taskName}Debug`] = `tsx src/build/build.ts --debug ${taskName}`;
            }
        }
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        packageJson.scripts = scripts;
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    },
} satisfies BuildTask;
