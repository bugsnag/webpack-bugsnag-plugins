import { BugsnagSourceMapUploaderPlugin } from '../../../'

export const entry = './app.js'
export const devtool = 'hidden-source-map'
export const output = Object.assign(
  {
    path: __dirname,
    filename: './bundle.js',
    publicPath: 'https://foobar.com/js',
  },
  // As per webpack documentation:
  // "output.futureEmitAssets option will be removed in webpack v5.0.0 and this behaviour will become the new default."
  // so it can safely be omitted for webpack>=5 while still getting a similar result
  parseInt(process.env.WEBPACK_VERSION, 10) < 5 ? { futureEmitAssets: true } : {})
export const plugins = [
  new BugsnagSourceMapUploaderPlugin({
    apiKey: 'YOUR_API_KEY',
    endpoint: `http://localhost:${process.env.PORT}`
  })
]
