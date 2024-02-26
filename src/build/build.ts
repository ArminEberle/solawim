/* eslint-disable no-await-in-loop */
import fs from 'fs';
import path from 'path';
import type { BuildTask, BuildTaskLog } from 'src/build/types/BuildTask';
import url from 'url';

/**
 * This is the main build script. It is called from the command line and
 * executes the build tasks that are passed as arguments.
 *
 * About build execution:
 * ======================
 *
 * Build tasks are executed like so, from the command line, in the root of the repository:
 * yarn tsx src/build/build.ts <--switch1 | task1 | argToTheBuildTask1> <--switchN | taskN | argToTheBuildTaskN>
 *
 * The build tasks are executed in the order in which they are passed as arguments.
 * However, build tasks may have dependencies on other build tasks.
 * In this case, the dependencies are executed before the build task itself is executed.
 * This may change the order in which the build tasks are executed even if you specified
 * it differently on the command line.
 *
 * A build run runs in a certain build mode {@link buildMode}, and possibly for a certain
 * runtimeTarget {@link runtimeTarget}.
 * Tasks may read out the build mode and the runtimeTarget and behave accordingly.
 * The buildMode and runtimeTarget can be set via command line switches.
 *
 * Build modes are dev, watch, and prod.
 * - prod (switch --prod): The default build mode. The build result is obfuscated and compressed.
 * - dev (switch --dev): The build result is not obfuscated.
 * - watch (switch --watch): The build result is not obfuscated and the build process is started in watch mode.
 *
 * RuntimeTargets are webpq, iot, regdn, and regdn-cloud (switches --webpq, --iot, --regdn, --regdn-cloud).
 * See {@link runtimeConfigurations} for details.
 * The runtimeTarget is used to determine the runtime configuration when building the client in *watch* mode.
 *
 * In addition to that, there is a buildWithDependencies switch (--no-deps).
 * If this switch is set, the dependencies of a build task are not executed.
 * This is useful for cases where the dependencies are already built, but you want to develop
 * a certain build task that depends on them.
 *
 * <args to the build task> are args that may be consumed by the build task at hand, for example to pass them on to
 * the child process, for example in the task checkUnitTest these args are passed on to jest.
 *
 * About build task development:
 * =============================
 *
 * All build tasks are and must be defined in src/build/tasks.
 * Each build task is a TypeScript module that exports a default object
 * that satisfies the BuildTask interface.
 *
 * A build task has a name, a default output directory, a description, and
 * an action function that is called when the build task is executed.
 *
 * A build task can have dependencies. Dependencies are executed before the
 * build task itself is executed. Dependencies are executed in parallel, however
 * due to the single-threaded nature of JavaScript, the execution of a build task
 * parallel execution only takes place if the build task does not do heavy computation
 * in the main thread / build process itself. Typically, a build task only starts
 * a child process that does the heavy computation.
 *
 * A build task can have an actionBeforeDependencies function. This function
 * is executed before the dependencies are executed. This is useful for
 * setting build modes or dev products in certain cases, typically in
 * the dev* build tasks, which are used for local development.
 *
 * Naming conventions for build tasks:
 * - The name of a build task is the name of the file that contains the build task, without the file extension.
 * - We have fixed build task name prefixes for certain types of build tasks:
 *   - build* for build tasks that produce an output in .build-tmp
 *   - generate* for build tasks that produce an output in other places of the repository, for example code generators
 *   - dev* for build tasks that are used for local development
 *   - check* for build tasks that are used for checking the code
 *   - deploy* for build tasks that are used for deployment of a running instance in dev or qa
 *   - upload* for build tasks that are used for uploading build artifacts to a central location
 *
 * Implementation rules for build tasks:
 * - A build* task's output (if it has any) is always written to the build task's own output folder, which
 *   is found in the build task object as the property 'outputFolder'.
 * - A build task never writes to the output folder of another build task.
 *
 * Everything that we do beside our application code must be done in a build task.
 *
 * For ease of use, all build tasks are made available as a script in the package.json scripts section.
 * This is most easily achieved by running the command `yarn generateBuildTasksInPackageJson`.
 */

const taskToPromises = new Map<BuildTask, PromiseLike<void> | void>();

let buildTaskArgs: string[] = [];
let buildWithDependencies = true;
let buildMode: 'prod' | 'dev' | 'watch';

const labelledConsoleLog = (label: string, text: string | Error, isError?: boolean, skipEmptyLines?: boolean) => {
    console.log(label + ': ' + text);
}

import { ALL_BUILD_SWITCHES } from 'src/build/buildSwitches';

