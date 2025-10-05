<script setup lang="ts">
import type {FormInstance, FormRules} from "element-plus";
import {Lock, Message} from "@element-plus/icons-vue";
import {ref, onBeforeMount} from "vue";
import {useRoute, useRouter} from "vue-router";

import config from "@/config/index.js";
import {useServerConfigStore} from "@/store/server_config.js";
import {useUserStore} from "@/store/user.js";
import {showError, showInfo, showSuccess} from "@/utils/message.js";
import SendEmailButton from "@/components/SendEmailButton.vue";
import ApiUser from "@/api/user.js";
import Api from "@/api/utils.js";

const userStore = useUserStore();
const serverConfigStore = useServerConfigStore();
const router = useRouter();
const route = useRoute();
const formRef = ref<FormInstance>();
const loading = ref(false);

type ResetForm = {
    email: string;
    email_code: string;
    password: string;
    confirm_password: string;
}

const resetForm = ref<ResetForm>({
    email: "",
    email_code: "",
    password: "",
    confirm_password: ""
});

const rules = ref<FormRules<ResetForm>>({
    email: [
        {required: true, message: "'请输入邮箱", trigger: "blur"},
        serverConfigStore.emailLimit[0],
        serverConfigStore.emailLimit[1],
        {
            asyncValidator: async (_, value: string, callback) => {
                if (await ApiUser.checkEmail(value)) {
                    callback("该邮箱尚未被注册");
                    return;
                }
                callback();
            },
            trigger: "blur"
        }
    ],
    email_code: [
        {required: true, message: "请输入邮箱验证码", trigger: "blur"},
        {min: 6, max: 6, message: "邮箱验证码必须为6位", trigger: "blur"},
        {pattern: /^[0-9]+$/, message: "验证码必须为纯数字", trigger: "blur"}
    ],
    password: [
        {required: true, message: "请输入密码", trigger: "blur"},
        ...serverConfigStore.passwordLimit
    ],
    confirm_password: [
        {required: true, message: "请再次输入密码", trigger: "blur"},
        {
            validator: (_, value: string, callback: Callback1<string | undefined>) => {
                if (value !== resetForm.value.password) {
                    callback("两次输入的密码不一致");
                } else {
                    callback();
                }
            },
            trigger: "blur"
        }
    ]
});

const handleResetPassword = async () => {
    try {
        await formRef.value?.validate();
    } catch {
        return;
    }
    loading.value = true;
    if (await ApiUser.resetUserPassword(resetForm.value.email, resetForm.value.email_code, resetForm.value.password)) {
        showInfo(`重置密码成功`);
        await router.push("/login");
    }
    loading.value = false;
}

const sendEmailCode = async (callback: Callback1<boolean>) => {
    try {
        await formRef.value?.validateField("email");
    } catch {
        showError("邮箱验证失败");
        callback(false);
        return;
    }
    if (await Api.sendEmailCode(resetForm.value.email, -1)) {
        showSuccess("验证码发送成功, 请查看邮箱");
        callback(true);
    } else {
        callback(false);
    }
}

onBeforeMount(async () => {
    if (userStore.isLogin) {
        await router.push("/home");
    }
})
</script>

<template>
    <div class="container">
        <el-card class="box no-transform">
            <el-space>
                <img class="logo" :src="config.icon_path" alt="Icon"/>
                <div class="title">{{ config.title }}</div>
            </el-space>
            <el-form :model="resetForm" :rules="rules" ref="formRef" class="form">
                <el-form-item prop="email">
                    <el-input v-model="resetForm.email" placeholder="请输入邮箱"
                              :prefix-icon="Message" class="custom-input"/>
                </el-form-item>
                <el-form-item prop="email_code">
                    <el-space>
                        <el-input v-model="resetForm.email_code" placeholder="请输入邮箱验证码"
                                  :prefix-icon="Message" class="custom-input" :disabled="resetForm.email == ''"/>
                        <SendEmailButton ref="sendEmailBtnRef" @button-click-event="sendEmailCode"
                                         size="large" round :disabled="resetForm.email == ''"/>
                    </el-space>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="resetForm.password" type="password"
                              placeholder="请输入新密码" :prefix-icon="Lock" show-password class="custom-input"/>
                </el-form-item>
                <el-form-item prop="confirm_password">
                    <el-input v-model="resetForm.confirm_password" type="password"
                              placeholder="请确认新密码" :prefix-icon="Lock" show-password class="custom-input"/>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleResetPassword()" :disabled="loading"
                               :loading="loading" class="button">
                        重置密码
                    </el-button>
                </el-form-item>
                <el-space class="footer w-full" wrap fill>
                    <router-link to="/login" class="link">灵光一闪？立即登录</router-link>
                </el-space>
            </el-form>
        </el-card>
    </div>
</template>

<style scoped>
.container {
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

.box {
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

.logo {
    width: 50px;
    height: 50px;
    user-select: none;
}

.title {
    font-size: 28px;
    font-weight: 600;
    margin: 0;
    background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
    background-clip: text;
    color: transparent;
}

.form {
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

.button {
    width: 100%;
    height: 48px;
    font-size: 16px;
    border-radius: 8px;
    background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
    border: none;
    transition: all 0.3s ease;
}

.button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background-image: linear-gradient(45deg, var(--primary-color), var(--accent-color), var(--primary-color));
    background-size: 200%;
    animation: gradient-animation 3s ease infinite;
}


.footer {
    margin-top: 12px;
    text-align: center;
}

.link {
    color: var(--primary-color);
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s ease;
    user-select: none;
}

.link:hover {
    color: var(--accent-color);
    text-decoration: underline #409eff solid 1px;
}

@media (max-width: 480px) {
    .box {
        width: 90%;
        padding: 24px;
        margin: 0;
    }

    .title {
        font-size: 24px;
    }

    .logo {
        width: 60px;
        height: 60px;
    }
}
</style>