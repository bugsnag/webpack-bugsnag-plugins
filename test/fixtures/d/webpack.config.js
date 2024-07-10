import BugsnagSourceMapUploaderPlugin from '../../../source-map-uploader-plugin.js'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const config = {
  entry: './app.js',
  devtool: 'hidden-source-map',
  output: {
    path: __dirname,
    filename: '[name].js?[chunkhash:20]',
    chunkFilename: '[name].chunk.js?[chunkhash:20]',
    publicPath: 'https://foobar.com/js'
  },
  plugins: [
    new BugsnagSourceMapUploaderPlugin({
      apiKey: 'YOUR_API_KEY',
      codeBundleId: '1.0.0-b12',
      endpoint: `http://localhost:${process.env.PORT}`
    })
  ]
};

export default config;