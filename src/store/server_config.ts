import {FormItemRule} from "element-plus";
import {defineStore} from "pinia";
import {computed, ComputedRef, Ref, ref} from "vue";

import ApiServer from "@/api/server.js";
import {showError} from "@/utils/message.js";
import ApiUser from "@/api/user.js";

export const useServerConfigStore = defineStore("server-config-store", () => {
    const limits = ref({
        username_length_min: 4,
        username_length_max: 16,
        password_length_min: 6,
        password_length_max: 64,
        email_length_min: 4,
        email_length_max: 64,
        cid_min: 1,
        cid_max: 9999
    })
    const config: Ref<ServerConfigModel> = ref({
        image_limit: {
            max_allow_size: 0,
            allowed_ext: []
        },
        file_limit: {
            max_allow_size: 0,
            allowed_ext: []
        },
        email_send_interval: 0,
        facilities: [],
        ratings: []
    })

    const getConfigFromServer = async () => {
        const data = await ApiServer.getServerConfig();
        if (data == null) {
            showError("加载服务器配置失败, 请联系管理员");
        }
        config.value = data;
    }

    const usernameLimit: ComputedRef<FormItemRule[]> = computed<FormItemRule[]>((): FormItemRule[] => {
        return [
            {
                pattern: /^[a-zA-Z_][a-zA-Z0-9_]+$/,
                message: '用户名只能包含字母、数字和下划线且首位不能为数字',
                trigger: 'blur'
            },
            {
                min: limits.value.username_length_min,
                max: limits.value.username_length_max,
                message: `长度在${limits.value.username_length_min}到${limits.value.username_length_max}个字符`,
                trigger: 'blur'
            },
            {
                asyncValidator: async (_, value: string, callback) => {
                    if (await ApiUser.checkUsername(value)) {
                        callback();
                        return;
                    }
                    callback(`该用户名已被注册`);
                },
                trigger: 'blur'
            }
        ];
    })

    const passwordLimit: ComputedRef<FormItemRule[]> = computed<FormItemRule[]>((): FormItemRule[] => {
        return [
            {
                min: limits.value.password_length_min,
                max: limits.value.password_length_max,
                message: `长度在${limits.value.password_length_min}到${limits.value.password_length_max}个字符`,
                trigger: 'blur'
            }
        ];
    })

    const emailLimit: ComputedRef<FormItemRule[]> = computed<FormItemRule[]>((): FormItemRule[] => {
        return [
            {type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur'},
            {
                min: limits.value.email_length_min,
                max: limits.value.email_length_max,
                message: `长度在${limits.value.email_length_min}到${limits.value.email_length_max}个字符`,
                trigger: 'blur'
            },
            {
                asyncValidator: async (_, value: string, callback) => {
                    if (await ApiUser.checkEmail(value)) {
                        callback()
                        return
                    }
                    callback(`该邮箱已被注册`)
                },
                trigger: 'blur'
            }
        ];
    })

    const cidLimit: ComputedRef<FormItemRule[]> = computed<FormItemRule[]>((): FormItemRule[] => {
        return [
            {pattern: /^[0-9]+$/, message: 'CID必须由纯数字组成', trigger: 'blur'},
            {
                asyncValidator: async (_, value: string, callback: Callback1<string | undefined>) => {
                    const cid = Number.parseInt(value);
                    if (isNaN(cid)) {
                        callback("CID必须由纯数字组成");
                        return;
                    }
                    if (cid < 0) {
                        callback("CID不能小于0");
                        return;
                    }
                    if (cid < limits.value.cid_min) {
                        callback(`CID不能小于${limits.value.cid_min}`);
                        return;
                    }
                    if (cid > limits.value.cid_max) {
                        callback(`CID不能大于${limits.value.cid_max}`);
                        return;
                    }
                    if (await ApiUser.checkCID(cid)) {
                        callback();
                        return;
                    }
                    callback("该CID已被占用");
                },
                trigger: "blur"
            }
        ];
    })
    
    const getRatingShortName = (rating: number): string => {
        return config.value.ratings[rating + 1].short_name;
    }

    const getRatingLongName = (rating: number): string => {
        return config.value.ratings[rating + 1].long_name;
    }

    const getFacilityShortName = (facility: number): string => {
        return config.value.facilities[facility + 1].short_name;
    }

    const getFacilityLongName = (facility: number): string => {
        return config.value.facilities[facility + 1].long_name;
    }

    return {
        config,
        ratings: computed(() => config.value.ratings),
        facilities: computed(() => config.value.facilities),
        limits: computed(() => limits.value),
        usernameLimit,
        passwordLimit,
        cidLimit,
        emailLimit,
        getConfigFromServer,
        getRatingShortName,
        getRatingLongName,
        getFacilityShortName,
        getFacilityLongName
    }
})
