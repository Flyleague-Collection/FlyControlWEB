<script setup lang="ts">
import type {PageListCardInstance, PageListResponse} from "@/components/card/PageListCard.js";
import request from "@/utils/request.js";
import PageListCard from "@/components/card/PageListCard.vue";
import AxiosXHR = Axios.AxiosXHR;
import moment from "moment";
import {formatCid} from "@/utils/utils.js";
import ApplicationDescription from "@/components/ApplicationDescription.vue";
import FormDialog from "@/components/dialog/FormDialog.vue";
import {ref, Ref} from "vue";
import {FormDialogInstance} from "@/components/dialog/FormDialog.js";
import {FormInstance, FormRules} from "element-plus";
import {ApplicationStatus} from "@/global.js";
import TimePointsInput from "@/components/TimePointsInput.vue";
import {TimePointsInputInterface} from "@/components/TimePointsInput.js";
import {showError, showSuccess} from "@/utils/message.js";
import {useUserStore} from "@/store/user.js";
import {PermissionNode} from "@/utils/permission.js";

const userStore = useUserStore();

const fetchApplications = async (page: number, pageSize: number): Promise<PageListResponse<ControllerApplicationModel>> => {
    const result: PageListResponse<ControllerApplicationModel> = {data: [], total: 0};
    const response = await request.get(`/controllers/applications?page_number=${page}&page_size=${pageSize}`) as AxiosXHR<PageDataResponse<ControllerApplicationModel>>;
    if (response.status == 200) {
        result.data = response.data.items;
        result.total = response.data.total;
    }
    return result;
}

const targetApplicationId = ref(0)
const applicationPageRef: Ref<PageListCardInstance> = ref()

const applicationProcessorDialogRef: Ref<FormDialogInstance> = ref()
const timePointsInputRef: Ref<TimePointsInputInterface> = ref()
const applicationProcessorFormData = ref({
    status: ApplicationStatus.Processing,
    times: []
})
const submitApplicationProcessorForm = async () => {
    if (!userStore.permission.hasPermissionNode(PermissionNode.ControllerApplicationConfirm)) {
        showError("你无权这么做")
        return
    }
    if (targetApplicationId.value == 0) {
        showError("无效的申请ID")
        return
    }
    if (!timePointsInputRef.value?.validateTimePoint()) {
        return
    }
    applicationProcessorFormData.value.times = timePointsInputRef.value?.getTimePoints()
    const response = await request.put(`/controllers/applications/${targetApplicationId.value}`, applicationProcessorFormData.value) as AxiosXHR<boolean>;
    if (response.status == 200 && response.data) {
        showSuccess("确认申请成功")
        applicationProcessorDialogRef.value?.hide()
        applicationProcessorFormData.value.times = []
        applicationPageRef.value?.flushData()
    }
}

const applicationAgreeDialogRef: Ref<FormDialogInstance> = ref()
const applicationAgreeFormRef: Ref<FormInstance> = ref()
const applicationAgreeFormData = ref({
    status: ApplicationStatus.Passed,
    message: ""
})
const applicationAgreeFormRule = ref<FormRules>({
    message: [
        {required: true, message: "此条目不能为空", trigger: "blur"}
    ]
})
const submitApplicationAgreeForm = async () => {
    if (!userStore.permission.hasPermissionNode(PermissionNode.ControllerApplicationPass)) {
        showError("你无权这么做")
        return
    }
    try {
        await applicationAgreeFormRef.value.validate()
    } catch {
        return
    }
    if (targetApplicationId.value == 0) {
        showError("无效的申请ID")
        return
    }
    applicationProcessorFormData.value.times = timePointsInputRef.value?.getTimePoints()
    const response = await request.put(`/controllers/applications/${targetApplicationId.value}`, applicationAgreeFormData.value) as AxiosXHR<boolean>;
    if (response.status == 200 && response.data) {
        showSuccess("通过申请成功")
        applicationAgreeDialogRef.value?.hide()
        applicationAgreeFormData.value.message = ""
        applicationPageRef.value?.flushData()
    }
}

