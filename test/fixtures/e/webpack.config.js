import BugsnagSourceMapUploaderPlugin from '../../../source-map-uploader-plugin.js';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const config = {
  entry: './src/index.js',
  devtool: 'source-map',
  plugins: [
    new MiniCssExtractPlugin(),
    new webpack.SourceMapDevToolPlugin({
      filename: '*/dist/[file].map'
    }),
    new BugsnagSourceMapUploaderPlugin({
      apiKey: 'YOUR_API_KEY',
      endpoint: `http://localhost:${process.env.PORT}`,
      ignoredBundleExtensions: process.env.IGNORED_EXTENSIONS ? process.env.IGNORED_EXTENSIONS.split(',') : undefined,
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
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: false,
            },
          },
          'css-loader'
        ],
      },
    ],
  },
};

export default config;