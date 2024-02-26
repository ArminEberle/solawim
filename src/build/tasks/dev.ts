import type { UserConfig } from 'vite';
import { getDefaultTaskProperties } from '../utils/getDefaultTaskProperties';
import { BuildTask } from 'src/build/types/BuildTask';

export default {
    ...getDefaultTaskProperties(__filename),
    action: async() => {
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
} satisfies BuildTask;