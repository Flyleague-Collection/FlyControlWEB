import axios from 'axios'

import config from "@/config/index.js";
import {useUserStore} from "@/store/user.js";
import {showError} from "@/utils/message.js";

const request = axios.create({
    baseURL: config.backend_url,
    timeout: 10000
})

request.interceptors.request.use(
    config => {
        const userStore = useUserStore()
        if (userStore.isLogin) {
            config.headers.Authorization = `Bearer ${userStore.token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

request.interceptors.response.use(
    response => {
        if (response.data.data != null) {
            response.data = response.data.data
        }
        return response;
    },
    error => {
        if (error.response) {
            showError(error.response.data.message)
        } else if (error.request) {
            showError("连接超时, 请检查网络设置")
        }
        return Promise.reject(error)
    }
)

export default request
