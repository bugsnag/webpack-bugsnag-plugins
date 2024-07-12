const BugsnagBuildReporterPlugin = require('../../../').BugsnagBuildReporterPlugin

module.exports = {
  entry: './app.js',
  output: {
    path: __dirname,
    filename: './bundle.js'
  },
  plugins: [
    new BugsnagBuildReporterPlugin({
      apiKey: 'YOUR_API_KEY',
      appVersion: '1.2.3'
    }, {
      endpoint: `http://localhost:${process.env.PORT}`
    })
  ]
}
