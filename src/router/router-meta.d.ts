import {PermissionNode} from "@/utils/permission.js";

declare module 'vue-router' {
    interface RouteMeta {
        title?: string
        requirePermissions: PermissionNode[]
        requireAuth: boolean
    }
}

export {}