import { BugsnagSourceMapUploaderPlugin } from '../../../'

export const entry = './app.js'
export const devtool = 'hidden-source-map'
export const output = {
  path: __dirname,
  filename: '[name].js?[chunkhash:20]',
  chunkFilename: '[name].chunk.js?[chunkhash:20]',
  publicPath: 'https://foobar.com/js'
}
export const plugins = [
  new BugsnagSourceMapUploaderPlugin({
    apiKey: 'YOUR_API_KEY',
    codeBundleId: '1.0.0-b12',
    endpoint: `http://localhost:${process.env.PORT}`
  })
]
