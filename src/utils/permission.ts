export enum PermissionNode {
    AdminEntry = 1 << 0,
    UserShowList = 1 << 1,
    UserGetProfile = 1 << 2,
    UserSetPassword = 1 << 3,
    UserEditBaseInfo = 1 << 4,
    UserEditPermission = 1 << 5,
    ControllerShowList = 1 << 6,
    ControllerTier2Rating = 1 << 7,
    ControllerEditRating = 1 << 8,
    ControllerShowRecord = 1 << 9,
    ControllerCreateRecord = 1 << 10,
    ControllerDeleteRecord = 1 << 11,
    ControllerChangeUnderMonitor = 1 << 12,
    ControllerChangeSolo = 1 << 13,
    ControllerChangeGuest = 1 << 14,
    ActivityPublish = 1 << 15,
    ActivityShowList = 1 << 16,
    ActivityEdit = 1 << 17,
    ActivityEditState = 1 << 18,
    ActivityEditPilotState = 1 << 19,
    ActivityDelete = 1 << 20,
    AuditLogShow = 1 << 21,
    TicketShowList = 1 << 22,
    TicketReply = 1 << 23,
    TicketRemove = 1 << 24,
    FlightPlanShowList = 1 << 25,
    FlightPlanChangeLock = 1 << 26,
    FlightPlanDelete = 1 << 27,
    ClientManagerEntry = 1 << 28,
    ClientSendMessage = 1 << 29,
    ClientKill = 1 << 30,
    ClientSendBroadcastMessage = 1 << 31
}


const permissionNodeMap = new Map<string, PermissionNode>([
    ["AdminEntry", PermissionNode.AdminEntry],
    ["UserShowList", PermissionNode.UserShowList],
    ["UserGetProfile", PermissionNode.UserGetProfile],
    ["UserSetPassword", PermissionNode.UserSetPassword],
    ["UserEditBaseInfo", PermissionNode.UserEditBaseInfo],
    ["UserEditPermission", PermissionNode.UserEditPermission],
    ["ControllerShowList", PermissionNode.ControllerShowList],
    ["ControllerTier2Rating", PermissionNode.ControllerTier2Rating],
    ["ControllerEditRating", PermissionNode.ControllerEditRating],
    ["ControllerShowRecord", PermissionNode.ControllerShowRecord],
    ["ControllerCreateRecord", PermissionNode.ControllerCreateRecord],
    ["ControllerDeleteRecord", PermissionNode.ControllerDeleteRecord],
    ["ControllerChangeUnderMonitor", PermissionNode.ControllerChangeUnderMonitor],
    ["ControllerChangeSolo", PermissionNode.ControllerChangeSolo],
    ["ControllerChangeGuest", PermissionNode.ControllerChangeGuest],
    ["ActivityPublish", PermissionNode.ActivityPublish],
    ["ActivityShowList", PermissionNode.ActivityShowList],
    ["ActivityEdit", PermissionNode.ActivityEdit],
    ["ActivityEditState", PermissionNode.ActivityEditState],
    ["ActivityEditPilotState", PermissionNode.ActivityEditPilotState],
    ["ActivityDelete", PermissionNode.ActivityDelete],
    ["AuditLogShow", PermissionNode.AuditLogShow],
    ["TicketShowList", PermissionNode.TicketShowList],
    ["TicketReply", PermissionNode.TicketReply],
    ["TicketRemove", PermissionNode.TicketRemove],
    ["FlightPlanShowList", PermissionNode.FlightPlanShowList],
    ["FlightPlanChangeLock", PermissionNode.FlightPlanChangeLock],
    ["FlightPlanDelete", PermissionNode.FlightPlanDelete],
    ["ClientManagerEntry", PermissionNode.ClientManagerEntry],
    ["ClientSendMessage", PermissionNode.ClientSendMessage],
    ["ClientKill", PermissionNode.ClientKill],
    ["ClientSendBroadcastMessage", PermissionNode.ClientSendBroadcastMessage],
]);

export class Permission {
    private readonly permissionData: Record<PermissionNode, { name: string, desc: string, hasPermission: boolean }>

