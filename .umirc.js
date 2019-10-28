export default {
  // 「配置式路由」
  // 显式配置 routes 则禁掉「约定式路由」
  routes: [
    // component: 相对于 page 目录的路径
    { path: '/editor/:app', component: './editor/$app.js' },
    { path: '/playground/codemirror2', component: './playground/codemirror2.js' },
    { path: '/playground/alasql', component: './playground/alasql.js' },
    { path: '/playground/js_import_ts', component: './playground/js_import_ts.js' },
    { path: '/playground/ts_import_js', component: './playground/ts_import_js' },
    { path: '/playground/ts_import_ts', component: './playground/ts_import_ts' },
    { 
      path: '/', 
      component: '../layouts/BasicLayout',
      routes: [
        {
          path: '/',
          component: './index',
        },
      ],
    },
  ],

  /*
  proxy: {
    '/dev': {
      target: 'https://official-joke-api.appspot.com',
      changeOrigin: true,
      pathRewrite: { '^/dev': '' }
    }
  },
  */

  plugins: [
    ['umi-plugin-react', {
      antd: true,   // 引入 antd
      dva: true,    // 引入 dva
    }],
  ],

  chainWebpack(config, { webpack }) {
    // console.dir(config.module.rules);
  },
};