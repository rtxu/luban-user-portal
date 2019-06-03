export default {
    // 「配置式路由」
    // 显式配置 routes 则禁掉「约定式路由」
    routes: [{
        path: '/',
        component: '../layouts/BasicLayout', // 相对于 page 目录的路径
        /*
        routes: [
            { path: '/', component: './HelloWorld' },
            { path: 'helloworld', component: './HelloWorld' },
            { path: 'puzzlecards', component: './PuzzleCards' },
            {
                path: '/dashboard',
                routes: [
                  { path: '/dashboard/analysis', component: 'Dashboard/Analysis' },
                  { path: '/dashboard/monitor', component: 'Dashboard/Monitor' },
                  { path: '/dashboard/workplace', component: 'Dashboard/Workplace' }
                ]
            },
        ],
        */
    }],

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