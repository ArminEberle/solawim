var path = require('path');
var webpack = require('webpack');
const outpath = path.resolve('/var/www/localhost/wp-content/plugins/solawim/');
// const outpath = path.resolve(__dirname, './dist');
module.exports = {
    entry: {
        solawim: './src/main.ts',
        solawim_manage: './src/manage.ts',
    },
    mode: 'development',
    output: {
    // filename: '[contenthash].js',
        filename: '[name].js',
        // chunkFilename: 'cacheme-[contenthash].js',
        path: path.resolve(outpath, 'mime'),
        // this comment just as a reminder - in other types of devtools, this (or something similar) is required
        devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]',
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
            //     hidePathInfo: true,
            cacheGroups: {
                defaultVendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    reuseExistingChunk: true,
                    name() {
                        return 'solawim_libs';
                    },
                },
                solawim: {
                    minChunks: 1,
                    test: /\./,
                    priority: -20,
                    reuseExistingChunk: true,
                },
                // lib: {
                //     test: /[\\/]node_modules[\\/]/,
                //     priority: -10,
                //     reuseExistingChunk: true,
                //     name: 'libs',
                // },
            },
        },
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['vue-style-loader', 'css-loader'],
            },
            {
                test: /\.scss$/,
                use: ['vue-style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.sass$/,
                use: ['vue-style-loader', 'css-loader', 'sass-loader?indentedSyntax'],
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
                        // the "scss" and "sass" values for the lang attribute to the right configs here.
                        // other preprocessors should work out of the box, no loader config like this necessary.
                        scss: ['vue-style-loader', 'css-loader', 'sass-loader'],
                        sass: [
                            'vue-style-loader',
                            'css-loader',
                            'sass-loader?indentedSyntax',
                        ],
                    },
                    // other vue-loader options go here
                    esModule: true,
                },
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                },
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]',
                },
            },
            {
                test: /\.js$/,
                use: ['source-map-loader'], // load existing source maps from tsc-compile
                enforce: 'pre',
            },
        ],
    },
    resolve: {
        alias: {
            vue$: 'vue/dist/vue.esm.js',
        },
        extensions: ['.ts', '.js', '.vue', '.json', '.scss'],
    },
    devServer: {
        client: {
            overlay: true,
        },
        setupExitSignals: true,
    },
    performance: {
        hints: false,
    // hints: 'warning'
    },
    plugins: [
        new (require('clean-webpack-plugin').CleanWebpackPlugin)({
            cleanAfterEveryBuildPatterns: ['!index.html'],
        }),
        new (require('vue-loader').VueLoaderPlugin)(),
        // new (require('html-webpack-plugin'))({
        //     template: 'src/index.html',
        //     filename: '../test.html',
        //     chunks: 'test',
        //     excludeChunks: ['solawim'],
        // }),
        new (require('copy-webpack-plugin'))({
            patterns: [
                {
                    from: 'php',
                    to: outpath,
                },
            ],
        }),
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
        }),
    ],
    devtool: 'source-map',
};

if (process.env.NODE_ENV === 'production') {
    // module.exports.devtool = '#source-map';
    // http://vue-loader.vuejs.org/en/workflow/production.html
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"',
            },
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
        }),
    ]);
    module.exports.optimization.minimize = true;
    module.exports.mode = 'production';
    module.exports.devtool = false;
}