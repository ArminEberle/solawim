import type { Task } from 'src/build/types/Task';
import type { UserConfig } from 'vite';

export default {
    action: async(name: string) => {
        const [
            vite,
            buildConfig,
        ] = await Promise.all([
            import('vite'),
            import('src/build/config/vite.build.config'),
        ]);
        const config = await vite.defineConfig(buildConfig.default) as UserConfig;
        console.log(config);
        await vite.build(config);
    },
    desc: 'This my description',
} as Task;