import baseConfig from 'src/build/config/vite.base.config';
import type { UserConfig } from 'vite';

export default {
    ...baseConfig,
    server: {
        port: 8080,
        open: true,
        // proxy: {
        //     '/master-data': 'http://localhost:3004',
        //     '/authenticate': 'http://localhost:3004',
        //     '/analytics': {
        //         target: 'http://localhost:3001',
        //         ws: true,
        //     },
        // },
    },
    clearScreen: true,
} as UserConfig;