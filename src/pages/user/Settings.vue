<script setup lang="ts">
import {useUserStore} from "@/store/user.js";
import config from "@/config/index.js";
import {useServerConfigStore} from "@/store/server_config.js";
import {computed, onMounted, reactive, Ref, ref} from "vue";
import {Plus} from "@element-plus/icons-vue";
import request from "@/utils/request.js";
import moment from "moment";
import AxiosXHR = Axios.AxiosXHR;
import FormDialog from "@/components/dialog/FormDialog.vue";
import {
    FormInstance,
    FormRules,
    genFileId,
    UploadFile,
    UploadInstance,
    UploadRawFile,
    UploadUserFile
} from "element-plus";
import {showError, showSuccess, showWarning} from "@/utils/message.js";
import {useActivityStore} from "@/store/activity.js";
import {sizeToString} from "@/utils/utils.js";

const serverConfig = useServerConfigStore();
const userStore = useUserStore();
const activityStore = useActivityStore();
const serverConfigStore = useServerConfigStore();
const userData = userStore.userData;

const pilotTime = computed(() => {
    return userData.total_pilot_time / 3600.0;
})

const atcTime = computed(() => {
    return userData.total_atc_time / 3600.0;
})

const ratings = computed(() => {
    const rating = serverConfigStore.ratings[userData.rating + 1]
    return `${rating.short_name}/${rating.long_name}`
})

const historyData: Ref<GetUserHistoryResponse> = ref({
    total_pilot_time: 0,
    total_atc_time: 0,
    controllers: [],
    pilots: []
});

onMounted(async () => {
    const response = await request.get(`/history`) as AxiosXHR<GetUserHistoryResponse>
    historyData.value = response.data
    for (const pilot of historyData.value.pilots) {
        pilot.start_time = moment(pilot.start_time).format('YYYY-MM-DD HH:mm:ss');
        pilot.end_time = moment(pilot.end_time).format('YYYY-MM-DD HH:mm:ss');
    }
    for (const controller of historyData.value.controllers) {
        controller.start_time = moment(controller.start_time).format('YYYY-MM-DD HH:mm:ss');
        controller.end_time = moment(controller.end_time).format('YYYY-MM-DD HH:mm:ss');
    }
})

const editPasswordDialog = ref(false);
const changePasswordFormRef = ref<FormInstance>();
const changePasswordForm = reactive<ChangePasswordForm>({
    origin_password: '',
    new_password: '',
    confirm_password: ''
})
const changePasswordRules = reactive<FormRules>({
    origin_password: [
        {required: true, message: "原密码不能为空", trigger: 'blur'},
        {
            min: serverConfig.limits.password_length_min,
            max: serverConfig.limits.password_length_max,
            message: `长度在${serverConfig.limits.password_length_min}到${serverConfig.limits.password_length_max}个字符`,
            trigger: 'blur'
        }
    ],
    new_password: [
        {required: true, message: "新密码不能为空", trigger: 'blur'},
        {
            min: serverConfig.limits.password_length_min,
            max: serverConfig.limits.password_length_max,
            message: `长度在${serverConfig.limits.password_length_min}到${serverConfig.limits.password_length_max}个字符`,
            trigger: 'blur'
        },
        {
            validator: (_, value, callback) => {
                if (value == changePasswordForm.origin_password) {
                    callback(new Error("新密码与原密码相同"))
                    return
                }
                callback()
            }, trigger: 'blur'
        }
    ],
    confirm_password: [
        {required: true, message: '请输入确认密码', trigger: 'blur'},
        {
            min: serverConfig.config.limits.password_length_min,
            max: serverConfig.config.limits.password_length_max,
            message: `长度在${serverConfig.config.limits.password_length_min}到${serverConfig.config.limits.password_length_max}个字符`,
            trigger: 'blur'
        },
        {
            validator: (rule, value, callback) => {
                if (value !== changePasswordForm.new_password) {
                    callback(new Error('两次输入的密码不一致'))
                    return
                }
                callback()
            },
            trigger: 'blur'
        }
    ]
})
const submitChangePasswordForm = async () => {
    try {
        await changePasswordFormRef.value?.validate()
    } catch (error) {
        return;
    }
    const response = await request.patch(`/profile`, changePasswordForm) as AxiosXHR<UserModel>
    if (response.status == 200) {
        showSuccess("修改密码成功，请重新登陆")
        editPasswordDialog.value = false
        setTimeout(() => {
            userStore.logout()
        }, 1000)
    }
}

