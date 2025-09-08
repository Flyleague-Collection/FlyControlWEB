import {createRouter, createWebHistory, RouteRecordRaw} from "vue-router";
import {useUserStore} from "@/store/user.js";

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        name: "Root",
        component: () => import("@/pages/Portal.vue"),
        meta: {
            requireAuth: false,
            title: "门户网页"
        }
    },
    {
        path: "/login",
        name: "Login",
        component: () => import("@/pages/user/Login.vue"),
        meta: {
            requireAuth: false,
            title: "登录页"
        }
    },
    {
        path: "/register",
        name: "Register",
        component: () => import("@/pages/user/Register.vue"),
        meta: {
            requireAuth: false,
            title: "注册页"
        }
    },
    {
        path: "/main",
        name: "Main",
        component: () => import("@/layout/SidebarLayout.vue"),
        meta: {
            requireAuth: true
        },
        children: [
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
                path: "/activities",
                name: "Activity",
                component: () => import("@/pages/activity/Activity.vue"),
                meta: {
                    requireAuth: true,
                    title: "活动页"
                }
            },
            {
                path: "/activities/:id",
                name: "ActivityDetail",
                component: () => import("@/pages/activity/ActivityDetail.vue"),
                meta: {
                    requireAuth: true,
                    title: "活动详情页"
                }
            },
            {
                path: "/online-map",
                name: "OnlineMap",
                component: () => import("@/pages/OnlineMap.vue"),
                meta: {
                    requireAuth: true,
                    title: "在线地图"
                }
            },
            {
                path: "/controllers/application",
                name: "Application",
                component: () => import("@/pages/controller/Application.vue"),
                meta: {
                    requireAuth: true,
                    title: "管制员申请"
                }
            },
            {
                path: "/controllers/activity",
                name: "ControllerActivity",
                component: () => import("@/pages/controller/Activity.vue"),
                meta: {
                    requireAuth: true,
                    title: "活动登记"
                }
            },
            {
                path: "/controllers/booking",
                name: "Booking",
                component: () => import("@/pages/controller/Booking.vue"),
                meta: {
                    requireAuth: true,
                    title: "考核预约"
                }
            },
            {
                path: "/controllers/profile",
                name: "ControllerProfile",
                component: () => import("@/pages/controller/Profile.vue"),
                meta: {
                    requireAuth: true,
                    title: "管制员档案"
                }
            },
            {
                path: "/ticket",
                name: "Ticket",
                component: () => import("@/pages/Ticket.vue"),
                meta: {
                    requireAuth: true,
                    title: "投诉与反馈中心"
                }
            },
            {
                path: "/admin/users",
                name: "AdminUsers",
                component: () => import("@/pages/admin/user/Users.vue"),
                meta: {
                    requireAuth: true,
                    title: "用户管理"
                }
            },
            {
                path: "/admin/controllers",
                name: "AdminControllers",
                component: () => import("@/pages/admin/controller/Controllers.vue"),
                meta: {
                    requireAuth: true,
                    title: "管制员管理"
                }
            },
            {
                path: "/admin/activities",
                name: "AdminActivities",
                component: () => import("@/pages/admin/activity/Activities.vue"),
                meta: {
                    requireAuth: true,
                    title: "活动管理"
                }
            },
            {
                path: "/admin/activities/:id",
                name: "AdminActivityEdit",
                component: () => import("@/pages/admin/activity/ActivityEdit.vue"),
                meta: {
                    requireAuth: true,
                    title: "编辑活动"
                }
            },
            {
                path: "/admin/activities/new",
                name: "AdminActivityCreate",
                component: () => import("@/pages/admin/activity/ActivityCreate.vue"),
                meta: {
                    requireAuth: true,
                    title: "新建活动"
                }
            },
            {
                path: "/admin/clients",
                name: "AdminClients",
                component: () => import("@/pages/admin/Online.vue"),
                meta: {
                    requireAuth: true,
                    title: "在线管理"
                }
            },
            {
                path: "/admin/tickets",
                name: "AdminTickets",
                component: () => import("@/pages/admin/Tickets.vue"),
                meta: {
                    requireAuth: true,
                    title: "工单管理"
                }
            },
            {
                path: "/admin/permissions",
                name: "AdminPermissions",
                component: () => import("@/pages/admin/Permissions.vue"),
                meta: {
                    requireAuth: true,
                    title: "权限管理"
                }
            },
            {
                path: "/admin/audit",
                name: "AdminAudit",
                component: () => import("@/pages/admin/Audit.vue"),
                meta: {
                    requireAuth: true,
                    title: "审计日志"
                }
            },
            {
                path: "/profile",
                name: "Profile",
                component: () => import("@/pages/user/Settings.vue"),
                meta: {
                    requireAuth: true,
                    title: "个人中心"
                }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, _, next) => {
    if (to.meta.title != null) {
        document.title = to.meta.title;
    }
    const userStore = useUserStore();
    if (to.meta.requireAuth) {
        if (userStore.isLogin) {
            next()
        } else {
            next({
                path: '/login',
                query: {redirect: to.fullPath}
            })
        }
    } else {
        next()
    }
})

export default router;