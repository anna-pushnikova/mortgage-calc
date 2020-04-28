const path = require('path');

const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;
const optimization = () => {
  const config =  {
    splitChunks: {
      chunks: 'all'
    }
  }
  if (isProd) {
    config.minimizer = [
      new OptimizeCssPlugin(),
      new TerserWebpackPlugin()
    ]
  }
  return config
}

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

module.exports = {
  context: path.resolve(__dirname, 'src'),
  mode: 'development',
  entry: {
    main: ['@babel/polyfill', './js/script.js']
  },
  output: {
    filename: filename('js'),
    path: path.resolve(__dirname, 'dist'),
    publicPath: './'
  },
  devtool: isDev ? 'source-map' : '',
  optimization: optimization(),
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env'
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: [ 
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
              reloadAll: true
            },
          }, 
        "css-loader" 
        ] 
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
                publicPath: './css',
                minimize: true
            }
          },
          { loader: "css-loader" },
          { loader: "sass-loader" } // compiles Sass to CSS
        ]
      }
    ]
  },
  plugins: [
      new HTMLWebpackPlugin({
        template: './index.html',
        minify: {
          collapseWhitespace: isProd
        }
      }),
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].css',
        allChunks: true
      }),
      new CopyWebpackPlugin()
    ],
    resolve: { 
      modules: [
        'node_modules',
        path.resolve('./src/')
      ],
      extensions: 
        ['.js','.css', '.scss']
    }
};