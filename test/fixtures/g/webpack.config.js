import BugsnagSourceMapUploaderPlugin from '../../../source-map-uploader-plugin.js'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const config = {
  entry: './app.js',
  devtool: 'hidden-source-map',
  output: {
    path: __dirname,
    filename: './bundle.js',
    publicPath: 'https://foobar.com/js',
  },
  plugins: [
    new BugsnagSourceMapUploaderPlugin({
      apiKey: 'YOUR_API_KEY',
      endpoint: `http://localhost:${process.env.PORT}`
    })
  ]
};

// As per webpack documentation:
// "output.futureEmitAssets option will be removed in webpack v5.0.0 and this behaviour will become the new default."
// so it can safely be omitted for webpack>=5 while still getting a similar result
if (parseInt(process.env.WEBPACK_VERSION) < 5) {
  config.output.futureEmitAssets = true;
}

export default config;