import glob from 'glob';
import path from 'path';
import baseConfig from 'src/build/config/vite.base.config';
import type { UserConfig, } from 'vite';

export default {
    ...baseConfig,
    build: {
        outDir: path.resolve(process.cwd(), '.build-tmp/site'),
        emptyOutDir: true,
        rollupOptions: {
            output: {
                sourcemap: true,
                assetFileNames: '[name]-[hash].[ext]',
                entryFileNames: '[name]-[hash].js',
                chunkFileNames: '[name]-[hash].js',
            },
            input: glob.sync(path.resolve(process.cwd(), 'content', '*.html')),
        },
    },
    // plugins: [
    // ],

} as UserConfig;