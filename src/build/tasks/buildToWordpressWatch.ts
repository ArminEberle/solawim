import { localWebServerPath, } from 'src/build/config/buildConfig';
import type { BuildTask, } from 'src/build/types/BuildTask';
import { getDefaultTaskProperties, } from 'src/build/utils/getDefaultTaskProperties';
import esbuild from 'esbuild';
import { developmentConfig } from 'src/build/config/esbuild-config';
import { copyFolderRecursiveAndWatch } from 'src/utils/copyFiles';


export default {
    ...getDefaultTaskProperties(__filename),
    action: async (): Promise<void> => {
        copyFolderRecursiveAndWatch('php', localWebServerPath)
        developmentConfig.outdir = localWebServerPath;
        const context = await esbuild.context(developmentConfig);
        await context.watch();
    },
} satisfies BuildTask;