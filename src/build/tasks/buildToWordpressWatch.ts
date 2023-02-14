import cloneDeep from 'lodash.clonedeep';
import { localWebServerPath } from 'src/build/config/buildConfig';
import type { UserConfig } from 'vite';

export default {
    action: async(): Promise<void> => {
        const [
            vite,
            buildConfigModule,
        ] = await Promise.all([
            import('vite'),
            import('src/build/config/vite.build.config'),
        ]);
        const buildConfig = buildConfigModule.default;
        if (buildConfig.build) {
            buildConfig.build.outDir = localWebServerPath + '/member';
            buildConfig.build.emptyOutDir = false;
            buildConfig.build.watch = {};
            buildConfig.build.minify = false;
            if (buildConfig.build.rollupOptions) {
                // buildConfig.build.rollupOptions.input = [

                // ];
                buildConfig.build.rollupOptions.input
                    = 'src/members/entrypoints/solawim_member.tsx';

                buildConfig.build.rollupOptions.output = {
                    sourcemap: true,
                    assetFileNames: '[name].[ext]',
                    entryFileNames: '[name].js',
                    chunkFileNames: '[name].js',
                };
            }
        }

        const memberConfig = await vite.defineConfig(cloneDeep(buildConfig)) as UserConfig;

        if (buildConfig.build?.rollupOptions) {
            buildConfig.build.outDir = localWebServerPath + '/manage';
            buildConfig.build.rollupOptions.input = 'src/members/entrypoints/solawim_manage.tsx';
        }
        const manageConfig = await vite.defineConfig(cloneDeep(buildConfig)) as UserConfig;

        await Promise.all([
            vite.build(memberConfig),
            vite.build(manageConfig),
        ]);
        // await vite.build(config);
    },
    desc: '',
};