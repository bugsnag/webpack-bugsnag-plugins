import BugsnagSourceMapUploaderPlugin from '../../../source-map-uploader-plugin.js';
import { SourceMapDevToolPlugin } from 'webpack';

const config = {
  entry: './src/index.js',
  devtool: false,
  plugins: [
    new SourceMapDevToolPlugin({
      filename: '../tmp/[file].map'
    }),
    new BugsnagSourceMapUploaderPlugin({
      apiKey: 'YOUR_API_KEY',
      endpoint: `http://localhost:${process.env.PORT}`
    })
  ],
  output: {
    publicPath: '*/dist'
  },
  mode: "development",
};

export default config;