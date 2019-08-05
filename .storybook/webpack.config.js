const path = require('path');

module.exports = async ({ config }) => {

  config.module.rules.push({
    test: /\.less$/,
    use: [
      { 
        loader: 'style-loader', 
      }, 
      { 
        loader: 'css-loader', 
        options: {
          importLoaders: 1,
          modules: true,
          localIdentName: '[name]__[local]___[hash:base64:5]',
        }
      }, 
      { 
        loader: 'less-loader',
      },
    ],
    include: path.resolve(__dirname, '../src'),
    // exclude: path.resolve(__dirname, '../node_modules'),
  });

  /*
  console.log(config);
  console.dir(config.module.rules, { depth: null }) || config;
  */

  // console.log('typeof(config.resolve.alias: ', typeof(config.resolve.alias));
  config.resolve.alias['@'] = path.resolve(__dirname, '../src/');
  // console.log(config.resolve.alias);
  return config;
}