const editInformationDialog = ref(false);
const updateUserInfoFormRef = ref<FormInstance>();
const updateUserInfoForm = reactive<UpdateUserInfoForm>({
    username: '',
    email: ''
})
const updateUserInfoRules = reactive<FormRules>({
    username: serverConfig.usernameLimit,
    email: serverConfig.emailLimit
})

const uploadRef = ref<UploadInstance>()
const selectedImage = ref<UploadUserFile | null>(null)
const fileList = ref<UploadUserFile[]>([])
const handleChanged = (uploadFile: UploadFile, _) => {
    selectedImage.value = null;
    // 5MB
    if (uploadFile.size > serverConfig.config.image_limit.max_allow_size) {
        showError(`不能上传大于${sizeToString(serverConfig.config.image_limit.max_allow_size)}的文件`);
        uploadRef.value!.clearFiles()
        return;
    }
    const ext = `.${uploadFile.name.split('.').pop()?.toLowerCase()}`;
    if (serverConfig.config.image_limit.allowed_ext.findIndex(x => x === ext) === -1) {
        showError(`不支持的图片类型`);
        uploadRef.value!.clearFiles()
        return;
    }
    selectedImage.value = uploadFile;
}

const handleExceed = (files: File[], _) => {
    uploadRef.value!.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    uploadRef.value!.handleStart(file)
}

const sendEmailCode = async () => {
    if (updateUserInfoForm.email == '') {
        showError("邮箱验证失败")
        return
    } else {
        try {
            await updateUserInfoFormRef.value?.validateField('email')
        } catch {
            showError("邮箱验证失败")
            return
        }
    }
    const response = await request.post(`/codes`, {
        email: updateUserInfoForm.email,
        cid: userData.cid
    }) as AxiosXHR<any>
    if (response.status == 200) {
        showSuccess("验证码发送成功, 请查看邮箱")
    }
}

const submitUpdateUserInfoForm = async () => {
    try {
        await updateUserInfoFormRef.value?.validate()
    } catch {
        return;
    }
    const data: Record<string, string | number> = {};
    if (updateUserInfoForm.username != "" && updateUserInfoForm.username != userData.username) {
        data['username'] = updateUserInfoForm.username;
    }
    if (updateUserInfoForm.email != "" && updateUserInfoForm.email != userData.email && updateUserInfoForm.email_code) {
        data['email'] = updateUserInfoForm.email;
        data['email_code'] = updateUserInfoForm.email_code;
    }
    if (updateUserInfoForm.qq && updateUserInfoForm.qq != userData.qq) {
        data["qq"] = updateUserInfoForm.qq
    }
    if (selectedImage.value != null) {
        const filePath = await activityStore.uploadActivityImage(selectedImage.value.raw as File)
        if (filePath == null) {
            showError("头像上传失败")
            return
        }
        data["avatar_url"] = filePath;
    }
    if (Object.keys(data).length == 0) {
        showWarning("没有需要修改的内容")
        return
    }
    const response = await request.patch(`/profile`, data) as AxiosXHR<UserModel>
    if (response.status == 200) {
        showSuccess("修改个人信息成功")
        document.location.reload()
        editInformationDialog.value = false
        return
    }
}
</script>

