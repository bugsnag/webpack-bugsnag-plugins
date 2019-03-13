const BugsnagSourceMapUploaderPlugin = require('../../../').BugsnagSourceMapUploaderPlugin

module.exports = {
  entry: './app.js',
  devtool: 'hidden-source-map',
  output: {
    path: __dirname,
    filename: './bundle.js',
    publicPath: 'https://foobar.com/js',
    futureEmitAssets: true
  },
  plugins: [
    new BugsnagSourceMapUploaderPlugin({
      apiKey: 'YOUR_API_KEY',
      endpoint: `http://localhost:${process.env.PORT}`
    })
  ]
}
