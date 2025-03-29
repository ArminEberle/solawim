import esbuild from 'esbuild';
import { localWebServerPath } from 'src/build/config/buildConfig';
import { developmentConfig } from 'src/build/config/esbuild-config';
import type { BuildTask } from 'src/build/types/BuildTask';
import { getDefaultTaskProperties } from 'src/build/utils/getDefaultTaskProperties';
import { copyFolderRecursiveAndWatch } from 'src/utils/copyFiles';

export default {
    ...getDefaultTaskProperties(__filename),
    action: async (): Promise<void> => {
        copyFolderRecursiveAndWatch('php', localWebServerPath);
        console.log('php folder copied to ' + localWebServerPath);
        developmentConfig.outdir = localWebServerPath;
        const context = await esbuild.context(developmentConfig);
        console.log('Watching for changes, building to ' + developmentConfig.outdir);
        await context.watch();
    },
} satisfies BuildTask;
