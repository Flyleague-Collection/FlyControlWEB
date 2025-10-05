<script setup lang="ts">
import {FormInstance, FormRules} from "element-plus";
import moment from "moment";
import {ref, Ref} from "vue";

import ApiController from "@/api/controller.js";
import type {TimePointsInputInterface} from "@/components/TimePointsInput.js";
import TimePointsInput from "@/components/TimePointsInput.vue";
import type {PageListCardInstance, PageListResponse} from "@/components/card/PageListCard.js";
import PageListCard from "@/components/card/PageListCard.vue";
import type {FormDialogInstance} from "@/components/dialog/FormDialog.js";
import FormDialog from "@/components/dialog/FormDialog.vue";
import {useReactiveWidth} from "@/composables/useReactiveWidth.js";
import {ApplicationStatus} from "@/global.js";
import {useUserStore} from "@/store/user.js";
import {showError, showSuccess} from "@/utils/message.js";
import {PermissionNode} from "@/utils/permission.js";
import {formatCid} from "@/utils/utils.js";

const userStore = useUserStore();

const fetchApplications = async (page: number, pageSize: number): Promise<PageListResponse<ControllerApplicationModel>> => {
    const result: PageListResponse<ControllerApplicationModel> = {data: [], total: 0};
    const data = await ApiController.getControllerApplications(page, pageSize);
    if (data != null) {
        result.data = data.items;
        result.total = data.total;
    }
    return result;
}

const targetApplicationId = ref(0);
const applicationPageRef: Ref<PageListCardInstance> = ref();

const applicationProcessorDialogRef: Ref<FormDialogInstance> = ref();
const timePointsInputRef: Ref<TimePointsInputInterface> = ref();
const applicationProcessorFormData = ref({
    status: ApplicationStatus.Processing,
    times: []
})
const submitApplicationProcessorForm = async () => {
    if (!userStore.permission.hasPermissionNode(PermissionNode.ControllerApplicationConfirm)) {
        showError("你无权这么做");
        return;
    }
    if (targetApplicationId.value == 0) {
        showError("无效的申请ID");
        return;
    }
    if (!timePointsInputRef.value?.validateTimePoint()) {
        return;
    }
    applicationProcessorFormData.value.times = timePointsInputRef.value?.getTimePoints();
    if (await ApiController.confirmControllerApplication(targetApplicationId.value, applicationProcessorFormData.value.times)) {
        showSuccess("确认申请成功");
        applicationProcessorDialogRef.value?.hide();
        applicationProcessorFormData.value.times = [];
        applicationPageRef.value?.flushData();
    }
}

const applicationAgreeDialogRef: Ref<FormDialogInstance> = ref();
const applicationAgreeFormRef: Ref<FormInstance> = ref();
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
        showError("你无权这么做");
        return;
    }
    try {
        await applicationAgreeFormRef.value.validate();
    } catch {
        return;
    }
    if (targetApplicationId.value == 0) {
        showError("无效的申请ID");
        return;
    }
    applicationProcessorFormData.value.times = timePointsInputRef.value?.getTimePoints();
    if (await ApiController.passControllerApplication(targetApplicationId.value, applicationAgreeFormData.value.message)) {
        showSuccess("通过申请成功");
        applicationAgreeDialogRef.value?.hide();
        applicationAgreeFormData.value.message = "";
        applicationPageRef.value?.flushData();
    }
}

const applicationRefuseDialogRef: Ref<FormDialogInstance> = ref();
const applicationRefuseFormRef: Ref<FormInstance> = ref();
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
        showError("你无权这么做");
        return;
    }
    try {
        await applicationRefuseFormRef.value.validate();
    } catch {
        return;
    }
    if (targetApplicationId.value == 0) {
        showError("无效的申请ID");
        return;
    }
    applicationProcessorFormData.value.times = timePointsInputRef.value?.getTimePoints();
    if (await ApiController.refuseControllerApplication(targetApplicationId.value, applicationAgreeFormData.value.message)) {
        showSuccess("拒绝申请成功");
        applicationRefuseDialogRef.value?.hide();
        applicationRefuseFormData.value.message = "";
        applicationPageRef.value?.flushData();
    }
}

const {less900px, less800px, less700px, less600px, less500px} = useReactiveWidth();
</script>

