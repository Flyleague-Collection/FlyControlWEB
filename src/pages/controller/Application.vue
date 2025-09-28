<script setup lang="ts">
import {useUserStore} from "@/store/user.js";
import {onMounted, onUnmounted, ref, Ref} from "vue";
import {useRouter} from "vue-router";
import {ApplicationStatus, Global, Ratings} from "@/global.js";
import {showError, showInfo, showSuccess, showWarning} from "@/utils/message.js";
import request from "@/api/request.js";
import AxiosXHR = Axios.AxiosXHR;
import {Check, CircleCheck, CircleClose, Clock, Close, EditPen, List, Picture} from "@element-plus/icons-vue";
import {formatCid} from "@/utils/utils.js";
import FormDialog from "@/components/dialog/FormDialog.vue";
import {FormDialogInstance} from "@/components/dialog/FormDialog.js";
import {FormInstance, FormRules} from "element-plus";
import ImageUpload from "@/components/ImageUpload.vue";
import {ImageUploadInterface} from "@/components/ImageUpload.js";
import ApplicationDescription from "@/components/ApplicationDescription.vue";
import ConfirmDialog from "@/components/dialog/ConfirmDialog.vue";
import {ConfirmDialogInstance} from "@/components/dialog/ConfirmDialog.js";

const userStore = useUserStore();
const router = useRouter();
const application: Ref<ControllerApplicationModel | null> = ref(null)
const processStatus = ref(0)

enum ApplicationProgress {
    Submitted = 1,
    Processing,
    Waiting,
    Result
}

const getSelfApplication = async () => {
    const response = await request.get(`/controllers/applications/self`) as AxiosXHR<ControllerApplicationModel>
    if (response.status == 200) {
        application.value = response.data
        if (response.data.status == ApplicationStatus.Submitted) {
            processStatus.value = ApplicationProgress.Submitted
        }
        if (response.data.status == ApplicationStatus.Processing) {
            processStatus.value = ApplicationProgress.Waiting
        }
        if (response.data.status >= ApplicationStatus.Passed) {
            processStatus.value = ApplicationProgress.Result
        }
    }
}

let timeoutHandler = null;

onMounted(async () => {
    if (userStore.userData.rating >= Ratings.Observer) {
        showInfo("你已是管制员，正在跳转至管制员档案")
        timeoutHandler = setTimeout(async () => {
            await router.push("/controllers/profile")
        }, 3000)
    }
    await getSelfApplication();
})

onUnmounted(() => {
    if (timeoutHandler) {
        clearTimeout(timeoutHandler);
    }
})

type ApplicationForm = {
    why_want_to_be_controller: string;
    controller_record: string;
    is_guest: boolean;
    platform: string;
    evidence: string;
}

const applicationDialogRef: Ref<FormDialogInstance> = ref()
const applicationFormData = ref<ApplicationForm>({
    why_want_to_be_controller: "",
    controller_record: "",
    is_guest: false,
    platform: "",
    evidence: ""
});
const applicationFormRef: Ref<FormInstance> = ref()
const applicationFormRule: Ref<FormRules> = ref({
    why_want_to_be_controller: [
        {required: true, message: "此条目不能为空", trigger: "blur"}
    ],
    controller_record: [
        {required: true, message: "此条目不能为空", trigger: "blur"}
    ],
    is_guest: [
        {required: true, message: "此条目不能为空", trigger: "blur"}
    ],
    platform: [
        {required: true, message: "此条目不能为空", trigger: "blur"}
    ],
    evidence: [
        {required: true, message: "此条目不能为空", trigger: "blur"}
    ]
})
const imageUploadRef: Ref<ImageUploadInterface> = ref()

const submitControllerApplication = async () => {
    try {
        await applicationFormRef.value.validate()
    } catch {
        return
    }
    if (applicationFormData.value.is_guest) {
        if (await imageUploadRef.value?.upload() == null) {
            return
        }
    } else {
        applicationFormData.value.platform = "";
        applicationFormData.value.evidence = "";
    }
    const response = await request.post(`/controllers/applications`, applicationFormData.value) as AxiosXHR<boolean>
    if (response.status == 200 && response.data) {
        showSuccess("提交管制员申请成功")
        applicationDialogRef.value?.hide();
        applicationFormData.value = {
            why_want_to_be_controller: "",
            controller_record: "",
            is_guest: false,
            platform: "",
            evidence: ""
        }
        await getSelfApplication();
    }
}

