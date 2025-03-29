import path from 'path';
import type { BuildTask } from 'src/build/types/BuildTask';

export const buildBasePath = path.join(process.cwd(), '.build-tmp');

export const getTaskName = (taskModulePath: string): string => {
    let taskName = taskModulePath.replace(/\\/g, '/').split('/').pop()!;
    if (taskName.endsWith('.ts')) {
        taskName = taskName.substring(0, taskName.length - 3);
    }
    return taskName;
};

export const getDefaultTaskProperties = (
    taskModulePath: string,
): Pick<BuildTask, 'name' | 'outputFolder' | 'runMode' | 'watchMode' | 'dependencies'> => ({
    name: getTaskName(taskModulePath),
    outputFolder: path.join(buildBasePath, getTaskName(taskModulePath)),
    runMode: undefined,
    watchMode: undefined,
    dependencies: [],
});
