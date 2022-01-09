var path = require('path');
var webpack = require('webpack');
const outpath = path.resolve('/var/www/localhost/wp-content/plugins/solawim/');
// const outpath = path.resolve(__dirname, './dist');
const srcPath = path.join(__dirname, 'src');
module.exports = {
    entry: {
        main: './src/main.ts',
        test: './src/test.ts',
    },
    mode: 'development',
    output: {
        filename: '[contenthash].js',
        // chunkFilename: 'cacheme-[contenthash].js',
        path: path.resolve(outpath, 'mime'),
        // this comment just as a reminder - in other types of devtools, this (or something similar) is required
        devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]',
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    reuseExistingChunk: true,
                },
                main: {
                    minChunks: 1,
                    priority: -20,
                    reuseExistingChunk: true,
                },
            },
        },
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.sass$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    'sass-loader?indentedSyntax',
                ],
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
                        // the "scss" and "sass" values for the lang attribute to the right configs here.
                        // other preprocessors should work out of the box, no loader config like this necessary.
                        'scss': [
                            'vue-style-loader',
                            'css-loader',
                            'sass-loader',
                        ],
                        'sass': [
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
            'vue$': 'vue/dist/vue.esm.js',
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
            cleanAfterEveryBuildPatterns: [
                '!index.html',
            ],
        }),
        new (require('vue-loader').VueLoaderPlugin)(),
        new (require('html-webpack-plugin'))({
            template: 'src/index.html',
            filename: '../index.html',
            chunks: 'main',
            excludeChunks: ['test'],
        }),
        new (require('html-webpack-plugin'))({
            template: 'src/index.html',
            filename: '../test.html',
            chunks: 'test',
            excludeChunks: ['main'],
        }),
        new (require('copy-webpack-plugin'))({
            patterns: [
                {
                    from: 'php',
                    to: outpath,
                },
            ],
        }),
    ],
    devtool: 'eval-source-map',
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
        new (require('compression-webpack-plugin'))(
            {
                exclude: /(LICENSE)|(index)/,
            }
        ),
    ]);
    // module.exports.optimization.minimizer= [new (require('uglifyjs-webpack-plugin'))()];
    module.exports.optimization.minimize = true;
    module.exports.mode = 'production';
    module.exports.devtool = false;
    // delete module.devtool;
}