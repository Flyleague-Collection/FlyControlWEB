import axios from 'axios'
import {useAuthStore} from "@/store/auth.js";
import config from "@/config/index.js";
import {showApiErrorMsg} from "@/utils/message.js";

const request = axios.create({
    baseURL: config.backend_url,
    timeout: 5000
})

request.interceptors.request.use(
    config => {
        const authStore = useAuthStore()
        if (authStore.isLogin) {
            config.headers.Authorization = `Bearer ${authStore.token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

request.interceptors.response.use(
    response => {
        response.data = response.data.data
        return response;
    },
    error => {
        if (error.response) {
            showApiErrorMsg(error.response.data.message, error.response.data.status)
        }
        return Promise.reject(error)
    }
)

export default request 