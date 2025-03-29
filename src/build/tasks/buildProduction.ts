import esbuild from 'esbuild';
import { developmentConfig, esBuildConfig } from 'src/build/config/esbuild-config';
import build from 'src/build/tasks/build';
import clean from 'src/build/tasks/clean';
import copyPhpCode from 'src/build/tasks/copyPhpCode';
import rewriteSolawimPhp from 'src/build/tasks/rewriteSolawimPhp';
import type { BuildTask } from 'src/build/types/BuildTask';
import { getDefaultTaskProperties } from 'src/build/utils/getDefaultTaskProperties';

export default {
    ...getDefaultTaskProperties(__filename),
    action: async () => {
        clean.action();
        await esbuild.build(esBuildConfig(true));
        // await build.action();
        await copyPhpCode.action();
        rewriteSolawimPhp.action();
    },
} satisfies BuildTask;
