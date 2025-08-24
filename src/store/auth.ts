import {defineStore} from "pinia";
import {Ref, ref} from "vue";
import request from "@/utils/request.js";
import {showError, showSuccess} from "@/utils/message.js";

export const useAuthStore = defineStore("AuthStore", () => {
    const isLogin: Ref<boolean> = ref(false)
    const username: Ref<string> = ref("")
    const token: Ref<string> = ref("")
    const refreshToken: Ref<string> = ref("")

    async function login(data: LoginForm): Promise<boolean> {
        const res = await request.post("/auth/login", data) as ApiResponse<AuthInfo>
        if (res.status) {
            isLogin.value = true
            username.value = res.data.username
            token.value = res.data.token
            refreshToken.value = res.data.refreshToken
            showSuccess(`欢迎您，${username.value}`)
            return true
        }
        showError(`登陆失败, ${res.message}`)
        return false
    }

    function logout() {
        isLogin.value = false
        username.value = ""
        token.value = ""
        refreshToken.value = ""
    }

    async function register(data: RegisterForm): Promise<boolean> {
        const res = await request.post("/auth/register", data) as ApiResponse<AuthInfo>
        if (res.status) {
            isLogin.value = true
            username.value = res.data.username
            token.value = res.data.token
            refreshToken.value = res.data.refreshToken
            showSuccess(`注册成功，已自动登录\n欢迎您，${username.value}`)
            return true
        }
        showError(`注册成功失败, ${res.message}`)
        return false
    }

    return {isLogin, username, token, refreshToken, login, register, logout}
})