import {PermissionNode} from "@/utils/permission.js";

declare module 'vue-router' {
    interface RouteMeta {
        title: string
        requireAuth: boolean
        requirePermissions?: PermissionNode[]
        authFunction?: (user: UserModel) => boolean
    }
}

export {}