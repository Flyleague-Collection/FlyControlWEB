import axios from 'axios'
import {useUserStore} from "@/store/user.js";
import config from "@/config/index.js";
import {showApiErrorMsg} from "@/utils/message.js";

const request = axios.create({
    baseURL: config.backend_url,
    timeout: 5000
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
            showApiErrorMsg(error.response.data.message, error.response.data.status)
        }
        return Promise.reject(error)
    }
)

export default request 