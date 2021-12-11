var path = require('path')
var webpack = require('webpack')
const outpath = path.resolve(__dirname, './dist');
const srcPath = path.join(__dirname, 'src');
module.exports = {
  entry: {
    main: './src/main.ts',
  },
  output: {
    filename: 'cacheme-main-[contenthash].js',
    chunkFilename: 'cacheme-[contenthash].js',
    path: outpath,
    // this comment just as a reminder - in other types of devtools, this (or something similar) is required
    // devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]',
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
    }
  },
  // optimization: {
  //     splitChunks: {
  //         chunks: 'async',
  //         minSize: 10000,
  //         maxSize: 600000,
  //         minChunks: 1,
  //         maxAsyncRequests: 6,
  //         maxInitialRequests: 4,
  //         automaticNameDelimiter: '_',
          // cacheGroups: {
          //     vendor: {
          //         test: /[\\/]node_modules[\\/]/,
          //         priority: -10,
          //         reuseExistingChunk: true,
          //     },
          //     main: {
          //         minChunks: 1,
          //         priority: -20,
          //         reuseExistingChunk: true,
          //     },
          // },
  //     },
  //     minimize: false,
  // },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ],
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader'
        ],
      },
      {
        test: /\.sass$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader?indentedSyntax'
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
              'sass-loader'
            ],
            'sass': [
              'vue-style-loader',
              'css-loader',
              'sass-loader?indentedSyntax'
            ]
          },
          // other vue-loader options go here
          esModule: true
        }
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: "ts-loader",
        options: {
          appendTsSuffixTo: [/\.vue$/]
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['.ts', '.js', '.vue', '.json'],
  },
  devServer: {
    client: {
      overlay: true
    },
    setupExitSignals: true,
  },
  performance: {
    hints: false
    // hints: 'warning'
  },
  plugins: [
    // new webpack.DllReferencePlugin({
    //   context: __dirname,
    //   manifest: path.join(__dirname, '.build-tmp/vendor', 'vendor-manifest.json'),
    //   name: 'vendor'
    // }),
    new ( require( 'clean-webpack-plugin' ).CleanWebpackPlugin )( {
      cleanAfterEveryBuildPatterns: [
          '!index.html',
      ],
    } ),
    new (require('vue-loader').VueLoaderPlugin)(),
    new (require('html-webpack-plugin'))({
      template: 'src/index.html'
    })
  ],
  devtool: 'eval-source-map'
}

if (process.env.NODE_ENV === 'production') {
  // module.exports.devtool = '#source-map';
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ]);
  // module.exports.optimization.minimizer= [new (require('uglifyjs-webpack-plugin'))()];
  // module.exports.optimization.minimize= true;
  module.mode = 'production';
  delete module.devtool;
}
