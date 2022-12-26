import path from 'path';
import type { UserConfig } from 'vite';

export default {
    appType: 'mpa',
    base: '/',
    root: 'content',
    resolve: {
        alias: [
            { find: /^\/?src/, replacement: path.resolve(process.cwd(), 'src') },
        ],
    },
    plugins: [
    ],
    // optimizeDeps: {
    //     esbuildOptions: {
    //         define: {
    //             // global: 'globalThis',
    //         },
    //         plugins: [
    //         ],
    //     },
    // },
} as UserConfig;