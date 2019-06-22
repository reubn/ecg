const plugins = [
  require('autoprefixer'),
  require('postcss-nested'),
]

module.exports = ({env}) => {
  if(env === 'production') plugins.push(require('cssnano'))

  return {
    plugins
  }
}
