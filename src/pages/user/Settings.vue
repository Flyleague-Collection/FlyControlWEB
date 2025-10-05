<script setup lang="ts">
import type {FormInstance, FormRules} from "element-plus";
import moment from "moment";
import {computed, onMounted, reactive, Ref, ref} from "vue";

import ApiUser from "@/api/user.js";
import Api from "@/api/utils.js";
import type {ImageUploadInterface} from "@/components/ImageUpload.js";
import ImageUpload from "@/components/ImageUpload.vue";
import FormDialog from "@/components/dialog/FormDialog.vue";
import config from "@/config/index.js";
import {Global} from "@/global.js";
import {useServerConfigStore} from "@/store/server_config.js";
import {useUserStore} from "@/store/user.js";
import {showError, showSuccess, showWarning} from "@/utils/message.js";
import {formatCid, formatDate} from "@/utils/utils.js";
import {FormDialogInstance} from "@/components/dialog/FormDialog.js";
import SendEmailButton from "@/components/SendEmailButton.vue";

const userStore = useUserStore();
const serverConfigStore = useServerConfigStore();
const userData = userStore.userData;

const pilotTime = computed(() => {
    return userData.total_pilot_time / 3600.0;
});

const atcTime = computed(() => {
    return userData.total_atc_time / 3600.0;
});

const ratings = computed(() => {
    const rating = serverConfigStore.ratings[userData.rating]
    return `${rating.short_name}/${rating.long_name}`
});

const loadingHistoryData = ref(false);
const historyData: Ref<UserHistoryData> = ref({
    total_pilot_time: 0,
    total_atc_time: 0,
    controllers: [],
    pilots: []
});

onMounted(async () => {
    loadingHistoryData.value = true;
    const data = await ApiUser.getUserHistories();
    if (data == null) {
        loadingHistoryData.value = false;
        return;
    }
    historyData.value = data;
    loadingHistoryData.value = false;
})

const editPasswordLoading = ref(false);
const editPasswordDialogRef: Ref<FormDialogInstance> = ref();
const changePasswordFormRef = ref<FormInstance>();
const changePasswordForm = reactive<ChangePasswordForm>({
    origin_password: "",
    new_password: "",
    confirm_password: ""
})
const changePasswordRules = reactive<FormRules>({
    origin_password: [
        {required: true, message: "原密码不能为空", trigger: "blur"},
        ...serverConfigStore.passwordLimit
    ],
    new_password: [
        {required: true, message: "新密码不能为空", trigger: "blur"},
        ...serverConfigStore.passwordLimit,
        {
            validator: (_, value: string, callback: Callback1<string | undefined>) => {
                if (value == changePasswordForm.origin_password) {
                    callback("新密码与原密码相同");
                    return;
                }
                callback();
            },
            trigger: "blur"
        }
    ],
    confirm_password: [
        {required: true, message: "请输入确认密码", trigger: "blur"},
        ...serverConfigStore.passwordLimit,
        {
            validator: (_, value: string, callback: Callback1<string | undefined>) => {
                if (value !== changePasswordForm.new_password) {
                    callback("两次输入的密码不一致");
                    return;
                }
                callback();
            },
            trigger: "blur"
        }
    ]
})
const submitChangePasswordForm = async () => {
    try {
        await changePasswordFormRef.value?.validate();
    } catch (error) {
        return;
    }
    editPasswordLoading.value = true;
    if (await ApiUser.updateUserPassword(changePasswordForm.origin_password, changePasswordForm.new_password)) {
        showSuccess("修改密码成功，请重新登陆");
        editPasswordDialogRef.value?.hide();
        setTimeout(() => {
            userStore.logout()
        }, 1000);
    }
    editPasswordLoading.value = false;
}

const editInformationLoading = ref(false);
const editInformationDialogRef: Ref<FormDialogInstance> = ref();
const updateUserInfoFormRef = ref<FormInstance>();
const updateUserInfoForm = reactive<UpdateUserInfoForm>({
    username: "",
    email: "",
    avatar_url: ""
});
const updateUserInfoRules = reactive<FormRules>({
    username: serverConfigStore.usernameLimit,
    email: serverConfigStore.emailLimit
});
const imageUploadRef: Ref<ImageUploadInterface> = ref()
const sendingEmailLoading = ref(false);

const sendEmailCodeTo = async () => {
    if (updateUserInfoForm.email == "") {
        showError("邮箱不能为空");
        return
    }
    try {
        await updateUserInfoFormRef.value?.validateField("email");
    } catch {
        return;
    }
    sendingEmailLoading.value = true;
    if (await Api.sendEmailCode(updateUserInfoForm.email, userData.cid)) {
        showSuccess("验证码发送成功, 请查看邮箱");
    }
    sendingEmailLoading.value = false;
}

