module.exports = {
    entry : "./js/index.js",
    output: {
        path: __dirname + '/public/js',
        filename: 'script.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: '/node_modules/',
                query: {
                    cacheDirectory: true,
                    presets: ['es2017', 'react']
                }
            }
        ]
    }
}