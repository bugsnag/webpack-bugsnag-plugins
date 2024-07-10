import MiniCssExtractPlugin, { loader } from 'mini-css-extract-plugin';
import { BugsnagSourceMapUploaderPlugin } from '../../../';

export const entry = './src/index.js';
export const devtool = 'source-map';
export const plugins = [
  new MiniCssExtractPlugin(),
  new BugsnagSourceMapUploaderPlugin({
    apiKey: 'YOUR_API_KEY',
    endpoint: `http://localhost:${process.env.PORT}`,
    ignoredBundleExtensions: process.env.IGNORED_EXTENSIONS ? process.env.IGNORED_EXTENSIONS.split(',') : undefined
  })
];
export const output = {
  publicPath: '*/dist'
};
export const mode = 'development';
export const module = {
  rules: [
    {
      test: /\.css$/,
      use: [
        loader,
        'css-loader'
      ],
    },
  ],
};
