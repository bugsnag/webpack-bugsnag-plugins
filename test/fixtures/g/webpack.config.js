const BugsnagSourceMapUploaderPlugin = require('../../../').BugsnagSourceMapUploaderPlugin

module.exports = {
  entry: './app.js',
  devtool: 'hidden-source-map',
  output: Object.assign(
    {
      path: __dirname,
      filename: './bundle.js',
      publicPath: 'https://foobar.com/js',
    },
    // As per webpack documentation:
    // "output.futureEmitAssets option will be removed in webpack v5.0.0 and this behaviour will become the new default."
    // so it can safely be omitted for webpack>=5 while still getting a similar result
    parseInt(process.env.WEBPACK_VERSION, 10) < 5 ? { futureEmitAssets: true } : {}),
  plugins: [
    new BugsnagSourceMapUploaderPlugin({
      apiKey: 'YOUR_API_KEY',
      endpoint: `http://localhost:${process.env.PORT}`
    })
  ]
}