    constructor(permission: number) {
        this.permissionData = {
            [PermissionNode.AdminEntry]: {
                name: "AdminEntry",
                desc: "显示管理入口",
                hasPermission: (permission & PermissionNode.AdminEntry) == PermissionNode.AdminEntry
            },
            [PermissionNode.UserShowList]: {
                name: "UserShowList",
                desc: "可以查看用户列表",
                hasPermission: (permission & PermissionNode.UserShowList) == PermissionNode.UserShowList
            },
            [PermissionNode.UserGetProfile]: {
                name: "UserGetProfile",
                desc: "可以获取用户详细信息",
                hasPermission: (permission & PermissionNode.UserGetProfile) == PermissionNode.UserGetProfile
            },
            [PermissionNode.UserSetPassword]: {
                name: "UserSetPassword",
                desc: "可以设置用户密码",
                hasPermission: (permission & PermissionNode.UserSetPassword) == PermissionNode.UserSetPassword
            },
            [PermissionNode.UserEditBaseInfo]: {
                name: "UserEditBaseInfo",
                desc: "可以编辑用户基础信息",
                hasPermission: (permission & PermissionNode.UserEditBaseInfo) == PermissionNode.UserEditBaseInfo
            },
            [PermissionNode.UserEditPermission]: {
                name: "UserEditPermission",
                desc: "可以编辑用户飞控权限",
                hasPermission: (permission & PermissionNode.UserEditPermission) == PermissionNode.UserEditPermission
            },
            [PermissionNode.ControllerShowList]: {
                name: "ControllerShowList",
                desc: "可以查看管制员列表",
                hasPermission: (permission & PermissionNode.ControllerShowList) == PermissionNode.ControllerShowList
            },
            [PermissionNode.ControllerTier2Rating]: {
                name: "ControllerTier2Rating",
                desc: "可以编辑管制员Tier2权限",
                hasPermission: (permission & PermissionNode.ControllerTier2Rating) == PermissionNode.ControllerTier2Rating
            },
            [PermissionNode.ControllerEditRating]: {
                name: "ControllerEditRating",
                desc: "可以编辑管制员管制权限",
                hasPermission: (permission & PermissionNode.ControllerEditRating) == PermissionNode.ControllerEditRating
            },
            [PermissionNode.ControllerShowRecord]: {
                name: "ControllerShowRecord",
                desc: "可以查看管制员履历",
                hasPermission: (permission & PermissionNode.ControllerShowRecord) == PermissionNode.ControllerShowRecord
            },
            [PermissionNode.ControllerCreateRecord]: {
                name: "ControllerCreateRecord",
                desc: "可以创建管制员履历",
                hasPermission: (permission & PermissionNode.ControllerCreateRecord) == PermissionNode.ControllerCreateRecord
            },
            [PermissionNode.ControllerDeleteRecord]: {
                name: "ControllerDeleteRecord",
                desc: "可以删除管制员履历",
                hasPermission: (permission & PermissionNode.ControllerDeleteRecord) == PermissionNode.ControllerDeleteRecord
            },
            [PermissionNode.ControllerChangeUnderMonitor]: {
                name: "ControllerChangeUnderMonitor",
                desc: "可以修改管制员UM状态",
                hasPermission: (permission & PermissionNode.ControllerChangeUnderMonitor) == PermissionNode.ControllerChangeUnderMonitor
            },
            [PermissionNode.ControllerChangeSolo]: {
                name: "ControllerChangeSolo",
                desc: "可以修改管制员Solo状态",
                hasPermission: (permission & PermissionNode.ControllerChangeSolo) == PermissionNode.ControllerChangeSolo
            },
            [PermissionNode.ControllerChangeGuest]: {
                name: "ControllerChangeGuest",
                desc: "可以修改管制员客座状态",
                hasPermission: (permission & PermissionNode.ControllerChangeGuest) == PermissionNode.ControllerChangeGuest
            },
            [PermissionNode.ActivityPublish]: {
                name: "ActivityPublish",
                desc: "可以发布活动",
                hasPermission: (permission & PermissionNode.ActivityPublish) == PermissionNode.ActivityPublish
            },
            [PermissionNode.ActivityShowList]: {
                name: "ActivityShowList",
                desc: "可以查看活动列表",
                hasPermission: (permission & PermissionNode.ActivityShowList) == PermissionNode.ActivityShowList
            },
            [PermissionNode.ActivityEdit]: {
                name: "ActivityEdit",
                desc: "可以编辑活动",
                hasPermission: (permission & PermissionNode.ActivityEdit) == PermissionNode.ActivityEdit
            },
            [PermissionNode.ActivityEditState]: {
                name: "ActivityEditState",
                desc: "可以编辑活动状态",
                hasPermission: (permission & PermissionNode.ActivityEditState) == PermissionNode.ActivityEditState
            },
            [PermissionNode.ActivityEditPilotState]: {
                name: "ActivityEditPilotState",
                desc: "可以编辑活动飞行员状态",
                hasPermission: (permission & PermissionNode.ActivityEditPilotState) == PermissionNode.ActivityEditPilotState
            },
            [PermissionNode.ActivityDelete]: {
                name: "ActivityDelete",
                desc: "可以删除活动",
                hasPermission: (permission & PermissionNode.ActivityDelete) == PermissionNode.ActivityDelete
            },
            [PermissionNode.AuditLogShow]: {
                name: "AuditLogShow",
                desc: "可以查看审计日志",
                hasPermission: (permission & PermissionNode.AuditLogShow) == PermissionNode.AuditLogShow
            },
            [PermissionNode.TicketShowList]: {
                name: "TicketShowList",
                desc: "可以查看工单列表",
                hasPermission: (permission & PermissionNode.TicketShowList) == PermissionNode.TicketShowList
            },
            [PermissionNode.TicketReply]: {
                name: "TicketReply",
                desc: "可以回复工单",
                hasPermission: (permission & PermissionNode.TicketReply) == PermissionNode.TicketReply
            },
            [PermissionNode.TicketRemove]: {
                name: "TicketRemove",
                desc: "可以删除工单",
                hasPermission: (permission & PermissionNode.TicketRemove) == PermissionNode.TicketRemove
            },
            [PermissionNode.FlightPlanShowList]: {
                name: "FlightPlanShowList",
                desc: "可以查看飞行计划列表",
                hasPermission: (permission & PermissionNode.FlightPlanShowList) == PermissionNode.FlightPlanShowList
            },
            [PermissionNode.FlightPlanChangeLock]: {
                name: "FlightPlanChangeLock",
                desc: "可以切换飞行计划锁定状态",
                hasPermission: (permission & PermissionNode.FlightPlanChangeLock) == PermissionNode.FlightPlanChangeLock
            },
            [PermissionNode.FlightPlanDelete]: {
                name: "FlightPlanDelete",
                desc: "可以删除飞行计划",
                hasPermission: (permission & PermissionNode.FlightPlanDelete) == PermissionNode.FlightPlanDelete
            },
            [PermissionNode.ClientManagerEntry]: {
                name: "ClientManagerEntry",
                desc: "可以进入在线管理页面",
                hasPermission: (permission & PermissionNode.ClientManagerEntry) == PermissionNode.ClientManagerEntry
            },
            [PermissionNode.ClientSendMessage]: {
                name: "ClientSendMessage",
                desc: "可以向客户端发送消息",
                hasPermission: (permission & PermissionNode.ClientSendMessage) == PermissionNode.ClientSendMessage
            },
            [PermissionNode.ClientKill]: {
                name: "ClientKill",
                desc: "可以踢出客户端",
                hasPermission: (permission & PermissionNode.ClientKill) == PermissionNode.ClientKill
            },
            [PermissionNode.ClientSendBroadcastMessage]: {
                name: "ClientSendBroadcastMessage",
                desc: "可以发送广播消息",
                hasPermission: (permission & PermissionNode.ClientSendBroadcastMessage) == PermissionNode.ClientSendBroadcastMessage
            }
        };
    }

    hasPermission(permissionNode: PermissionNode): boolean {
        return this.permissionData[permissionNode].hasPermission
    }

    hasAnyPermissions(...permissions: PermissionNode[]): boolean {
        for (const permission of permissions) {
            if (this.hasPermission(permission)) {
                return true;
            }
        }
        return false;
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












