const BugsnagSourceMapUploaderPlugin = require('../../../').BugsnagSourceMapUploaderPlugin
const webpack = require('webpack')

module.exports = {
  entry: './src/index.js',
  devtool: false,
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      filename: '../tmp/[file].map'
    }),
    new BugsnagSourceMapUploaderPlugin({
      apiKey: 'YOUR_API_KEY',
      endpoint: `http://localhost:${process.env.PORT}`
    })
  ],
  output: {
    publicPath: '*/dist'
  },
  mode: 'development',
};