<template>
    <div class="container">
        <el-row :gutter="10">
            <el-col :xs="24" :sm="12" :md="6" :lg="5" :xl="5">
                <el-row :gutter="10">
                    <el-col :span="24">
                        <el-card>
                            <div class="flex flex-direction-column align-items-center">
                                <el-avatar v-if="userData.avatar_url != ''" :src="userData.avatar_url"
                                           :size="100"></el-avatar>
                                <el-avatar v-else :size="100">{{ userData.cid }}</el-avatar>
                                <div class="flex flex-direction-column margin-left-10 align-items-center">
                                    <span class="font-size-15rem">{{ userData.username }}</span>
                                    <span class="font-size-12rem">CID: {{ userData.cid }}</span>
                                    <el-tag class="text-color-white border-none margin-bottom-5"
                                            :color="config.rating_color[userData.rating]">
                                        {{ ratings }}
                                    </el-tag>
                                    <el-tag class="border-none margin-bottom-5">飞控权限: {{
                                            userData.permission
                                        }}
                                    </el-tag>
                                </div>
                            </div>
                            <template #footer>
                                <div class="flex justify-content-center margin-bottom-10">
                                    <el-button type="success" @click="editInformationDialog = true" round>编辑个人信息
                                    </el-button>
                                </div>
                                <div class="flex justify-content-center flex-direction-column-below-350px">
                                    <el-button class="margin-0-below-350px margin-bottom-10-below-350px" type="primary"
                                               @click="editPasswordDialog = true" round>修改密码
                                    </el-button>
                                    <el-button class="margin-0-below-350px" type="danger" round
                                               @click="userStore.logout">退出登录
                                    </el-button>
                                </div>
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
                                    {{ userData.cid }}
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
                                    0.5.1
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
                    <el-table v-if="historyData.pilots.length > 0" :data="historyData.pilots">
                        <el-table-column prop="callsign" label="呼号"></el-table-column>
                        <el-table-column prop="start_time" label="上线时间"></el-table-column>
                        <el-table-column prop="end_time" label="下线时间"></el-table-column>
                        <el-table-column prop="online_time" label="在线时间">
                            <template #default="scope">
                                {{ (scope.row.online_time / 3600.0).toFixed(2) }} h
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-empty v-else description="你好像还没有连线过"></el-empty>
                </el-card>
                <el-card>
                    <template #header>
                        <span>管制记录(最近10次)</span>
                    </template>
                    <el-table v-if="historyData.controllers.length > 0" :data="historyData.controllers">
                        <el-table-column prop="callsign" label="席位"></el-table-column>
                        <el-table-column prop="start_time" label="上线时间"></el-table-column>
                        <el-table-column prop="end_time" label="下线时间"></el-table-column>
                        <el-table-column prop="online_time" label="在线时间">
                            <template #default="scope">
                                {{ (scope.row.online_time / 3600.0).toFixed(2) }} h
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-empty v-else description="你好像还没有进行过管制"></el-empty>
                </el-card>
            </el-col>
        </el-row>
    </div>
    <FormDialog v-model="editPasswordDialog" title="修改密码" :width="300"
                @dialog-confirm-event="submitChangePasswordForm()">
        <el-form
            :model="changePasswordForm"
            :rules="changePasswordRules"
            label-position="right"
            label-width="auto"
            ref="changePasswordFormRef"
            @keyup.enter="submitChangePasswordForm()"
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
    <FormDialog v-model="editInformationDialog" title="修改个人信息" :width="400"
                @dialog-confirm-event="submitUpdateUserInfoForm()">
        <el-form
            :model="updateUserInfoForm"
            :rules="updateUserInfoRules"
            ref="updateUserInfoFormRef"
            label-position="left"
            label-width="auto"
            @keyup.enter="submitUpdateUserInfoForm()"
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
                    <el-button type="primary" :disabled="updateUserInfoForm.email == ''" @click="sendEmailCode()">
                        发送验证码
                    </el-button>
                </div>
            </el-form-item>
            <el-form-item label="QQ" prop="qq">
                <el-input v-model.number="updateUserInfoForm.qq" :placeholder="String(userData.qq)"/>
            </el-form-item>
            <el-form-item label="上传头像">
                <el-upload class="avatar-uploader"
                           ref="uploadRef"
                           :auto-upload="false"
                           :file-list="fileList"
                           :limit="1"
                           :on-exceed="handleExceed"
                           :on-change="handleChanged"
                           accept="image/*"
                           list-type="picture-card">
                    <el-icon>
                        <Plus/>
                    </el-icon>
                </el-upload>
            </el-form-item>
        </el-form>
    </FormDialog>
</template>

<style scoped>
.avatar-uploader {
    width: 114px;
    height: 114px;
    cursor: pointer;
    transition: var(--el-transition-duration-fast);
}

.avatar-uploader:hover {
    border-color: var(--el-color-primary);
}
</style>