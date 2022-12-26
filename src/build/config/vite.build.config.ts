import glob from 'glob';
import path from 'path';
import type { UserConfig } from 'vite';
import baseConfig from './vite.base.config';

export default {
    ...baseConfig,
    build: {
        outDir: path.resolve(process.cwd(), '.build-tmp/site'),
        emptyOutDir: true,
        rollupOptions: {
            input: glob.sync(path.resolve(process.cwd(), "content", "*.html")),
        },
    },
    // plugins: [
    // ],
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