const confirmCancelDialogRef: Ref<ConfirmDialogInstance> = ref()
const cancelApplication = async () => {
    const response = await request.delete(`/controllers/applications/self`) as AxiosXHR<boolean>;
    if (response.status == 200 && response.data) {
        showSuccess("成功取消管制员申请");
        application.value = null
    }
}
</script>

<template>
    <el-card class="no-transform">
        <template #header>
            管制员申请进度
        </template>
        <el-space wrap v-if="application != null" direction="vertical" class="w-full" fill>
            <el-steps :active="processStatus" align-center class="w-full">
                <el-step title="已提交申请, 等待审核" :icon="EditPen" status="success"/>
                <el-step title="空管中心已受理, 审核中" :icon="List"
                         :status="processStatus > ApplicationProgress.Processing ? 'success' : 'process'"/>
                <el-step title="等待结果" :icon="Clock"
                         :status="processStatus > ApplicationProgress.Waiting ? 'success' : 'process'"/>
                <el-step title="恭喜, 您的申请已通过" v-if="application?.status == ApplicationStatus.Passed"
                         :icon="CircleCheck" status="success"/>
                <el-step title="很遗憾, 您的申请未通过" v-if="application?.status == ApplicationStatus.Rejected"
                         :icon="CircleClose" status="error">
                    <template #description>
                        <el-button type="primary" round @click="application = null; applicationDialogRef?.show()">
                            重新提交申请
                        </el-button>
                    </template>
                </el-step>
            </el-steps>
            <el-space class="justify-content-center" v-if="application?.status < ApplicationStatus.Passed">
                <el-button type="danger" round @click="confirmCancelDialogRef?.show()">取消申请</el-button>
            </el-space>
            <ApplicationDescription :application="application"/>
        </el-space>
        <el-empty v-else description="看来你还没有提交过管制员申请">
            <el-button type="primary" @click="applicationDialogRef?.show()">立刻提交</el-button>
        </el-empty>
    </el-card>
    <form-dialog ref="applicationDialogRef" title="提交管制员申请" :width="500"
                 @dialog-confirm-event="submitControllerApplication()">
        <el-form :model="applicationFormData" :rules="applicationFormRule" ref="applicationFormRef"
                 label-position="top">
            <el-space fill>
                <el-alert type="primary" :closable="false" show-icon>
                    <p>此回答没有标准答案</p>
                    <p>空管中心不会因此拒绝您的加入申请, 请放心填写</p>
                </el-alert>
                <el-form-item label="为什么想要成为管制员" prop="why_want_to_be_controller">
                    <el-input v-model="applicationFormData.why_want_to_be_controller"
                              placeholder="请简单描述一下你为什么想成为管制员"
                              type="textarea"
                              :autosize="{minRows: 3, maxRows: 10}"/>
                </el-form-item>
            </el-space>
            <el-form-item label="管制经历" prop="controller_record">
                <el-input v-model="applicationFormData.controller_record"
                          placeholder="请简单描述一下你的管制经历, 没有请写'无'"
                          type="textarea" :autosize="{minRows: 3, maxRows: 10}"/>
            </el-form-item>
            <el-form-item label="客座管制" label-position="left" prop="is_guest">
                <el-switch v-model="applicationFormData.is_guest"/>
            </el-form-item>
            <el-form-item label="客座平台" label-position="left" prop="platform" v-if="applicationFormData.is_guest">
                <el-select v-model="applicationFormData.platform" :options="Global.supportedPlatforms"/>
            </el-form-item>
            <el-space fill v-if="applicationFormData.is_guest">
                <el-alert type="warning" :closable="false" show-icon>
                    <p>只能上传一张图片, 请上传最明确的材料</p>
                    <p>比如说包含对应客座平台名字的权限公示表</p>
                </el-alert>
                <el-form-item label="佐证材料" label-position="left" prop="evidence">
                    <ImageUpload ref="imageUploadRef" v-model="applicationFormData.evidence"/>
                </el-form-item>
            </el-space>
        </el-form>
    </form-dialog>
    <ConfirmDialog ref="confirmCancelDialogRef"
                   body-content="确认取消申请吗？"
                   header-content="取消管制员申请"
                   @confirm-event="cancelApplication"
    />
</template>

<style scoped>
</style>