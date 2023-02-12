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
            buildConfig.build.outDir = localWebServerPath;
            buildConfig.build.emptyOutDir = false;
            buildConfig.build.watch = {};
            buildConfig.build.minify = false;
            if (buildConfig.build.rollupOptions) {
                buildConfig.build.rollupOptions.output = {
                    sourcemap: true,
                    assetFileNames: 'mime/[name].[ext]',
                    entryFileNames: 'mime/[name].js',
                    chunkFileNames: 'mime/[name].js',
                };
            }
        }
        const config = await vite.defineConfig(buildConfig) as UserConfig;

        await vite.build(config);
    },
    desc: '',
};