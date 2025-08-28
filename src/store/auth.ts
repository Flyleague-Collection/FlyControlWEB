import {defineStore} from "pinia";
import {Ref, ref} from "vue";
import request from "@/utils/request.js";
import {useRouter} from "vue-router";

export const useAuthStore = defineStore("AuthStore", () => {
    const isLogin: Ref<boolean> = ref(false)
    const userData: Ref<UserModel> = ref({} as UserModel)
    const token: Ref<string> = ref("")
    const flushToken: Ref<string> = ref("")
    const router = useRouter()

    const decodeResponse = (response: LoginResponse | RegisterResponse) => {
        isLogin.value = true
        userData.value = response.user as UserModel
        token.value = response.token as string
        flushToken.value = response.flush_token as string
        localStorage.setItem("flush_token", flushToken.value)
    }

    const login = async (data: LoginForm): Promise<boolean> => {
        const response = await request.post("/sessions", data)
        if (response.status == 200) {
            decodeResponse(response.data as LoginResponse)
            return true
        }
        return false
    }

    const register = async (data: RegisterForm): Promise<boolean> => {
        const response = await request.post("/users", data)
        if (response.status == 200) {
            decodeResponse(response.data as RegisterResponse)
            return true
        }
        return false
    }

    const sendEmailCode = async (data: EmailCodeForm): Promise<boolean> => {
        const response = await request.post("/codes", data)
        return response.status == 200
    }

    const logout = () => {
        isLogin.value = false
        userData.value = {} as UserModel
        token.value = ""
        flushToken.value = ""
        localStorage.removeItem("flush_token")
        router.push("/login")
    }

    return {isLogin, userData, token, flushToken, login, register, sendEmailCode, logout}
})