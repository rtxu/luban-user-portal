export default {
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
  },

  // global variables which could be overwritten by .umirc.local.js
  // see: https://umijs.org/guide/config.html#umirc-local-js
  define: {
    GITHUB_OAUTH_APP: {
      client_id: "1421764d694281e03269"
    },
    API_ENDPOINT: "https://luban-api.now.sh/api"
  }
};
