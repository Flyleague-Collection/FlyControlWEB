declare module 'vue-router' {
    interface RouteMeta {
        title: string
        requireAuth: boolean
        requirePermission?: bigint
        authFunction?: (user: UserModel) => boolean
    }
}

export {}