<template>
    <PageListCard ref="applicationPageRef" :fetch-data="fetchApplications" card-title="管制员申请管理" no-transform>
        <el-table-column type="expand">
            <template #default="scope">
                <el-descriptions class="information" :column="1" border :label-width="200">
                    <template #title>
                        <el-space wrap>
                            <span>提交的申请信息</span>
                            <el-space wrap v-if="less500px">
                                <el-button type="primary" size="small"
                                           @click="targetApplicationId = scope.row.id; applicationProcessorDialogRef?.show()"
                                           :disabled="scope.row.status > ApplicationStatus.Submitted || !userStore.permission.hasPermissionNode(PermissionNode.ControllerApplicationConfirm)">
                                    确认申请
                                </el-button>
                                <el-button type="success" size="small"
                                           @click="targetApplicationId = scope.row.id; applicationAgreeDialogRef?.show()"
                                           :disabled="scope.row.status > ApplicationStatus.Processing || !userStore.permission.hasPermissionNode(PermissionNode.ControllerApplicationPass)">
                                    同意
                                </el-button>
                                <el-button type="danger" size="small"
                                           @click="targetApplicationId = scope.row.id; applicationRefuseDialogRef?.show()"
                                           :disabled="scope.row.status > ApplicationStatus.Processing || !userStore.permission.hasPermissionNode(PermissionNode.ControllerApplicationReject)">
                                    拒绝
                                </el-button>
                            </el-space>
                        </el-space>
                    </template>
                    <el-descriptions-item label="提交时间" v-if="less900px">
                        {{ moment(scope.row.created_at).format('YYYY-MM-DD HH:mm:ss') }}
                    </el-descriptions-item>
                    <el-descriptions-item label="申请ID">
                        {{ scope.row?.id }}
                    </el-descriptions-item>
                    <el-descriptions-item label="申请状态" v-if="less600px">
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
                    </el-descriptions-item>
                    <el-descriptions-item label="CID">
                        {{ formatCid(scope.row?.user.cid) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="邮箱">
                        {{ scope.row?.user.email }}
                    </el-descriptions-item>
                    <el-descriptions-item label="为什么想成为管制员">
                        {{ scope.row?.why_want_to_be_controller }}
                    </el-descriptions-item>
                    <el-descriptions-item label="管制经历">
                        {{ scope.row?.controller_record }}
                    </el-descriptions-item>
                    <el-descriptions-item label="客座管制">
                        <el-tag type="success" v-if="scope.row?.is_guest">是</el-tag>
                        <el-tag type="danger" v-else>否</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="客座平台" v-if="scope.row?.is_guest">
                        {{ scope.row?.platform }}
                    </el-descriptions-item>
                    <el-descriptions-item label="佐证材料" v-if="scope.row?.is_guest">
                        <el-image :src="scope.row?.evidence">
                            <template #error>
                                <el-tag type="danger" effect="dark">图片加载失败</el-tag>
                            </template>
                        </el-image>
                    </el-descriptions-item>
                    <el-descriptions-item label="回复信息" v-if="scope.row.status > ApplicationStatus.Processing">
                        {{ scope.row.message }}
                    </el-descriptions-item>
                </el-descriptions>
            </template>
        </el-table-column>
        <el-table-column label="提交时间" v-if="!less900px">
            <template #default="scope">
                {{ moment(scope.row.created_at).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
        </el-table-column>
        <el-table-column label="申请ID" prop="id" v-if="!less800px"/>
        <el-table-column label="CID">
            <template #default="scope">
                <span v-if="!less600px">{{ formatCid(scope.row.user.cid) }}</span>
                <span v-else>
                    <el-tag type="info" effect="dark" v-if="scope.row.status == ApplicationStatus.Submitted">
                        {{ formatCid(scope.row.user.cid) }}
                    </el-tag>
                    <el-tag type="primary" effect="dark" v-if="scope.row.status == ApplicationStatus.Processing">
                        {{ formatCid(scope.row.user.cid) }}
                    </el-tag>
                    <el-tag type="success" effect="dark" v-if="scope.row.status == ApplicationStatus.Passed">
                        {{ formatCid(scope.row.user.cid) }}
                    </el-tag>
                    <el-tag type="danger" effect="dark" v-if="scope.row.status == ApplicationStatus.Rejected">
                        {{ formatCid(scope.row.user.cid) }}
                    </el-tag>
                </span>
            </template>
        </el-table-column>
        <el-table-column label="申请状态" v-if="!less600px">
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
        <el-table-column label="客座管制申请" v-if="!less700px">
            <template #default="scope">
                <el-tag type="success" v-if="scope.row.is_guest">是</el-tag>
                <el-tag type="danger" v-else>否</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="操作" v-if="!less500px">
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