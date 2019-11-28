const CompressionPlugin = require("compression-webpack-plugin");

export default {
  // 「配置式路由」
  // 显式配置 routes 则禁掉「约定式路由」
  routes: [
    // component: 相对于 page 目录的路径
    { path: "/editor/:app", component: "./editor/$app.js" },
    {
      path: "/playground/codemirror2",
      component: "./playground/codemirror2.js"
    },
    { path: "/playground/alasql", component: "./playground/alasql.js" },
    {
      path: "/playground/js_import_ts",
      component: "./playground/js_import_ts.js"
    },
    {
      path: "/playground/ts_import_js",
      component: "./playground/ts_import_js"
    },
    {
      path: "/playground/ts_import_ts",
      component: "./playground/ts_import_ts"
    },
    {
      path: "/app",
      component: "../layouts/UserLayout",
      routes: [{ path: "./:app", component: "./app/$app.js" }]
    },
    {
      path: "/",
      component: "../layouts/AdminLayout",
      routes: [
        {
          path: "/",
          component: "./index"
        }
      ]
    }
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
    [
      "umi-plugin-react",
      {
        antd: true, // 引入 antd
        dva: true // 引入 dva
      }
    ]
  ],

  chainWebpack(config, { webpack }) {
    // console.dir(config.module.rules);
    if (process.env.NODE_ENV === "production") {
      //gzip压缩
      config.plugin("compression-webpack-plugin").use(CompressionPlugin, [
        {
          test: /\.js$|\.html$|\.css$/, //匹配文件名
          threshold: 10240, //对超过10k的数据压缩
          deleteOriginalAssets: false //不删除源文件
        }
      ]);
    }
  }
};
