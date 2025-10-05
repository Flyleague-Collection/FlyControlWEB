import {Ref, ref} from "vue";
import {useRouter} from "vue-router";
import {defineStore} from "pinia";
import moment from "moment";
import {refManualReset, useStorage} from '@vueuse/core';

import {Permission} from "@/utils/permission.js";
import ApiUser from "@/api/user.js";

export const useUserStore = defineStore("UserStore", () => {
    const isLogin: Ref<boolean> = ref(false);
    const userData = refManualReset<UserModel>({
        id: 0,
        username: "",
        email: "",
        cid: 0,
        avatar_url: "",
        qq: 0,
        rating: 0,
        guest: false,
        under_monitor: false,
        under_solo: false,
        tier2: false,
        solo_until: moment().toDate(),
        permission: 0n,
        total_atc_time: 0,
        total_pilot_time: 0,
        register_time: moment().toDate()
    });
    const token: Ref<string> = useStorage("token", "", localStorage, {initOnMounted: true});
    const flushToken: Ref<string> = useStorage("flush_token", "", localStorage, {initOnMounted: true});
    const permission: Ref<Permission> = ref<Permission>(new Permission(0n));
    const router = useRouter();
    let timer: Nullable<NodeJS.Timeout> = null;

    const initUser = async () => {
        const storeToken = token.value;
        const storeFlushToken = flushToken.value;
        if (storeFlushToken) {
            if (storeToken && verifyTokenExpired(storeToken)) {
                const data = await ApiUser.getSelfProfileWithToken(storeToken);
                if (data == null) {
                    await logout();
                }
                isLogin.value = true;
                userData.value = data;
                permission.value = new Permission(BigInt(userData.value.permission));
            } else if (verifyTokenExpired(storeFlushToken)) {
                if (!(await flushAccessToken(true))) {
                    await logout();
                }
            } else {
                await logout();
            }
        }
        setFlushTokenTimer();
    }

    const setFlushTokenTimer = () => {
        if (isLogin.value && timer == null) {
            const data = JSON.parse(atob(token.value.split(".")[1]));
            const time = moment((data.exp - 60) * 1000).diff(moment());
            timer = setTimeout(async () => {
                await flushAccessToken(false)
            }, time);
        }
    }

    const flushAccessToken = async (first: boolean) => {
        isLogin.value = false;
        const data = await ApiUser.flushAccessToken(flushToken.value, first);
        if (data != null) {
            userData.value = data.user;
            permission.value = new Permission(BigInt(userData.value.permission));
            token.value = data.token;
            if (data.flush_token != "") {
                flushToken.value = data.flush_token;
            }
            isLogin.value = true;
        }
        timer = null;
        setFlushTokenTimer();
        return isLogin.value;
    }

    const verifyTokenExpired = (token: string) => {
        const data = JSON.parse(atob(token.split(".")[1]));
        const time = moment(data.exp * 1000);
        return time.isAfter(moment());
    }

    const login = async (username: string, password: string): Promise<boolean> => {
        const data = await ApiUser.userLogin(username, password)
        if (data == null) {
            return false;
        }
        isLogin.value = true;
        userData.value = data.user;
        permission.value = new Permission(BigInt(userData.value.permission))
        token.value = data.token;
        flushToken.value = data.flush_token;
        timer = null;
        setFlushTokenTimer();
        return true;
    }

    const logout = async () => {
        isLogin.value = false;
        userData.reset();
        token.value = null;
        flushToken.value = null;
        if (timer != null) {
            clearTimeout(timer);
        }
        await router.push("/");
    }

    return {
        isLogin,
        userData,
        token,
        flushToken,
        permission,
        initUser,
        login,
        logout
    }
})