<script setup lang="ts">
import {ref, reactive} from 'vue'
import {useRouter} from 'vue-router'
import type {FormInstance, FormRules} from 'element-plus'
import {User, Lock, Message, Edit} from '@element-plus/icons-vue';
import {useUserStore} from "@/store/user.js";
import {showError, showSuccess} from "@/utils/message.js";
import config from "@/config/index.js";
import {useServerConfigStore} from "@/store/server_config.js";
import request from "@/utils/request.js";
import AxiosXHR = Axios.AxiosXHR;
import {useCountdown} from "@vueuse/core";

const serverConfig = useServerConfigStore();
const userStore = useUserStore()
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const locked = ref(false)
const btnText = ref("发送验证码")

const {remaining, start, reset} = useCountdown(serverConfig.config.email_send_interval, {
    onComplete() {
        locked.value = false
        btnText.value = "发送验证码"
        reset()
    },
    onTick() {
        btnText.value = `${remaining.value}s`
    }
})

const registerForm = reactive<RegisterForm>({
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
} as RegisterForm)

const rules = reactive<FormRules>({
    cid: [
        {required: true, message: '请输入CID', trigger: 'blur'},
        ...serverConfig.cidLimit
    ],
    username: [
        {required: true, message: '请输入用户名', trigger: 'blur'},
        ...serverConfig.usernameLimit
    ],
    email: [
        {required: true, message: '请输入邮箱', trigger: 'blur'},
        ...serverConfig.emailLimit
    ],
    email_code: [
        {required: true, message: '请输入邮箱验证码', trigger: 'blur'},
        {min: 6, max: 6, message: '邮箱验证码必须为6位', trigger: 'blur'},
        {pattern: /^[0-9]+$/, message: '验证码必须为纯数字', trigger: 'blur'}
    ],
    password: [
        {required: true, message: '请输入密码', trigger: 'blur'},
        ...serverConfig.passwordLimit
    ],
    confirmPassword: [
        {required: true, message: '请确认密码', trigger: 'blur'},
        {
            validator: (rule, value, callback) => {
                if (value !== registerForm.password) {
                    callback('两次输入的密码不一致')
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }
    ]
})

const handleRegister = async () => {
    try {
        await formRef.value?.validate()
        loading.value = true
        await userStore.register(registerForm)
        showSuccess('注册成功，请登录')
        new Promise(_ => setTimeout(() => router.push('/login'), 1000))
    } finally {
        loading.value = false
    }
}

const getRandomInt = (max: number) => {
    return Math.floor(Math.random() * Math.floor(max));
}

const randomCid = async () => {
    let cid = 0
    do {
        cid = getRandomInt(serverConfig.limits.cid_max);
    } while (!(await userStore.checkCID(cid)))
    registerForm.cid = cid
}

const sendEmailCode = async () => {
    if (locked.value) {
        showError(`请在${remaining}后再次发送`)
        return
    }
    if (registerForm.email == '') {
        showError("邮箱验证失败")
        return
    } else {
        try {
            await formRef.value?.validateField('email')
        } catch {
            showError("邮箱验证失败")
            return
        }
    }
    if (registerForm.cid == undefined) {
        showError("CID验证失败")
        return
    } else {
        try {
            await formRef.value?.validateField('cid')
        } catch {
            showError("CID验证失败")
            return
        }
    }
    const response = await request.post(`/codes`, {
        email: registerForm.email,
        cid: registerForm.cid
    }) as AxiosXHR<any>
    if (response.status == 200) {
        showSuccess("验证码发送成功, 请查看邮箱")
        locked.value = true
        start()
    }
}
</script>

<template>
    <div class="register-container">
        <div class="register-background">
            <div class="stamp-pattern"></div>
        </div>
        <el-card class="register-box">
            <div class="flex align-items-center justify-content-center margin-bottom-10">
                <img class="register-logo" :src="config.icon_path" alt="Icon"/>
                <div class="register-title margin-left-10">
                    {{ config.title }}
                </div>
            </div>
            <el-form
                :model="registerForm"
                :rules="rules"
                ref="formRef"
                @keyup.enter="handleRegister"
                class="register-form"
            >
                <el-form-item prop="cid">
                    <div class="flex align-items-center w-full">
                        <el-input
                            v-model.number="registerForm.cid"
                            placeholder="请输入cid"
                            :prefix-icon="Edit"
                            class="custom-input">
                        </el-input>
                        <el-button round type="primary" size="large" class="margin-left-10" @click="randomCid">
                            随机CID
                        </el-button>
                    </div>
                </el-form-item>
                <el-form-item prop="username">
                    <el-input
                        v-model="registerForm.username"
                        placeholder="请输入用户名"
                        :prefix-icon="User"
                        class="custom-input"
                    />
                </el-form-item>

                <el-form-item prop="email">
                    <el-input
                        v-model="registerForm.email"
                        placeholder="请输入邮箱"
                        :prefix-icon="Message"
                        class="custom-input"
                    />
                </el-form-item>

                <el-form-item prop="email_code">
                    <div class="flex align-items-center w-full">
                        <el-input
                            v-model="registerForm.email_code"
                            placeholder="请输入邮箱验证码"
                            :prefix-icon="Message"
                            class="custom-input"
                        />
                        <el-button round type="primary" size="large" @click="sendEmailCode" class="margin-left-10"
                                   :disabled="locked" :loading="locked">
                            {{ btnText }}
                        </el-button>
                    </div>
                </el-form-item>

                <el-form-item prop="password">
                    <el-input
                        v-model="registerForm.password"
                        type="password"
                        placeholder="请输入密码"
                        :prefix-icon="Lock"
                        show-password
                        class="custom-input"
                    />
                </el-form-item>

                <el-form-item prop="confirmPassword">
                    <el-input
                        v-model="registerForm.confirmPassword"
                        type="password"
                        placeholder="请确认密码"
                        :prefix-icon="Lock"
                        show-password
                        class="custom-input"
                    />
                </el-form-item>

                <el-form-item>
                    <el-button
                        type="primary"
                        @click="handleRegister"
                        :loading="loading"
                        class="register-button"
                    >
                        注册
                    </el-button>
                </el-form-item>
            </el-form>

            <div class="register-footer">
                <a @click="router.push('/login')" class="login-link">已有账号？立即登录</a>
            </div>
        </el-card>
    </div>
</template>

<style scoped>
.el-card {
    transform: none !important;
}

.register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    background-image: url("/images/background.png");
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    position: fixed;
    top: 0;
    left: 0;
    overflow: hidden;
}

.register-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.1;
    z-index: 0;
}

.register-box {
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

.register-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 32px;
}

.register-logo {
    width: 50px;
    height: 50px;
}

.register-title {
    font-size: 28px;
    font-weight: 600;
    margin: 0;
    background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
    background-clip: text;
    color: transparent;
}

.register-form {
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

.register-button {
    width: 100%;
    height: 48px;
    font-size: 16px;
    border-radius: 8px;
    background-image: linear-gradient(45deg, var(--primary-color), var(--accent-color));
    border: none;
    transition: all 0.3s ease;
}

.register-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background-image: linear-gradient(45deg, var(--primary-color), var(--accent-color), var(--primary-color));
    background-size: 200%;
    animation: gradient-animation 3s ease infinite;
}

.register-footer {
    margin-top: 24px;
    text-align: center;
}

.login-link {
    color: var(--primary-color);
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s ease;
    cursor: pointer;
}

.login-link:hover {
    color: var(--accent-color);
}

@media (max-width: 480px) {
    .register-box {
        width: 90%;
        padding: 24px;
        margin: 0;
    }

    .register-title {
        font-size: 24px;
    }

    .register-logo {
        width: 60px;
        height: 60px;
    }
}
</style>