import BugsnagBuildReporterPlugin from '../../../build-reporter-plugin.js'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const config = {
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

export default config