const submitUpdateUserInfoForm = async () => {
    try {
        await updateUserInfoFormRef.value?.validate()
    } catch {
        return;
    }
    editInformationLoading.value = true;
    const data: Record<string, string | number> = {};
    if (updateUserInfoForm.username != "" && updateUserInfoForm.username != userData.username) {
        data["username"] = updateUserInfoForm.username;
    }
    if (updateUserInfoForm.email != "" && updateUserInfoForm.email != userData.email && updateUserInfoForm.email_code) {
        data["email"] = updateUserInfoForm.email;
        data["email_code"] = updateUserInfoForm.email_code;
    }
    if (updateUserInfoForm.qq && updateUserInfoForm.qq != userData.qq) {
        data["qq"] = updateUserInfoForm.qq;
    }
    if (imageUploadRef.value?.hasImageSelected()) {
        if (await imageUploadRef.value?.upload() == null) {
            return;
        }
        data["avatar_url"] = updateUserInfoForm.avatar_url;
    }
    if (Object.keys(data).length == 0) {
        showWarning("没有需要修改的内容");
        editInformationLoading.value = false;
        return;
    }
    if (await ApiUser.updateSelfInformation(data)) {
        showSuccess("修改个人信息成功");
        document.location.reload();
        editInformationDialogRef.value?.hide();
    }
    editInformationLoading.value = false;
}
</script>

