import {defineStore} from "pinia";
import {Ref, ref} from "vue";
import request from "@/utils/request.js";
import {useRouter} from "vue-router";
import moment from "moment";

export const useUserStore = defineStore("UserStore", () => {
    const isLogin: Ref<boolean> = ref(false)
    const userData: Ref<UserModel> = ref({} as UserModel)
    const token: Ref<string> = ref("")
    const flushToken: Ref<string> = ref("")
    const router = useRouter()
    let timer: NodeJS.Timeout | null = null

    const decodeResponse = (response: LoginResponse) => {
        isLogin.value = true
        userData.value = response.user as UserModel
        token.value = response.token as string
        flushToken.value = response.flush_token as string
        localStorage.setItem("token", token.value)
        localStorage.setItem("flush_token", flushToken.value)
    }

    const initUser = async () => {
        const storeToken = localStorage.getItem('token')
        const storeFlushToken = localStorage.getItem('flush_token')
        if (storeFlushToken) {
            if (storeToken && verifyTokenExpired(storeToken)) {
                const response = await request.get("/profile", {
                    headers: {
                        Authorization: `Bearer ${storeToken}`
                    }
                })
                if (response.status == 200) {
                    isLogin.value = true
                    token.value = storeToken
                    flushToken.value = storeFlushToken
                    userData.value = response.data as UserModel
                    localStorage.setItem("token", token.value)
                    localStorage.setItem("flush_token", flushToken.value)
                } else {
                    logout()
                }
            } else if (verifyTokenExpired(storeFlushToken)) {
                flushToken.value = storeFlushToken;
                if (await flushAccessToken()) {
                    isLogin.value = true
                } else {
                    logout()
                }
            }
        }
        setFlushTokenTimer()
    }

    const setFlushTokenTimer = () => {
        if (isLogin.value && timer == null) {
            const data = JSON.parse(atob(token.value.split(".")[1]))
            const time = moment((data.exp - 60) * 1000).diff(moment())
            timer = setTimeout(flushAccessToken, time)
        }
    }

    const flushAccessToken = async () => {
        isLogin.value = false
        const response = await request.get<LoginResponse>("/sessions", {
            headers: {
                Authorization: `Bearer ${flushToken.value}`
            }
        })
        if (response.status == 200) {
            userData.value = response.data.user;
            token.value = response.data.token;
            if (response.data.flush_token != "") {
                flushToken.value = response.data.flush_token;
            }
            localStorage.setItem("token", token.value)
            localStorage.setItem("flush_token", flushToken.value)
            isLogin.value = true
        }
        timer = null
        setFlushTokenTimer()
        return isLogin.value
    }

    const verifyTokenExpired = (token: string) => {
        const data = JSON.parse(atob(token.split(".")[1]))
        const time = moment(data.exp * 1000)
        return time.isAfter(moment())
    }

    const login = async (data: LoginForm): Promise<boolean> => {
        const response = await request.post<LoginResponse>("/sessions", data)
        if (response.status == 200) {
            decodeResponse(response.data)
            timer = null
            setFlushTokenTimer()
            return true
        }
        return false
    }

    const register = async (data: RegisterForm): Promise<boolean> => {
        const response = await request.post<RegisterResponse>("/users", data)
        if (response.status == 200) {
            decodeResponse(response.data)
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
        localStorage.removeItem("token")
        localStorage.removeItem("flush_token")
        if (timer != null) {
            clearTimeout(timer)
        }
        router.push("/login")
    }

    const getUserPage = async (page: number, pageSize: number): Promise<GetUsersPageResponse | null> => {
        const response = await request.get(`/users?page_number=${page}&page_size=${pageSize}`);
        if (response.status === 200) {
            return response.data as GetUsersPageResponse;
        }
        return null;
    }

    const getControllerPage = async (page: number, pageSize: number): Promise<GetUsersPageResponse | null> => {
        const response = await request.get(`/users/controllers?page_number=${page}&page_size=${pageSize}`);
        if (response.status === 200) {
            return response.data as GetUsersPageResponse;
        }
        return null;
    }

    return {
        isLogin,
        userData,
        token,
        flushToken,
        initUser,
        login,
        register,
        sendEmailCode,
        logout,
        getUserPage,
        getControllerPage
    }
})