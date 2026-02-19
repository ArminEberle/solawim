import esbuild from 'esbuild';
import { esBuildConfig } from 'src/build/config/esbuild-config';
import clean from 'src/build/tasks/clean';
import copyPhpCode from 'src/build/tasks/copyPhpCode';
import rewriteSolawimPhp from 'src/build/tasks/rewriteSolawimPhp';
import type { BuildTask } from 'src/build/types/BuildTask';
import { getDefaultTaskProperties } from 'src/build/utils/getDefaultTaskProperties';
import fs from 'node:fs';

export default {
    ...getDefaultTaskProperties(__filename),
    action: async () => {
        clean.action();
        const result = await esbuild.build(esBuildConfig(true));
        if (result.metafile) {
            fs.writeFileSync('.build-tmp/meta.json', JSON.stringify(result.metafile, null, 2));
        }
        // await build.action();
        await copyPhpCode.action();
        rewriteSolawimPhp.action();
    },
} satisfies BuildTask;
