import {createApp} from 'vue'
import App from './App.vue'
import * as VueRouter from 'vue-router';
import routes from "./config/route";
import Vant from 'vant';
import 'vant/lib/index.css';
import '../global.css'
import {getCurrentUser} from "./services/user";

const app = createApp(App);
app.use(Vant);

const router = VueRouter.createRouter({
    // 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: VueRouter.createWebHistory(),
    routes, // `routes: routes` 的缩写
})

// 全局路由守卫：未登录时自动跳转登录页
router.beforeEach(async (to, _from) => {
    // 不需要登录的页面直接放行
    if (to.meta.requiresAuth !== true) {
        return true;
    }

    const user = await getCurrentUser();
    if (!user) {
        // 未登录，跳转登录页并记录来源路径
        return {
            path: '/user/login',
            query: { redirect: to.fullPath },
        };
    }

    return true;
});

app.use(router);
app.mount('#app')
