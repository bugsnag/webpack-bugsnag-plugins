# webpack-bugsnag-plugins

### Example

```js
const { BugsnagBuildReporterPlugin } = require('webpack-bugsnag-plugins')

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
      // opts:
      /*
        logger: { debug, info, warn, error }
        logLevel: 'debug' | 'info' | 'warn' | 'error' (default 'warn'),
        endpoint: 'https://different.url:1234', (default 'https://builds.bugsnag.com')
        path: __dirname (default `process.cwd()`)
      */
    })
  ]
}
```
