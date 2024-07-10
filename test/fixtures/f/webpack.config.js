import { BugsnagSourceMapUploaderPlugin } from '../../../';
import { SourceMapDevToolPlugin } from 'webpack';

export const entry = './src/index.js';
export const devtool = false;
export const plugins = [
  new SourceMapDevToolPlugin({
    filename: '../tmp/[file].map'
  }),
  new BugsnagSourceMapUploaderPlugin({
    apiKey: 'YOUR_API_KEY',
    endpoint: `http://localhost:${process.env.PORT}`
  })
];
export const output = {
  publicPath: '*/dist'
};
export const mode = 'development';
