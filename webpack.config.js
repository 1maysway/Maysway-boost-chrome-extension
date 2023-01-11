module.exports = {
    // ...
    module: {
        rules: [{
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"]
            },
            // ...
        ],
        devtool: 'cheap-module-source-map'
    }
};