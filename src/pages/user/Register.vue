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

const userStore = useUserStore()
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const serverConfig = useServerConfigStore()

const registerForm = reactive<RegisterForm>({
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
} as RegisterForm)

const checkCID = async (cid: number): Promise<boolean> => {
    const response = await request.get(`/users/availability?cid=${cid}`);
    return response.data;
}

const checkUsername = async (username: string): Promise<boolean> => {
    const response = await request.get(`/users/availability?username=${username}`);
    return response.data;
}

const checkEmail = async (email: string): Promise<boolean> => {
    const response = await request.get(`/users/availability?email=${email}`);
    return response.data;
}

const rules = reactive<FormRules<RegisterForm>>({
    cid: [
        {required: true, message: '请输入CID', trigger: 'blur'},
        {
            validator: async (rule, value, callback) => {
                const cid = Number.parseInt(value)
                if (isNaN(cid)) {
                    callback(new Error("CID必须由纯数字组成"))
                    return
                }
                if (cid < 0) {
                    callback(new Error(`CID不能小于0`))
                    return
                }
                if (cid < serverConfig.limits.cid_min) {
                    callback(new Error(`CID不能小于${serverConfig.limits.cid_min}`))
                    return
                }
                if (cid > serverConfig.limits.cid_max) {
                    callback(new Error(`CID不能大于${serverConfig.limits.cid_max}`))
                    return
                }
                if (await checkCID(cid)) {
                    callback()
                    return
                }
                callback(new Error(`该CID已被占用`))
            },
            trigger: 'blur'
        }
    ],
    username: [
        {required: true, message: '请输入用户名', trigger: 'blur'},
        {min: 4, max: 16, message: '长度在4到16个字符', trigger: 'blur'},
        {
            pattern: /^[a-zA-Z_][a-zA-Z0-9_]+$/,
            message: '用户名只能包含字母、数字和下划线且首位不能为数字', trigger: 'blur'
        },
        {
            validator: async (rule, value, callback) => {
                if (await checkUsername(value)) {
                    callback()
                    return
                }
                callback(new Error(`该用户名已被注册`))
            },
            trigger: 'blur'
        }
    ],
    email: [
        {required: true, message: '请输入邮箱', trigger: 'blur'},
        {type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur'},
        {
            validator: async (rule, value, callback) => {
                if (await checkEmail(value)) {
                    callback()
                    return
                }
                callback(new Error(`该邮箱已被注册`))
            },
            trigger: 'blur'
        }
    ],
    password: [
        {required: true, message: '请输入密码', trigger: 'blur'},
        {min: 6, max: 20, message: '长度在6到20个字符', trigger: 'blur'}
    ],
    confirmPassword: [
        {required: true, message: '请确认密码', trigger: 'blur'},
        {
            validator: (rule, value, callback) => {
                if (value !== registerForm.password) {
                    callback(new Error('两次输入的密码不一致'))
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
        new Promise(_ => setTimeout(goToLogin, 1000))
    } finally {
        loading.value = false
    }
}

const goToLogin = () => {
    router.push('/login')
}

const getRandomInt = (max: number) => {
    return Math.floor(Math.random() * Math.floor(max));
}

const randomCid = async () => {
    let cid = 0
    do {
        cid = getRandomInt(serverConfig.limits.cid_max);
    } while (!(await checkCID(cid)))
    registerForm.cid = cid
}

const sendEmailCode = async () => {
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
    })
    if (response.status == 200) {
        showSuccess("验证码发送成功, 请查看邮箱")
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
                <img class="h-50p w-50p" :src="config.icon_path" alt="Icon"/>
                <div class="margin-left-10">
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
                        <el-button round type="primary" size="large" class="margin-left-10" @click="randomCid">随机CID
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
                            v-model.number="registerForm.email_code"
                            placeholder="请输入邮箱验证码"
                            :prefix-icon="Message"
                            class="custom-input"
                        />
                        <el-button round type="primary" size="large" @click="sendEmailCode">发送验证码</el-button>
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
                <a @click="goToLogin" class="login-link">已有账号？立即登录</a>
            </div>
        </el-card>
    </div>
</template>

<style scoped>
.register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    background-color: var(--secondary-color);
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
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
    opacity: 0.1;
    z-index: 0;
}

.register-box {
    width: 400px;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    background-color: var(--el-bg-color);
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
    width: 80px;
    height: 80px;
    margin-bottom: 16px;
}

.register-title {
    font-size: 28px;
    font-weight: 600;
    margin: 0;
    background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
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
    background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
    border: none;
    transition: all 0.3s ease;
}

.register-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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