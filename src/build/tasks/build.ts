import cloneDeep from 'lodash.clonedeep';
import path from 'path';
import { viteOutPath, } from 'src/build/config/buildConfig';
import type { BuildTask, } from 'src/build/types/BuildTask';
import { getDefaultTaskProperties, } from 'src/build/utils/getDefaultTaskProperties';
import type { UserConfig, } from 'vite';

export default {
    ...getDefaultTaskProperties(__filename),
    action: async() => {
        const [
            vite,
            buildConfigModule,
        ] = await Promise.all([
            import('vite'),
            import('src/build/config/vite.build.config'),
        ]);

        console.log('Excuting build');
        const buildConfig = buildConfigModule.default;

        const memberConfigPlain = cloneDeep(buildConfig);
        if (!memberConfigPlain.build || !memberConfigPlain.build.rollupOptions) {
            throw new Error();
        }
        memberConfigPlain.build.emptyOutDir = false;
        memberConfigPlain.build.rollupOptions.input
        = 'src/members/entrypoints/solawim_member.tsx';
        memberConfigPlain.build.outDir = path.resolve(viteOutPath + '/member');
        const memberConfig = await vite.defineConfig(memberConfigPlain) as UserConfig;

        const manageConfigPlain = cloneDeep(buildConfig);
        if (!manageConfigPlain.build || !manageConfigPlain.build.rollupOptions) {
            throw new Error();
        }
        manageConfigPlain.build.emptyOutDir = false;
        manageConfigPlain.build.rollupOptions.input
        = 'src/members/entrypoints/solawim_manage.tsx';
        manageConfigPlain.build.outDir = path.resolve(viteOutPath + '/manage');
        const manageConfig = await vite.defineConfig(manageConfigPlain) as UserConfig;

        await Promise.all([
            vite.build(memberConfig),
            vite.build(manageConfig),
        ]);
    },
    // dependencies: ['generateJsonSchema'],
} satisfies BuildTask;