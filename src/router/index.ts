import {createRouter, createWebHistory, RouteRecordRaw} from "vue-router";

const routes: RouteRecordRaw[] = [
    {
        path: "",
        name: "Root",
        component: () => import("@/pages/Home.vue"),
        meta: {
            requireAuth: true,
            title: "主页"
        }
    },
    {
        path: "/home",
        name: "Home",
        component: () => import("@/pages/Home.vue"),
        meta: {
            requireAuth: true,
            title: "主页"
        }
    },
    {
        path: "/login",
        name: "Login",
        component: () => import("@/pages/Login.vue"),
        meta: {
            requireAuth: false,
            title: "登录页"
        }
    },
    {
        path: "/activities",
        name: "Activity",
        component: () => import("@/pages/Activity.vue"),
        meta: {
            requireAuth: false,
            title: "登录页"
        }
    },
    {
        path: "/activities/:id",
        name: "ActivityDetail",
        component: () => import("@/pages/ActivityDetail.vue"),
        meta: {
            requireAuth: false,
            title: "登录页"
        }
    },
    {
        path: "/online-map",
        name: "OnlineMap",
        component: () => import("@/pages/OnlineMap.vue"),
        meta: {
            requireAuth: false,
            title: "登录页"
        }
    },
    {
        path: "/controller",
        name: "Controller",
        component: () => import("@/pages/Controller.vue"),
        meta: {
            requireAuth: false,
            title: "登录页"
        }
    },
    {
        path: "/admin",
        name: "Admin",
        component: () => import("@/pages/Admin.vue"),
        meta: {
            requireAuth: false,
            title: "登录页"
        }
    },
    {
        path: "/profile",
        name: "Profile",
        component: () => import("@/pages/Settings.vue"),
        meta: {
            requireAuth: false,
            title: "登录页"
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})


// router.beforeEach((to, _, next) => {
//     if (to.meta.title != null) {
//         document.title = to.meta.title;
//     }
//     const userStore = useUserStore();
//     if (to.meta.requireAuth) {
//         if (userStore.isLogin) {
//             next()
//         } else {
//             next({
//                 path: '/login',
//                 query: {redirect: to.fullPath}
//             })
//         }
//     } else {
//         next()
//     }
// })

export default router;