import MiniCssExtractPlugin, { loader } from 'mini-css-extract-plugin';
import BugsnagSourceMapUploaderPlugin from '../../../source-map-uploader-plugin.js';

const config = {
  entry: './src/index.js',
  devtool: 'source-map',
  plugins: [
    new MiniCssExtractPlugin(),
    new BugsnagSourceMapUploaderPlugin({
      apiKey: 'YOUR_API_KEY',
      endpoint: `http://localhost:${process.env.PORT}`,
      ignoredBundleExtensions: process.env.IGNORED_EXTENSIONS ? process.env.IGNORED_EXTENSIONS.split(',') : undefined
    })
  ],
  output: {
    publicPath: '*/dist'
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          loader,
          'css-loader'
        ],
      },
    ],
  }
};

export default config;