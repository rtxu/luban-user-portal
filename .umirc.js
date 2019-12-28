export default {
  // 「配置式路由」
  // 显式配置 routes 则禁掉「约定式路由」
  /*
  routes: [
    // component: 相对于 page 目录的路径
    { path: "/playground/component", component: "./playground/component.jsx" },
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
    { path: "/auth/login", component: "./auth/login.js" },
    { path: "/auth/login-success", component: "./auth/login-success.js" },
    { path: "/editor/:app", component: "./editor/$app.js" },
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
  */

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

  // TODO(ruitao.xu): optimizing for production
  // ref: https://tailwindcss.com/course/optimizing-for-production
  extraPostCSSPlugins: [require("tailwindcss"), require("autoprefixer")],

  chainWebpack(config, { webpack }) {
    console.log("typeof rules", typeof config.module.rules);
    const store = config.module.rules.store;
    for (const [ruleName, rule] of store.entries()) {
      console.log(`==== rule: ${ruleName} ====`);
      console.log("test: ", rule.uses.parent.store.get("test"));
      console.log("uses: ", rule.uses.store.keys());
      /*
      const iterKeys = ["uses", "test"];
      for (const key of iterKeys) {
        if (key in rule) {
          console.log(key, ": ", rule[key]);
        }
      }
      */
    }
  }
};
