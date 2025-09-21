<script setup lang="ts">
import {ref, reactive, computed, watch, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import type {FormInstance, FormRules} from 'element-plus'
import {User, Lock} from '@element-plus/icons-vue';
import {useUserStore} from "@/store/user.js";
import {showInfo} from "@/utils/message.js";
import config from "@/config/index.js";

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive<LoginForm>({
    username: '',
    password: ''
})

// 增强的表单验证规则
const rules = reactive<FormRules<LoginForm>>({
    username: [
        {required: true, message: '请输入用户名', trigger: 'blur'}
    ],
    password: [
        {required: true, message: '请输入密码', trigger: 'blur'},
        {min: 6, max: 20, message: '长度在6到20个字符', trigger: 'blur'}
    ]
})

const redirectPath = computed(() => {
    return route.query.redirect ? route.query.redirect : '/home'
})

const handleLogin = async () => {
    try {
        await formRef.value?.validate()
        loading.value = true
        const success = await userStore.login(loginForm)
        if (success) {
            showInfo(`欢迎登录, ${loginForm.username}, 祝连飞顺利`)
            new Promise(_ => setTimeout(() => router.push(redirectPath.value as string), 1000))
        }
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    if (userStore.isLogin) {
        router.push(redirectPath.value as string)
    }
})
</script>

<template>
    <div class="login-container">
        <div class="login-background">
            <div class="stamp-pattern"></div>
        </div>
        <el-card class="login-box">
            <div class="flex align-items-center justify-content-center margin-bottom-10">
                <img class="login-logo" :src="config.icon_path" alt="Icon"/>
                <div class="login-title margin-left-10">
                    {{ config.title }}
                </div>
            </div>
            <el-form
                :model="loginForm"
                :rules="rules"
                ref="formRef"
                @keyup.enter="handleLogin"
                class="login-form"
            >
                <el-form-item prop="username">
                    <el-input
                        v-model="loginForm.username"
                        placeholder="请输入用户名"
                        :prefix-icon="User"
                        class="custom-input"
                    />
                </el-form-item>

                <el-form-item prop="password">
                    <el-input
                        v-model="loginForm.password"
                        type="password"
                        placeholder="请输入密码"
                        :prefix-icon="Lock"
                        show-password
                        class="custom-input"
                    />
                </el-form-item>

                <el-form-item>
                    <el-button
                        type="primary"
                        @click="handleLogin"
                        :loading="loading"
                        class="login-button"
                    >
                        登录
                    </el-button>
                </el-form-item>

                <div class="login-footer">
                    <router-link to="/register" class="register-link">还没有账号？立即注册</router-link>
                </div>
            </el-form>
        </el-card>
    </div>
</template>

<style scoped>
.el-card {
    transform: none !important;
}

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

.login-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.1;
    z-index: 0;
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

.login-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 32px;
}

.login-logo {
    width: 50px;
    height: 50px;
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

.login-options {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.option-spacer {
    flex: 1;
}

.custom-checkbox {
    --el-checkbox-checked-bg-color: var(--primary-color);
    --el-checkbox-checked-border-color: var(--primary-color);
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
    margin-top: 24px;
    text-align: center;
}

.register-link {
    color: var(--primary-color);
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s ease;
}

.register-link:hover {
    color: var(--accent-color);
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