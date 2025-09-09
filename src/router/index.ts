import {createRouter, createWebHistory, RouteRecordRaw} from "vue-router";
import {useUserStore} from "@/store/user.js";
import {PermissionNode} from "@/utils/permission.js";
import {showError} from "@/utils/message.js";
import request from "@/utils/request.js";

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        name: "Root",
        component: () => import("@/pages/Portal.vue"),
        meta: {
            requireAuth: false,
            title: "门户网页",
            requirePermissions: []
        }
    },
    {
        path: "/login",
        name: "Login",
        component: () => import("@/pages/user/Login.vue"),
        meta: {
            requireAuth: false,
            title: "登录页",
            requirePermissions: []
        }
    },
    {
        path: "/register",
        name: "Register",
        component: () => import("@/pages/user/Register.vue"),
        meta: {
            requireAuth: false,
            title: "注册页",
            requirePermissions: []
        }
    },
    {
        path: "/main",
        name: "Main",
        component: () => import("@/layout/SidebarLayout.vue"),
        meta: {
            requireAuth: true,
            requirePermissions: []
        },
        children: [
            {
                path: "/home",
                name: "Home",
                component: () => import("@/pages/Home.vue"),
                meta: {
                    requireAuth: true,
                    title: "主页",
                    requirePermissions: []
                }
            },
            {
                path: "/activities",
                name: "Activity",
                component: () => import("@/pages/activity/Activity.vue"),
                meta: {
                    requireAuth: true,
                    title: "活动页",
                    requirePermissions: []
                }
            },
            {
                path: "/activities/:id",
                name: "ActivityDetail",
                component: () => import("@/pages/activity/ActivityDetail.vue"),
                meta: {
                    requireAuth: true,
                    title: "活动详情页",
                    requirePermissions: []
                }
            },
            {
                path: "/online-map",
                name: "OnlineMap",
                component: () => import("@/pages/OnlineMap.vue"),
                meta: {
                    requireAuth: true,
                    title: "在线地图",
                    requirePermissions: []
                }
            },
            {
                path: "/controllers/application",
                name: "Application",
                component: () => import("@/pages/controller/Application.vue"),
                meta: {
                    requireAuth: true,
                    title: "管制员申请",
                    requirePermissions: []
                }
            },
            {
                path: "/controllers/activity",
                name: "ControllerActivity",
                component: () => import("@/pages/controller/Activity.vue"),
                meta: {
                    requireAuth: true,
                    title: "活动登记",
                    requirePermissions: []
                }
            },
            {
                path: "/controllers/booking",
                name: "Booking",
                component: () => import("@/pages/controller/Booking.vue"),
                meta: {
                    requireAuth: true,
                    title: "考核预约",
                    requirePermissions: []
                }
            },
            {
                path: "/controllers/profile",
                name: "ControllerProfile",
                component: () => import("@/pages/controller/Profile.vue"),
                meta: {
                    requireAuth: true,
                    title: "管制员档案",
                    requirePermissions: []
                }
            },
            {
                path: "/ticket",
                name: "Ticket",
                component: () => import("@/pages/Ticket.vue"),
                meta: {
                    requireAuth: true,
                    title: "投诉与反馈中心",
                    requirePermissions: []
                }
            },
            {
                path: "/admin/users",
                name: "AdminUsers",
                component: () => import("@/pages/admin/user/Users.vue"),
                meta: {
                    requireAuth: true,
                    title: "用户管理",
                    requirePermissions: [PermissionNode.UserShowList]
                }
            },
            {
                path: "/admin/controllers",
                name: "AdminControllers",
                component: () => import("@/pages/admin/controller/Controllers.vue"),
                meta: {
                    requireAuth: true,
                    title: "管制员管理",
                    requirePermissions: [PermissionNode.UserShowList]
                }
            },
            {
                path: "/admin/activities",
                name: "AdminActivities",
                component: () => import("@/pages/admin/activity/Activities.vue"),
                meta: {
                    requireAuth: true,
                    title: "活动管理",
                    requirePermissions: [PermissionNode.ActivityShowList]
                }
            },
            {
                path: "/admin/activities/:id",
                name: "AdminActivityEdit",
                component: () => import("@/pages/admin/activity/ActivityEdit.vue"),
                meta: {
                    requireAuth: true,
                    title: "编辑活动",
                    requirePermissions: [PermissionNode.ActivityShowList, PermissionNode.ActivityEdit]
                }
            },
            {
                path: "/admin/activities/new",
                name: "AdminActivityCreate",
                component: () => import("@/pages/admin/activity/ActivityCreate.vue"),
                meta: {
                    requireAuth: true,
                    title: "新建活动",
                    requirePermissions: [PermissionNode.ActivityShowList, PermissionNode.ActivityPublish]
                }
            },
            {
                path: "/admin/clients",
                name: "AdminClients",
                component: () => import("@/pages/admin/Online.vue"),
                meta: {
                    requireAuth: true,
                    title: "在线管理",
                    requirePermissions: [PermissionNode.ClientManagerEntry]
                }
            },
            {
                path: "/admin/tickets",
                name: "AdminTickets",
                component: () => import("@/pages/admin/Tickets.vue"),
                meta: {
                    requireAuth: true,
                    title: "工单管理",
                    requirePermissions: []
                }
            },
            {
                path: "/admin/permissions",
                name: "AdminPermissions",
                component: () => import("@/pages/admin/permission/Permissions.vue"),
                meta: {
                    requireAuth: true,
                    title: "权限管理",
                    requirePermissions: [PermissionNode.UserShowList, PermissionNode.UserEditPermission]
                }
            },
            {
                path: "/admin/permissions/:id",
                name: "AdminEditPermission",
                component: () => import("@/pages/admin/permission/EditPermission.vue"),
                meta: {
                    requireAuth: true,
                    title: "编辑用户权限",
                    requirePermissions: [PermissionNode.UserShowList, PermissionNode.UserEditPermission]
                }
            },
            {
                path: "/admin/audit",
                name: "AdminAudit",
                component: () => import("@/pages/admin/Audit.vue"),
                meta: {
                    requireAuth: true,
                    title: "审计日志",
                    requirePermissions: [PermissionNode.AuditLogShow]
                }
            },
            {
                path: "/profile",
                name: "Profile",
                component: () => import("@/pages/user/Settings.vue"),
                meta: {
                    requireAuth: true,
                    title: "个人中心",
                    requirePermissions: []
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
            if (userStore.permission.hasPermissions(...to.meta.requirePermissions)) {
                next()
            } else {
                request.post("/audits/unlawful_overreach",
                    {access_path: to.fullPath},
                    {headers: {"Authorization": `Bearer ${userStore.token}`}})
                    .then(_ => showError("非法的越权访问, 日志已记录"))
                userStore.logout()
            }
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