<template>
    <div class="container">
        <el-row :gutter="10">
            <el-col :xs="24" :sm="12" :md="6" :lg="5" :xl="5">
                <el-row :gutter="10">
                    <el-col :span="24">
                        <el-card>
                            <el-space direction="vertical" class="w-full">
                                <el-avatar v-if="userData.avatar_url != ''" :src="userData.avatar_url"
                                           :size="100"></el-avatar>
                                <el-avatar v-else :size="100">{{ formatCid(userData.cid) }}</el-avatar>
                                <el-space direction="vertical">
                                    <span class="font-size-15rem">{{ userData.username }}</span>
                                    <span class="font-size-12rem">CID: {{ formatCid(userData.cid) }}</span>
                                    <el-space wrap class="justify-content-center">
                                        <el-tag class="border-none" effect="dark"
                                                :color="config.ratings[userData.rating].color">
                                            {{ ratings }}
                                        </el-tag>
                                        <el-tag v-if="userData.tier2" type="success" effect="dark">Tier2</el-tag>
                                        <el-tag v-else type="danger" effect="dark">Tier2</el-tag>
                                    </el-space>
                                    <el-tag v-if="userData.under_solo" type="primary" effect="dark">
                                        Solo直至{{ moment(userData.solo_until).format("YYYY-MM-DD HH:mm:ss") }}
                                    </el-tag>
                                    <el-space wrap class="justify-content-center">
                                        <el-tag v-if="userData.guest" type="info" effect="dark">客座管制</el-tag>
                                        <el-tag v-if="userData.under_monitor" type="warning" effect="dark">
                                            实习管制
                                        </el-tag>
                                    </el-space>
                                    <el-tag>飞控权限: {{ userData.permission }}</el-tag>
                                </el-space>
                            </el-space>
                            <template #footer>
                                <el-space direction="vertical" class="w-full">
                                    <el-button type="success" @click="editInformationDialogRef?.show()" round>
                                        编辑个人信息
                                    </el-button>
                                    <el-space wrap class="justify-content-center">
                                        <el-button type="primary" @click="editPasswordDialogRef?.show()" round>
                                            修改密码
                                        </el-button>
                                        <el-button type="danger" @click="userStore.logout" round>
                                            退出登录
                                        </el-button>
                                    </el-space>
                                </el-space>
                            </template>
                        </el-card>
                    </el-col>
                    <el-col :span="24">
                        <el-card>
                            <template #header>
                                详细信息
                            </template>
                            <el-descriptions :column="1" border>
                                <el-descriptions-item label="ID">
                                    {{ userData.id }}
                                </el-descriptions-item>
                                <el-descriptions-item label="CID">
                                    {{ formatCid(userData.cid) }}
                                </el-descriptions-item>
                                <el-descriptions-item label="用户名">
                                    {{ userData.username }}
                                </el-descriptions-item>
                                <el-descriptions-item label="邮箱">
                                    {{ userData.email }}
                                </el-descriptions-item>
                                <el-descriptions-item label="QQ">
                                    {{ userData.qq }}
                                </el-descriptions-item>
                                <el-descriptions-item label="联飞时长">
                                    {{ userData.total_pilot_time }}秒
                                </el-descriptions-item>
                                <el-descriptions-item label="管制时长">
                                    {{ userData.total_atc_time }}秒
                                </el-descriptions-item>
                                <el-descriptions-item label="飞控版本">
                                    {{ Global.version }}
                                </el-descriptions-item>
                            </el-descriptions>
                        </el-card>
                    </el-col>
                </el-row>
            </el-col>
            <el-col :xs="24" :sm="12" :md="18" :lg="19" :xl="19">
                <el-card>
                    <el-row :gutter="16" class="align-items-center">
                        <el-col :xs="12" :sm="24" :md="12" :lg="12" :xl="12">
                            <el-statistic title="联飞时长" :value="pilotTime" :precision="2">
                                <template #suffix>h</template>
                            </el-statistic>
                        </el-col>
                        <el-col :xs="12" :sm="24" :md="12" :lg="12" :xl="12">
                            <el-statistic title="管制时长" :value="atcTime" :precision="2">
                                <template #suffix>h</template>
                            </el-statistic>
                        </el-col>
                    </el-row>
                </el-card>
                <el-card>
                    <template #header>
                        <span>连线记录(最近10次)</span>
                    </template>
                    <el-skeleton v-if="loadingHistoryData" :rows="10" animated
                                 :throttle="{ leading: 1000, trailing: 1000}"/>
                    <el-table v-else-if="historyData.pilots.length > 0" :data="historyData.pilots">
                        <el-table-column prop="callsign" label="呼号"/>
                        <el-table-column prop="start_time" label="上线时间"/>
                        <el-table-column prop="end_time" label="下线时间"/>
                        <el-table-column prop="online_time" label="在线时间">
                            <template #default="scope">
                                {{ (scope.row.online_time / 3600.0).toFixed(2) }} h
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-empty v-else description="你好像还没有连线过"/>
                </el-card>
                <el-card>
                    <template #header>
                        <span>管制记录(最近10次)</span>
                    </template>
                    <el-skeleton v-if="loadingHistoryData" :rows="10" animated
                                 :throttle="{ leading: 1000, trailing: 1000}"/>
                    <el-table v-else-if="historyData.controllers.length > 0" :data="historyData.controllers">
                        <el-table-column prop="callsign" label="席位"/>
                        <el-table-column prop="start_time" label="上线时间"/>
                        <el-table-column prop="end_time" label="下线时间"/>
                        <el-table-column prop="online_time" label="在线时间">
                            <template #default="scope">
                                {{ (scope.row.online_time / 3600.0).toFixed(2) }} h
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-empty v-else description="你好像还没有进行过管制"/>
                </el-card>
            </el-col>
        </el-row>
    </div>
    <FormDialog ref="editPasswordDialogRef" title="修改密码" :width="300" :loading="editPasswordLoading"
                @dialog-confirm-event="submitChangePasswordForm()">
        <el-form
            :model="changePasswordForm"
            :rules="changePasswordRules"
            label-position="right"
            label-width="auto"
            ref="changePasswordFormRef"
        >
            <el-form-item label="原密码" prop="origin_password">
                <el-input v-model="changePasswordForm.origin_password" placeholder="请输入原密码" type="password"
                          show-password/>
            </el-form-item>
            <el-form-item label="新密码" prop="new_password">
                <el-input v-model="changePasswordForm.new_password" placeholder="请输入新密码" type="password"
                          show-password/>
            </el-form-item>
            <el-form-item label="重复密码" prop="confirm_password">
                <el-input v-model="changePasswordForm.confirm_password" placeholder="请重复新密码" type="password"
                          show-password/>
            </el-form-item>
        </el-form>
    </FormDialog>
    <FormDialog ref="editInformationDialogRef" title="修改个人信息" :width="400" :loading="editInformationLoading"
                @dialog-confirm-event="submitUpdateUserInfoForm()">
        <el-form
            :model="updateUserInfoForm"
            :rules="updateUserInfoRules"
            ref="updateUserInfoFormRef"
            label-position="left"
            label-width="auto"
        >
            <el-form-item label="CID">
                <el-input :placeholder="String(userData.cid)" disabled/>
            </el-form-item>
            <el-form-item label="用户名" prop="username">
                <el-input v-model="updateUserInfoForm.username" :placeholder="userData.username"/>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="updateUserInfoForm.email" :placeholder="userData.email"/>
            </el-form-item>
            <el-form-item label="验证码" prop="email_codes">
                <div class="flex flex-direction-column-below-425px">
                    <el-input v-model.number="updateUserInfoForm.email_code" class="margin-bottom-5-below-425px"
                              placeholder="输入验证码" :disabled="updateUserInfoForm.email == ''"/>
                    <SendEmailButton @button-click-event="sendEmailCodeTo()"
                                     :disabled="updateUserInfoForm.email == ''"/>
                </div>
            </el-form-item>
            <el-form-item label="QQ" prop="qq">
                <el-input v-model.number="updateUserInfoForm.qq" :placeholder="String(userData.qq)"/>
            </el-form-item>
            <el-form-item label="上传头像">
                <ImageUpload ref="imageUploadRef" v-model="updateUserInfoForm.avatar_url"/>
            </el-form-item>
        </el-form>
    </FormDialog>
</template>

<style scoped>

</style>