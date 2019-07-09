export default {
    // 「配置式路由」
    // 显式配置 routes 则禁掉「约定式路由」
    routes: [
        // component: 相对于 page 目录的路径
        { path: '/', component: '../layouts/BasicLayout' },
        { path: '/editor/:app', component: './editor/$app.js' },
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
};