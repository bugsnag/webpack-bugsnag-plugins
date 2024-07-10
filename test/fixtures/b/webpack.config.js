import { BugsnagBuildReporterPlugin } from '../../../'

export const entry = './app.js'
export const output = {
  path: __dirname,
  filename: './bundle.js'
}
export const plugins = [
  new BugsnagBuildReporterPlugin({
    apiKey: 'YOUR_API_KEY',
    appVersion: '1.2.3'
  }, {
    endpoint: `http://localhost:${process.env.PORT}`
  })
]
