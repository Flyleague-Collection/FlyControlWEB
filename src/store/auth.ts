import {defineStore} from "pinia";
import {Ref, ref} from "vue";

export const useAuthStore = defineStore("AuthStore", () => {
    const isLogin: Ref<boolean> = ref(false)
    const username: Ref<string> = ref("")
    const avatarUrl: Ref<string> = ref("")
    const cid: Ref<number> = ref(0)
    const rating: Ref<number> = ref(-1)
    const token: Ref<string> = ref("")
    const refreshToken: Ref<string> = ref("")

    isLogin.value = true
    username.value = "Half_nothing"
    avatarUrl.value = "https://oss.half-nothing.cn/half64x64.png"
    cid.value = 2352
    rating.value = 7

    return {isLogin, username, avatarUrl, cid, rating, token, refreshToken}
})