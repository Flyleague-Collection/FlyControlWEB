export enum PermissionNode {
    AdminEntry = 1 << 0,
    UserShowList = 1 << 1,
    UserGetProfile = 1 << 2,
    UserSetPassword = 1 << 3,
    UserEditBaseInfo = 1 << 4,
    UserEditPermission = 1 << 5,
    UserEditRating = 1 << 6,
    ActivityPublish = 1 << 7,
    ActivityShowList = 1 << 8,
    ActivityEdit = 1 << 9,
    ActivityEditState = 1 << 10,
    ActivityEditPilotState = 1 << 11,
    ActivityDelete = 1 << 12,
    AuditLogShow = 1 << 13,
    ClientManagerEntry = 1 << 14,
    ClientSendMessage = 1 << 15,
    ClientKill = 1 << 16,
}

const permissionNodeMap = new Map<string, PermissionNode>([
    ["AdminEntry", PermissionNode.AdminEntry],
    ["UserShowList", PermissionNode.UserShowList],
    ["UserGetProfile", PermissionNode.UserGetProfile],
    ["UserSetPassword", PermissionNode.UserSetPassword],
    ["UserEditBaseInfo", PermissionNode.UserEditBaseInfo],
    ["UserEditPermission", PermissionNode.UserEditPermission],
    ["UserEditRating", PermissionNode.UserEditRating],
    ["ActivityPublish", PermissionNode.ActivityPublish],
    ["ActivityShowList", PermissionNode.ActivityShowList],
    ["ActivityEdit", PermissionNode.ActivityEdit],
    ["ActivityEditState", PermissionNode.ActivityEditState],
    ["ActivityEditPilotState", PermissionNode.ActivityEditPilotState],
    ["ActivityDelete", PermissionNode.ActivityDelete],
    ["AuditLogShow", PermissionNode.AuditLogShow],
    ["ClientManagerEntry", PermissionNode.ClientManagerEntry],
    ["ClientSendMessage", PermissionNode.ClientSendMessage],
    ["ClientKill", PermissionNode.ClientKill]
]);

export class Permission {
    private readonly permissionData: Record<PermissionNode, { name: string, desc: string, hasPermission: boolean }>

    constructor(permission: number) {
        this.permissionData = {
            [PermissionNode.AdminEntry]: {
                name: "AdminEntry",
                desc: "显示管理入口",
                hasPermission: (permission & PermissionNode.AdminEntry) != 0
            },
            [PermissionNode.UserShowList]: {
                name: "UserShowList",
                desc: "可以查看用户列表",
                hasPermission: (permission & PermissionNode.UserShowList) != 0
            },
            [PermissionNode.UserGetProfile]: {
                name: "UserGetProfile",
                desc: "可以获取用户详细信息",
                hasPermission: (permission & PermissionNode.UserGetProfile) != 0
            },
            [PermissionNode.UserSetPassword]: {
                name: "UserSetPassword",
                desc: "可以设置用户密码",
                hasPermission: (permission & PermissionNode.UserSetPassword) != 0
            },
            [PermissionNode.UserEditBaseInfo]: {
                name: "UserEditBaseInfo",
                desc: "可以编辑用户基础信息",
                hasPermission: (permission & PermissionNode.UserEditBaseInfo) != 0
            },
            [PermissionNode.UserEditPermission]: {
                name: "UserEditPermission",
                desc: "可以编辑用户飞控权限",
                hasPermission: (permission & PermissionNode.UserEditPermission) != 0
            },
            [PermissionNode.UserEditRating]: {
                name: "UserEditRating",
                desc: "可以编辑用户管制权限",
                hasPermission: (permission & PermissionNode.UserEditRating) != 0
            },
            [PermissionNode.ActivityPublish]: {
                name: "ActivityPublish",
                desc: "可以发布活动",
                hasPermission: (permission & PermissionNode.ActivityPublish) != 0
            },
            [PermissionNode.ActivityShowList]: {
                name: "ActivityShowList",
                desc: "可以查看活动列表",
                hasPermission: (permission & PermissionNode.ActivityShowList) != 0
            },
            [PermissionNode.ActivityEdit]: {
                name: "ActivityEdit",
                desc: "可以编辑活动",
                hasPermission: (permission & PermissionNode.ActivityEdit) != 0
            },
            [PermissionNode.ActivityEditState]: {
                name: "ActivityEditState",
                desc: "可以编辑活动状态",
                hasPermission: (permission & PermissionNode.ActivityEditState) != 0
            },
            [PermissionNode.ActivityEditPilotState]: {
                name: "ActivityEditPilotState",
                desc: "可以编辑活动飞行员状态",
                hasPermission: (permission & PermissionNode.ActivityEditPilotState) != 0
            },
            [PermissionNode.ActivityDelete]: {
                name: "ActivityDelete",
                desc: "可以删除活动",
                hasPermission: (permission & PermissionNode.ActivityDelete) != 0
            },
            [PermissionNode.AuditLogShow]: {
                name: "AuditLogShow",
                desc: "可以查看审计日志",
                hasPermission: (permission & PermissionNode.AuditLogShow) != 0
            },
            [PermissionNode.ClientManagerEntry]: {
                name: "ClientManagerEntry",
                desc: "可以进入在线管理",
                hasPermission: (permission & PermissionNode.ClientManagerEntry) != 0
            },
            [PermissionNode.ClientSendMessage]: {
                name: "ClientSendMessage",
                desc: "可以通过网页向客户端发送消息",
                hasPermission: (permission & PermissionNode.ClientSendMessage) != 0
            },
            [PermissionNode.ClientKill]: {
                name: "ClientKill",
                desc: "可以通过网页踢出客户端",
                hasPermission: (permission & PermissionNode.ClientKill) != 0
            }
        };
    }

    hasPermission(permissionNode: PermissionNode): boolean {
        return this.permissionData[permissionNode].hasPermission
    }

    hasPermissionString(permissionNode: string): boolean {
        const node = permissionNodeMap.get(permissionNode)
        if (node == undefined) {
            return false;
        }
        return this.permissionData[node].hasPermission
    }

    hasPermissions(...permissions: PermissionNode[]): boolean {
        for (const permission of permissions) {
            if (!this.hasPermission(permission)) {
                return false;
            }
        }
        return true;
    }

    getPermissionsRecord(): Record<PermissionNode, { name: string, desc: string, hasPermission: boolean }> {
        return this.permissionData;
    }
}












