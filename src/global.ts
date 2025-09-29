export const Global = {
    version: "0.8.3",
    whatsNew: "<p>1、添加活动页面与飞行计划页面的联动</p><p>2、修复报文查询在移动端显示问题</p><p>3、修复更新公告在移动端显示问题</p><p>4、为主页适配移动端显示</p>",
    controllerRecordTypes: [
        {
            label: "面试",
            value: 0
        },
        {
            label: "模拟机",
            value: 1
        },
        {
            label: "权限变动",
            value: 2
        },
        {
            label: "训练内容",
            value: 3
        },
        {
            label: "UM权限变动",
            value: 4
        },
        {
            label: "Solo权限变动",
            value: 5
        },
        {
            label: "客座权限变动",
            value: 6
        },
        {
            label: "其他内容",
            value: 7
        }
    ],
    ticketTypes: [
        {
            label: "建议",
            value: 0,
            type: "primary"
        },
        {
            label: "Bug反馈",
            value: 1,
            type: "warning"
        },
        {
            label: "投诉",
            value: 2,
            type: "danger"
        },
        {
            label: "表扬",
            value: 3,
            type: "success"
        },
        {
            label: "其他",
            value: 4,
            type: "info"
        }
    ],
    supportedPlatforms: [
        {
            label: "Vatprc(Vatsim)",
            value: "Vatprc(Vatsim)"
        },
        {
            label: "Skyline",
            value: "Skyline"
        },
        {
            label: "Xflysim",
            value: "Xflysim"
        },
        {
            label: "Chinaflier",
            value: "Chinaflier"
        },
        {
            label: "Sino",
            value: "Sino"
        }
    ],
    announcementType: [
        {
            label: "普通公告",
            value: 0,
            color: "#45a1ba"
        },
        {
            label: "空管中心公告",
            value: 1,
            color: "#45ba99"
        },
        {
            label: "技术组公告",
            value: 2,
            color: "#4566ba"
        }
    ]
}

export enum Ratings {
    Ban = -1,
    Normal,
    Observer,
    STU1,
    STU2,
    STU3,
    CTR1,
    CTR2,
    CTR3,
    Instructor1,
    Instructor2,
    Instructor3,
    Supervisor,
    Administrator
}

export enum ApplicationStatus {
    Submitted,
    Processing,
    Passed,
    Rejected
}

export const getAnnouncementTypeColor = (id: number): string => {
    return Global.announcementType[id].color;
}

export const getAnnouncementTypeLabel = (id: number): string => {
    return Global.announcementType[id].label;
}