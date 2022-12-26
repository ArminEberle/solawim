import type { Task } from 'src/build/types/Task';
import type { UserConfig } from 'vite';

export default {
    action: async(name: string) => {
        const [
            vite,
            devConfig,
        ] = await Promise.all([
            import('vite'),
            import('src/build/config/vite.dev.config'),
        ]);
        const config = await vite.defineConfig(devConfig.default) as UserConfig;
        const server = await vite.createServer(config);
        await server.listen();

        server.printUrls();
    },
    desc: 'This my description',
} as Task;