import baseConfig from 'src/build/config/vite.base.config';
import type { UserConfig } from 'vite';

export default {
    ...baseConfig,
    server: {
        port: 8080,
        open: true,
    },
    clearScreen: true,
} as UserConfig;