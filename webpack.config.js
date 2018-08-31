const path = require("path");
const {
    TsConfigPathsPlugin
} = require('awesome-typescript-loader');

module.exports = {
    mode: "development", // "production" | "development" | "none"
    entry: './src/index.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        plugins: [
            new TsConfigPathsPlugin( /* { configFileName, compiler } */ )
        ]
    },
    devtool: "source-map",
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'awesome-typescript-loader',
            // loader: 'ts-loader', // TODO: Compare loaders
        }]
    }
    // resolve: {
    //     extensions: ['.ts', '.tsx', '.js'],
    //     alias: {
    //         // These must be configured in tsconfig.json as well
    //         "@Root": path.resolve(__dirname, 'src/'),
    //         "@Bindings": path.resolve(__dirname, 'src/contracts/bindings'),
    //         "@Contracts": path.resolve(__dirname, 'src/contracts'),
    //         "@Lib": path.resolve(__dirname, 'src/lib'),
    //         "@Methods": path.resolve(__dirname, 'src/methods'),
    //     }
    // },
};