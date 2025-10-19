<script setup lang="ts">
import type {FormInstance, FormRules} from "element-plus";
import {User, Lock} from "@element-plus/icons-vue";
import {ref, reactive, computed, onBeforeMount} from "vue";
import {useRoute, useRouter} from "vue-router";

import config from "@/config/index.js";
import {useServerConfigStore} from "@/store/server_config.js";
import {useUserStore} from "@/store/user.js";
import {showInfo} from "@/utils/message.js";

const userStore = useUserStore();
const serverConfigStore = useServerConfigStore();
const router = useRouter();
const route = useRoute();
const formRef = ref<FormInstance>();
const loading = ref(false);

const loginForm = reactive<LoginForm>({
    username: "",
    password: ""
});

const rules = reactive<FormRules<LoginForm>>({
    username: [
        {required: true, message: "请输入用户名", trigger: "blur"}
    ],
    password: [
        {required: true, message: "请输入密码", trigger: "blur"},
        ...serverConfigStore.passwordLimit
    ]
});

const redirectPath = computed(() => route.query.redirect ? route.query.redirect : "/home");

const handleLogin = async () => {
    try {
        await formRef.value?.validate();
    } catch {
        return;
    }
    loading.value = true;
    try {
        if (await userStore.login(loginForm.username, loginForm.password)) {
            showInfo(`欢迎登录, ${loginForm.username}, 祝连飞顺利`);
            await router.push(redirectPath.value as string);
        }
    } finally {
        loading.value = false;
    }
}

onBeforeMount(async () => {
    if (userStore.isLogin) {
        await router.push(redirectPath.value as string);
    }
})
</script>

<template>
    <div class="login-container">
        <el-card class="login-box no-transform">
            <el-space>
                <img class="login-logo" :src="config.icon_path" alt="Icon"/>
                <div class="login-title">{{ config.title }}</div>
            </el-space>
            <el-form :model="loginForm" :rules="rules" ref="formRef" class="login-form">
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" placeholder="请输入用户名"
                              :prefix-icon="User" class="custom-input"/>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" type="password"
                              placeholder="请输入密码" :prefix-icon="Lock" show-password class="custom-input"/>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleLogin" :disabled="loading"
                               :loading="loading" class="login-button">
                        登录
                    </el-button>
                </el-form-item>
                <el-space class="login-footer w-full" wrap fill>
                    <router-link to="/register" class="login-link">还没有账号？立即注册</router-link>
                    <router-link to="/reset-password" class="login-link">忘记密码</router-link>
                </el-space>
            </el-form>
        </el-card>
    </div>
</template>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    position: fixed;
    background-image: url("/images/background.png");
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    top: 0;
    left: 0;
    overflow: hidden;
}

.login-box {
    width: 400px;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    background: var(--secondary-bg-color);
    backdrop-filter: blur(10px);
    position: relative;
    z-index: 1;
    border: none;
}

.login-logo {
    width: 50px;
    height: 50px;
    user-select: none;
}

.login-title {
    font-size: 28px;
    font-weight: 600;
    margin: 0;
    background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
    background-clip: text;
    color: transparent;
}

.login-form {
    margin-top: 24px;
}

.custom-input {
    --el-input-height: 48px;
    --el-input-border-radius: 8px;
    --el-input-bg-color: var(--el-fill-color-light);
    --el-input-border-color: var(--el-border-color);
    --el-input-hover-border-color: var(--primary-color);
    --el-input-focus-border-color: var(--primary-color);
}

.custom-input :deep(.el-input__wrapper) {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.custom-input :deep(.el-input__wrapper:hover) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.custom-input :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-button {
    width: 100%;
    height: 48px;
    font-size: 16px;
    border-radius: 8px;
    background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
    border: none;
    transition: all 0.3s ease;
}

.login-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background-image: linear-gradient(45deg, var(--primary-color), var(--accent-color), var(--primary-color));
    background-size: 200%;
    animation: gradient-animation 3s ease infinite;
}

.login-footer {
    margin-top: 12px;
    text-align: center;
}

.login-link {
    color: var(--primary-color);
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s ease;
    user-select: none;
}

.login-link:hover {
    color: var(--accent-color);
    text-decoration: underline #409eff solid 1px;
}

@media (max-width: 480px) {
    .login-box {
        width: 90%;
        padding: 24px;
        margin: 0;
    }

    .login-title {
        font-size: 24px;
    }

    .login-logo {
        width: 60px;
        height: 60px;
    }
}
</style>