const applicationRefuseDialogRef: Ref<FormDialogInstance> = ref()
const applicationRefuseFormRef: Ref<FormInstance> = ref()
const applicationRefuseFormData = ref({
    status: ApplicationStatus.Rejected,
    message: ""
})
const applicationRefuseFormRule = ref<FormRules>({
    message: [
        {required: true, message: "此条目不能为空", trigger: "blur"}
    ]
})
const submitApplicationRefuseForm = async () => {
    if (!userStore.permission.hasPermissionNode(PermissionNode.ControllerApplicationReject)) {
        showError("你无权这么做")
        return
    }
    try {
        await applicationRefuseFormRef.value.validate()
    } catch {
        return
    }
    if (targetApplicationId.value == 0) {
        showError("无效的申请ID")
        return
    }
    applicationProcessorFormData.value.times = timePointsInputRef.value?.getTimePoints()
    const response = await request.put(`/controllers/applications/${targetApplicationId.value}`, applicationRefuseFormData.value) as AxiosXHR<boolean>;
    if (response.status == 200 && response.data) {
        showSuccess("拒绝申请成功")
        applicationRefuseDialogRef.value?.hide()
        applicationRefuseFormData.value.message = ""
        applicationPageRef.value?.flushData()
    }
}

</script>

<template>
    <PageListCard ref="applicationPageRef" :fetch-data="fetchApplications" card-title="管制员申请管理">
        <el-table-column type="expand">
            <template #default="scope">
                <ApplicationDescription :application="scope.row" title="申请详细信息"/>
            </template>
        </el-table-column>
        <el-table-column label="提交时间">
            <template #default="scope">
                {{ moment(scope.row.created_at).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
        </el-table-column>
        <el-table-column label="申请ID" prop="id"/>
        <el-table-column label="CID">
            <template #default="scope">
                {{ formatCid(scope.row.user.cid) }}
            </template>
        </el-table-column>
        <el-table-column label="申请状态">
            <template #default="scope">
                <el-tag type="info" effect="dark" v-if="scope.row.status == ApplicationStatus.Submitted">
                    已提交
                </el-tag>
                <el-tag type="primary" effect="dark" v-if="scope.row.status == ApplicationStatus.Processing">
                    面试中
                </el-tag>
                <el-tag type="success" effect="dark" v-if="scope.row.status == ApplicationStatus.Passed">
                    已通过
                </el-tag>
                <el-tag type="danger" effect="dark" v-if="scope.row.status == ApplicationStatus.Rejected">
                    已拒绝
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column label="客座管制申请">
            <template #default="scope">
                <el-tag type="success" v-if="scope.row.is_guest">是</el-tag>
                <el-tag type="danger" v-else>否</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="操作">
            <template #default="scope">
                <el-space wrap>
                    <el-button type="primary"
                               @click="targetApplicationId = scope.row.id; applicationProcessorDialogRef?.show()"
                               :disabled="scope.row.status > ApplicationStatus.Submitted || !userStore.permission.hasPermissionNode(PermissionNode.ControllerApplicationConfirm)">
                        确认申请
                    </el-button>
                    <el-button type="success"
                               @click="targetApplicationId = scope.row.id; applicationAgreeDialogRef?.show()"
                               :disabled="scope.row.status > ApplicationStatus.Processing || !userStore.permission.hasPermissionNode(PermissionNode.ControllerApplicationPass)">
                        同意
                    </el-button>
                    <el-button type="danger"
                               @click="targetApplicationId = scope.row.id; applicationRefuseDialogRef?.show()"
                               :disabled="scope.row.status > ApplicationStatus.Processing || !userStore.permission.hasPermissionNode(PermissionNode.ControllerApplicationReject)">
                        拒绝
                    </el-button>
                </el-space>
            </template>
        </el-table-column>
    </PageListCard>
    <FormDialog ref="applicationProcessorDialogRef" title="预约面试管制员" :width="400"
                @dialog-confirm-event="submitApplicationProcessorForm()">
        <el-form>
            <TimePointsInput v-model="applicationProcessorFormData" ref="timePointsInputRef"/>
        </el-form>
    </FormDialog>
    <FormDialog ref="applicationAgreeDialogRef" title="同意管制员申请" :width="400"
                @dialog-confirm-event="submitApplicationAgreeForm()">
        <el-form ref="applicationAgreeFormRef" :model="applicationAgreeFormData" :rules="applicationAgreeFormRule">
            <el-form-item label="补充信息" prop="message">
                <el-input v-model="applicationAgreeFormData.message" type="textarea"
                          :autosize="{minRows: 3, maxRows: 6}"/>
            </el-form-item>
        </el-form>
    </FormDialog>
    <FormDialog ref="applicationRefuseDialogRef" title="拒绝管制员申请" :width="400"
                @dialog-confirm-event="submitApplicationRefuseForm()">
        <el-form ref="applicationRefuseFormRef" :model="applicationRefuseFormData" :rules="applicationRefuseFormRule">
            <el-form-item label="拒绝理由" prop="message">
                <el-input v-model="applicationRefuseFormData.message" type="textarea"
                          :autosize="{minRows: 3, maxRows: 6}"/>
            </el-form-item>
        </el-form>
    </FormDialog>
</template>

<style scoped>

</style>