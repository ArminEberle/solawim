const webpack = require('webpack')
const path = require('path');
module.exports = {
    mode: 'development',
    entry: {
        vendor: ['vue', 'vue-class-component']
    },
    output: {
        filename: 'cacheme-[fullhash].js',
        path: path.join(__dirname, 'dist'),
        library: 'vendor'
    },
    plugins: [
        new webpack.DllPlugin({
            name: 'vendor',
            path: path.join(__dirname, '.build-tmp','vendor', 'vendor-manifest.json')
        })
    ]
}
