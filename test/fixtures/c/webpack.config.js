import { BugsnagSourceMapUploaderPlugin } from '../../../'

export const entry = './app.js'
export const devtool = 'hidden-source-map'
export const output = {
  path: __dirname,
  filename: './bundle.js',
  publicPath: 'https://foobar.com/js'
}
export const plugins = [
  new BugsnagSourceMapUploaderPlugin({
    apiKey: 'YOUR_API_KEY',
    endpoint: `http://localhost:${process.env.PORT}`
  })
]
