module.exports = {
  entry: './src/index.js',
  output: { path: __dirname, filename: 'index.js' },
  module: {
    rules: [
      // the 'transform-runtime' plugin tells babel to require the runtime
      // instead of inlining it.
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/env'],
            plugins: ['@babel/transform-runtime']
          }
        }
      }
    ]
  }
}
