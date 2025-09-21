import {defineStore} from "pinia";
import {FormItemRule} from "element-plus";
import {computed, ComputedRef, Ref, ref} from "vue";

import request from "@/utils/request.js";
import {useUserStore} from "@/store/user.js";

export const useServerConfigStore = defineStore("server-config-store", () => {
    const config: Ref<ServerConfigModel> = ref({
        limits: {
            username_length_min: 4,
            username_length_max: 16,
            password_length_min: 6,
            password_length_max: 64,
            email_length_min: 4,
            email_length_max: 64,
            cid_min: 1,
            cid_max: 9999,
            simulator_server: true
        },
        image_limit: {
            max_allow_size: 5242880,
            allowed_ext: [".jpg", ".png", ".bmp", ".jpeg"]
        },
        email_send_interval: 60,
        facilities: [
            {
                id: 0,
                short_name: "Pilot",
                long_name: "Pilot"
            },
            {
                id: 1,
                short_name: "OBS",
                long_name: "Observer"
            },
            {
                id: 2,
                short_name: "DEL",
                long_name: "Clearance Delivery"
            },
            {
                id: 3,
                short_name: "GND",
                long_name: "Ground"
            },
            {
                id: 4,
                short_name: "TWR",
                long_name: "Tower"
            },
            {
                id: 5,
                short_name: "APP",
                long_name: "Approach/Departure"
            },
            {
                id: 6,
                short_name: "CTR",
                long_name: "Enroute"
            },
            {
                id: 7,
                short_name: "FSS",
                long_name: "Flight Service Station"
            }
        ],
        ratings: [
            {
                id: -1,
                short_name: "Baned",
                long_name: "Suspended"
            },
            {
                id: 0,
                short_name: "Normal",
                long_name: "Normal"
            },
            {
                id: 1,
                short_name: "OBS",
                long_name: "Observer"
            },
            {
                id: 2,
                short_name: "S1",
                long_name: "Tower Trainee"
            },
            {
                id: 3,
                short_name: "S2",
                long_name: "Tower Controller"
            },
            {
                id: 4,
                short_name: "S3",
                long_name: "Senior Student"
            },
            {
                id: 5,
                short_name: "C1",
                long_name: "Enroute Controller"
            },
            {
                id: 6,
                short_name: "C2",
                long_name: "Controller 2 (not in use)"
            },
            {
                id: 7,
                short_name: "C3",
                long_name: "Senior Controller"
            },
            {
                id: 8,
                short_name: "I1",
                long_name: "Instructor"
            },
            {
                id: 9,
                short_name: "I2",
                long_name: "Instructor 2 (not in use)"
            },
            {
                id: 10,
                short_name: "I3",
                long_name: "Senior Instructor"
            },
            {
                id: 11,
                short_name: "SUP",
                long_name: "Supervisor"
            },
            {
                id: 12,
                short_name: "ADM",
                long_name: "Administrator"
            }
        ]
    })

    const userStore = useUserStore();

    const getConfigFromServer = async () => {
        const response = await request.get<ServerConfigModel>(`/server/config`)
        if (response.status == 200) {
            config.value = response.data
        }
    }

    const usernameLimit: ComputedRef<FormItemRule[]> = computed<FormItemRule[]>((): FormItemRule[] => {
        return [
            {
                pattern: /^[a-zA-Z_][a-zA-Z0-9_]+$/,
                message: '用户名只能包含字母、数字和下划线且首位不能为数字',
                trigger: 'blur'
            },
            {
                min: config.value.limits.username_length_min,
                max: config.value.limits.username_length_max,
                message: `长度在${config.value.limits.username_length_min}到${config.value.limits.username_length_max}个字符`,
                trigger: 'blur'
            },
            {
                asyncValidator: async (_, value: string, callback) => {
                    if (await userStore.checkUsername(value)) {
                        callback()
                        return
                    }
                    callback(`该用户名已被注册`)
                },
                trigger: 'blur'
            }
        ]
    })

    const passwordLimit: ComputedRef<FormItemRule[]> = computed<FormItemRule[]>((): FormItemRule[] => {
        return [
            {
                min: config.value.limits.password_length_min,
                max: config.value.limits.password_length_max,
                message: `长度在${config.value.limits.password_length_min}到${config.value.limits.password_length_max}个字符`,
                trigger: 'blur'
            }
        ]
    })

    const emailLimit: ComputedRef<FormItemRule[]> = computed<FormItemRule[]>((): FormItemRule[] => {
        return [
            {type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur'},
            {
                min: config.value.limits.email_length_min,
                max: config.value.limits.email_length_max,
                message: `长度在${config.value.limits.email_length_min}到${config.value.limits.email_length_max}个字符`,
                trigger: 'blur'
            },
            {
                asyncValidator: async (_, value: string, callback) => {
                    if (await userStore.checkEmail(value)) {
                        callback()
                        return
                    }
                    callback(`该邮箱已被注册`)
                },
                trigger: 'blur'
            }
        ]
    })

    const cidLimit: ComputedRef<FormItemRule[]> = computed<FormItemRule[]>((): FormItemRule[] => {
        return [
            {
                asyncValidator: async (_, value: string, callback) => {
                    const cid = Number.parseInt(value)
                    if (isNaN(cid)) {
                        callback("CID必须由纯数字组成")
                        return
                    }
                    if (cid < 0) {
                        callback(`CID不能小于0`)
                        return
                    }
                    if (cid < config.value.limits.cid_min) {
                        callback(`CID不能小于${config.value.limits.cid_min}`)
                        return
                    }
                    if (cid > config.value.limits.cid_max) {
                        callback(`CID不能大于${config.value.limits.cid_max}`)
                        return
                    }
                    if (await userStore.checkCID(cid)) {
                        callback()
                        return
                    }
                    callback(`该CID已被占用`)
                },
                trigger: 'blur'
            }
        ]
    })

    const getRatingShortName = (rating: number): string => {
        return config.value.ratings[rating + 1].short_name
    }

    return {
        config,
        ratings: config.value.ratings,
        facilities: config.value.facilities,
        limits: config.value.limits,
        usernameLimit,
        passwordLimit,
        cidLimit,
        emailLimit,
        getConfigFromServer,
        getRatingShortName
    }
})
