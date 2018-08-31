var path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
var nodeExternals = require('webpack-node-externals');
var TypedocWebpackPlugin = require('typedoc-webpack-plugin');

let common = {
  entry: './src/index.ts',
  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: ['babel-loader', 'ts-loader'],
      exclude: /node_modules/
    }, ]
  },
  plugins: [
    new CleanWebpackPlugin(['lib'], {
      exclude: ['test.html']
    }),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      // These must be configured in tsconfig.json as well
      "@Root": path.resolve(__dirname, 'src/'),
      "@Bindings": path.resolve(__dirname, 'src/contracts/bindings'),
      "@Contracts": path.resolve(__dirname, 'src/contracts'),
      "@Lib": path.resolve(__dirname, 'src/lib'),
      "@Methods": path.resolve(__dirname, 'src/methods'),
    }
  }
};

module.exports = [
  Object.assign({}, common, {
    target: 'web',
    entry: ['babel-polyfill', './src/index.ts'],
    output: {
      path: path.resolve(__dirname, 'lib'),
      filename: 'browser.js',
      libraryTarget: 'var',
      library: 'RenExSDK', // This is the var name in browser
      libraryExport: 'default'
    },
    node: {
      fs: 'empty',
      child_process: 'empty'
    }
  }),
  Object.assign({}, common, {
    target: 'node',
    output: {
      path: path.resolve(__dirname, 'lib'),
      filename: 'index.js',
      libraryTarget: 'commonjs2',
      libraryExport: 'default'
    },
    externals: [nodeExternals()]
  })
]