const taskLogFunction = (taskName: string) => {
    return ((
        text: string | Error,
        isError?: boolean,
        skipEmptyLines?: boolean,
    ): void => {
        labelledConsoleLog(taskName, text, isError, skipEmptyLines);
    }) satisfies BuildTaskLog;
};

const log = taskLogFunction('build.ts');

export const executeBuildTask = (task: BuildTask): PromiseLike<void> | void => {
    if (!taskToPromises.has(task)) {
        taskToPromises.set(task,
            (async() => {
                const taskLog = taskLogFunction(task.name);
                try {
                    // first execute pre dependency action if there is one
                    if (task.actionBeforeDependencies) {
                        log('Starting Pre-Dependencies for ' + task.name);
                        await task.actionBeforeDependencies(task.name, taskLog);
                        log('Completed Pre-Dependencies for ' + task.name);
                    }

                    // execute dependencies
                    if (task.dependencies && buildWithDependencies) {
                        await Promise.all(task.dependencies.map(async(t) => {
                            await executeBuildTask(t);
                        }));
                    }

                    // execute the task itself
                    if (task.action) {
                        const now = new Date().getTime();
                        log(`Starting task ${task.name}`);
                        await task.action(task.name, taskLog);
                        log(`Completed task ${task.name} in ${Math.floor((new Date().getTime() - now) / 1000)}s`);
                    }
                } catch (e) {
                    log(`Task ${task.name} failed with error:`, true);
                    String(e).split('\n').forEach((line) => {
                        log(line, true);
                    });
                    String((e as Error).stack).split('\n').forEach((line) => {
                        log(line, true);
                    });
                    process.exit(1);
                }
            })()
        );
    }
    return taskToPromises.get(task);
};

const main = async() => {
    const {
        buildSwitches, calledBuildTasks,
    } = processCommandLineArgs();

    processBuildSwitches(buildSwitches);

    if (calledBuildTasks.size === 0) {
        log('No build tasks specified. Exiting.');
        return;
    }

    log('Starting build with the following:');
    log('Tasks to execute: ' + Array.from(calledBuildTasks).join(', '));
    log('Build Mode: ' + buildMode);
    log('Build Dependencies: ' + buildWithDependencies);
    log('Args to the build task: ' + buildTaskArgs.join(' '));


    for (const arg of calledBuildTasks) {
        const taskModulePath = url.pathToFileURL(path.resolve(process.cwd(), 'src/build/tasks/' + arg + '.ts'));
        const taskModule = await import(taskModulePath.toString());
        if (!taskModule.default) {
            log(`Task ${arg} does not export a default at ${taskModulePath}`);
            continue;
        }
        // eslint-disable-next-line no-await-in-loop
        await executeBuildTask(taskModule.default);
    }
};

const processCommandLineArgs = (): {
    buildSwitches: Set<string>;
    calledBuildTasks: Set<string>;
} => {
    const myIndex = process.argv
        .map(a => a.replace(/[\\]/g, '/'))
        .findIndex(a => a.endsWith('/build.ts'));

    // separate the arguments to the build task from the arguments to the build script
    const myArgsAfterBuildTs = process.argv.slice(myIndex + 1);
    const buildSwitches = new Set<string>();
    const calledBuildTasks = new Set<string>();

    const argsToTheBuildTask: string[] = [];
    const consumedBuildSwitches = new Set<string>();
    for (const arg of myArgsAfterBuildTs) {
        if (arg.startsWith('--') && !consumedBuildSwitches.has(arg) && ALL_BUILD_SWITCHES.has(arg)) {
            // one of our build switches. consume it.
            consumedBuildSwitches.add(arg);
            buildSwitches.add(arg);
            continue;
        }

        let taskName = arg;
        if (arg.endsWith('.ts')) {
            taskName = arg.substring(0, arg.length - 3).split(/[\\/]/).pop() ?? '???';
        }
        if (fs.existsSync(path.resolve(process.cwd(), 'src/build/tasks/' + taskName + '.ts'))) {
            calledBuildTasks.add(taskName);
            continue;
        }
        // everything else is args to the build task
        argsToTheBuildTask.push(arg);
    }
    buildTaskArgs = argsToTheBuildTask;
    return { buildSwitches, calledBuildTasks };
};

const processBuildSwitches = (buildSwitches: Set<string>) => {
    if (buildSwitches.has('--dev')) {
        buildMode = 'dev';
    } else if (buildSwitches.has('--watch')) {
        buildMode = 'watch';
    } else {
        buildMode = 'prod';
    }

    if (buildSwitches.has('--no-deps')) {
        buildWithDependencies = false;
    }
};

void main();