const BugsnagSourceMapUploaderPlugin = require('../../..').BugsnagSourceMapUploaderPlugin
const webpack = require('webpack')

module.exports = {
  entry: './src/index.js',
  devtool: false,
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      filename: '..tmp/[file].map'
    }),
    new BugsnagSourceMapUploaderPlugin({
      apiKey: 'YOUR_API_KEY',
      endpoint: `http://localhost:${process.env.PORT}`,
      publicPath: 'https://foobar.com/js',
    })
  ],
  output: {
    // A chunk filename with a "../", as seen in nextjs projects
    filename: '../static/chunks/[name].js',
  },
  mode: 'development',
};
