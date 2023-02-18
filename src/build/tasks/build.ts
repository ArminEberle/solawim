import type { Task } from 'src/build/types/Task';
import type { UserConfig } from 'vite';
import cloneDeep from 'lodash.clonedeep';

export default {
    action: async (name: string) => {
        const [
            vite,
            buildConfigModule,
        ] = await Promise.all([
            import('vite'),
            import('src/build/config/vite.build.config'),
        ]);
        const buildConfig = buildConfigModule.default;

        const memberConfigPlain = cloneDeep(buildConfig);
        memberConfigPlain.build.emptyOutDir = false;
        memberConfigPlain.build.rollupOptions.input
            = 'src/members/entrypoints/solawim_member.tsx';
        const memberConfig = await vite.defineConfig(cloneDeep(buildConfig)) as UserConfig;

        const manageConfigPlain = cloneDeep(buildConfig);
        manageConfigPlain.build.emptyOutDir = false;
        manageConfigPlain.build.rollupOptions.input
            = 'src/members/entrypoints/solawim_manage.tsx';
        const manageConfig = await vite.defineConfig(cloneDeep(buildConfig)) as UserConfig;

        await Promise.all([
            vite.build(memberConfig),
            vite.build(manageConfig),
        ]);
    },
    desc: 'This my description',
    // dependencies: ['generateJsonSchema'],
} as Task;