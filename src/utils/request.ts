import axios from 'axios'
import {useAuthStore} from "@/store/auth.js";

// 创建 axios 实例
const request = axios.create({
    baseURL: '/api',
    timeout: 5000
})

// 请求拦截器
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

// 响应拦截器
request.interceptors.response.use(
    response => {
        return response.data
    },
    error => {
        // 处理 HTTP 错误
        if (error.response) {
            switch (error.response.status) {
                case 403:
                    console.error('没有权限访问该资源')
                    break
                case 404:
                    console.error('请求的资源不存在')
                    break
                case 500:
                    console.error('服务器错误')
                    break
                default:
                    console.error('发生错误:', error.message)
            }
        }
        return Promise.reject(error)
    }
)

export default request 