import path from 'path';
import type { UserConfig } from 'vite';

export default {
    appType: 'spa',
    base: '/',
    root: 'content',
    resolve: {
        alias: [
            { find: /^\/?src/, replacement: path.resolve(process.cwd(), 'src') },
        ],
    },
    plugins: [
    ],
} as UserConfig;