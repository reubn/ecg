const {resolve} = require('path')
const {readFileSync} = require('fs')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const Critters = require('critters-webpack-plugin')

// Ensure Full Errors are Shown
process.on('unhandledRejection', r => console.error(r))

const devMode = process.env.NODE_ENV !== 'production'

const config = {
  mode: devMode ? 'development' : 'production',
  entry: ['@babel/polyfill', './src'],
  output: {
    path: resolve('./build'),
    filename: '[chunkhash].js',
    libraryTarget: 'umd'
  },
  devtool: devMode ? 'source-map' : undefined,
  module: {
    rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        include: /node_modules/,
        use: ['style-loader',
          {
            loader: 'css-loader',
            query: {
              modules: false,
              importLoaders: 1
            }
          },
            'postcss-loader'
        ]
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ['style-loader',
          {
            loader: 'css-loader',
            query: {
              modules: {
                localIdentName: devMode ? '[local]-[emoji:1]' : '[emoji:2]'
              },
              importLoaders: 1
            }
          },
            'postcss-loader'
        ]
      },
      {
        test: /\.(png|geojson)$/,
        use: 'file-loader'
      }
    ]
},
  plugins: [
    new HtmlWebpackPlugin({
      title: 'ECG',
      meta: {
        viewport: 'viewport-fit=cover',
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'black-translucent'
      }
    }),
    new Critters(),
  ],
  devServer: devMode ? {
    publicPath: '/',
    contentBase: './build',
    compress: true,
    host: 'reumac.local',
    disableHostCheck: true,
    port: 80,
    inline: true,
    https: false/*({
      key: devMode && readFileSync('/Users/reuben/reumac.local+4-key.pem'),
      cert: devMode && readFileSync('/Users/reuben/reumac.local+4.pem'),
      ca: devMode && readFileSync('/Users/reuben/Library/Application Support/mkcert/reubenRootCA.pem'),
    })*/
  } : undefined,
  resolve: {
    extensions: ['.wasm', '.mjs', '.js', '.css', '.json', '.geojson']
  }
}

module.exports = config
