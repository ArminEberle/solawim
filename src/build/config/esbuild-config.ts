import cssModulesPlugin from 'esbuild-css-modules-plugin';
import esbuild from 'esbuild';
import { cloneDeep } from 'lodash';
import postcss2 from 'esbuild-plugin-postcss2';

export const productionConfig: esbuild.BuildOptions = {
    entryPoints: [
        'src/members/entrypoints/solawim_manage.tsx',
        'src/members/entrypoints/solawim_member.tsx',
    ],
    bundle: true,
    platform: 'browser',
    outdir: '.build-tmp/site',
    minify: true,
    assetNames: '[name]/[name]-[hash]',
    chunkNames: '[name]/[name]-[hash]',
    entryNames: '[name]/[name]-[hash]',
    treeShaking: true,
    mainFields: ['browser', 'module', 'main'],
    // Splitting will take up more space, but will allow for better caching
    // When developing, we don't want to use this, as it will cause the runtime to lag
    splitting: false,
    keepNames: true,
    // This will keep the comments in the code to fulfill the legal requirements
    // When developing, we don't want to use this, as it will slow down the runtime
    legalComments: 'eof',
    // alias,
    // plugins,
    // banner,
    // inject,
    // The `loader` settings will be kept in sync with the file extensions in `src/ui/resourceTypes.d.ts`
    loader: {
        '.png': 'file',
        '.jpg': 'file',
        '.jpeg': 'file',
        '.gif': 'file',
        '.svg': 'file',
        '.ico': 'file',
        '.pdf': 'file',
        '.js': 'jsx',
        '.json': 'json',
        '.css': 'css',
    },
    // Source maps are only generated in development mode as they take up a lot of space and slow down the runtime
    // Each time an error is thrown, the source map is loaded and parsed
    sourcemap: 'linked',
    // The format is set to 'esm' by default, as this is the most modern format
    // For certain scenarios, the format can be set to 'iife' or 'cjs' (in tests for example)
    format: 'esm',
    // Adjust the targets according to the requirements of the project
    target: [
        'es2022',
        'chrome80',
        'edge80',
        'firefox72',
        'safari14',
    ],
    plugins: [
        postcss2(),
        // cssModulesPlugin({
        //     force: true,
        //     emitDeclarationFile: false,
        //     localsConvention: 'camelCaseOnly',
        //     namedExports: true,
        //     inject: false,
        // })
    ],
    // We'll always have to generate a metafile to be able to analyze the build
    // This is necessary to generate the license reports
    metafile: false,
    // // We'll set this to `true` to make @jgoz/esbuild-plugin-livereload work
    // write: true,
    logLevel: 'debug',
};

export const developmentConfig: esbuild.BuildOptions = cloneDeep(productionConfig);

developmentConfig.minify = false;
developmentConfig.sourcemap = 'inline';
developmentConfig.assetNames = '[name]/[name]';
developmentConfig.chunkNames = '[name]/[name]';
developmentConfig.entryNames = '[name]/[name]';