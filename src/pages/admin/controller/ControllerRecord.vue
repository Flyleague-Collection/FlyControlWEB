<script setup lang="ts">
import {ArrowLeft, Plus} from "@element-plus/icons-vue";
import {padStart} from "lodash-es";
import moment from "moment";
import {onMounted, ref, Ref} from "vue";
import {useRoute, useRouter} from "vue-router";

import ApiController from "@/api/controller.js";
import ApiUser from "@/api/user.js";
import type {PageListCardInstance, PageListResponse} from "@/components/card/PageListCard.js";
import PageListCard from "@/components/card/PageListCard.vue";
import type {FormDialogInstance} from "@/components/dialog/FormDialog.js";
import FormDialog from "@/components/dialog/FormDialog.vue";
import {Global} from "@/global.js";
import {useUserStore} from "@/store/user.js";
import {showError, showSuccess} from "@/utils/message.js";
import {PermissionNode} from "@/utils/permission.js";
import {formatCid} from "@/utils/utils.js";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const userData: Ref<UserModel> = ref({});

const fetchControllerRecord = async (page: number, pageSize: number): Promise<PageListResponse<ControllerRecordModel>> => {
    const result: PageListResponse<ControllerRecordModel> = {data: [], total: 0}
    const data = await ApiController.getControllerRecords(Number(route.params.id), page, pageSize);
    if (data != null) {
        result.data = data.items
        result.total = data.total
    }
    return result;
}

onMounted(async () => {
    const data = await ApiUser.getUserByUid(Number(route.params.id));
    if (data) {
        userData.value = data;
    }
})

const addControllerRecordDialogRef: Ref<FormDialogInstance> = ref();
type AddControllerRecord = {
    type: number;
    content: string;
}
const formData = ref<AddControllerRecord>({
    type: 0,
    content: ''
});
const recordListCardRef: Ref<PageListCardInstance> = ref();
const createRecordLoading = ref(false);

const submitCreateRecord = async () => {
    createRecordLoading.value = true;
    if (!userStore.permission.hasPermissionNode(PermissionNode.ControllerCreateRecord)) {
        showError("你无权这么做");
        createRecordLoading.value = false;
        return;
    }
    if (await ApiController.createControllerRecord(Number(route.params.id), formData.value.type, formData.value.content)) {
        showSuccess("添加管制员履历成功");
        recordListCardRef.value?.flushData();
        formData.value.type = 0;
        formData.value.content = '';
        addControllerRecordDialogRef.value?.hide();
    }
    createRecordLoading.value = false;
}

const removeRecordLoading = ref(false);

const removeRecord = async (recordId: number) => {
    removeRecordLoading.value = true;
    if (!userStore.permission.hasPermissionNode(PermissionNode.ControllerDeleteRecord)) {
        showError("你无权这么做");
        removeRecordLoading.value = false;
        return;
    }
    if (await ApiController.deleteControllerRecord(Number(route.params.id), recordId)) {
        showSuccess("删除管制员履历成功");
        recordListCardRef.value?.flushData();
    }
    removeRecordLoading.value = false;
}
</script>

<template>
    <PageListCard ref="recordListCardRef" :fetch-data="fetchControllerRecord" no-transform>
        <template #header>
            <el-space wrap>
                <el-button :icon="ArrowLeft" text @click="router.push(`/admin/controllers`)"/>
                <span>{{ padStart(userData.cid, 4, '0') }}的履历</span>
                <el-button :icon="Plus" type="success" @click="addControllerRecordDialogRef?.show()"
                           :loading="createRecordLoading"
                           :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ControllerCreateRecord) || createRecordLoading">
                    添加履历
                </el-button>
            </el-space>
        </template>
        <el-table-column label="记录时间">
            <template #default="scope">
                {{ moment(scope.row.time).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
        </el-table-column>
        <el-table-column label="类型">
            <template #default="scope">
                <el-tag>{{ Global.controllerRecordTypes[scope.row.type].label }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="记录人">
            <template #default="scope">
                {{ formatCid(scope.row.operator_cid) }}
            </template>
        </el-table-column>
        <el-table-column label="内容">
            <template #default="scope">
                {{ scope.row.content }}
            </template>
        </el-table-column>
        <el-table-column label="操作">
            <template #default="scope">
                <el-button type="danger" dark @click="removeRecord(scope.row.id)"
                           :loading="removeRecordLoading"
                           :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ControllerDeleteRecord) || removeRecordLoading">
                    删除
                </el-button>
            </template>
        </el-table-column>
    </PageListCard>
    <FormDialog ref="addControllerRecordDialogRef" title="添加管制员履历" :width="600"
                @dialog-confirm-event="submitCreateRecord()" :loading="createRecordLoading">
        <el-form v-model="formData">
            <el-form-item label="履历类型">
                <el-select v-model.number="formData.type" :options="Global.controllerRecordTypes"/>
            </el-form-item>
            <el-form-item label="履历内容">
                <el-input v-model="formData.content" type="textarea" show-word-limit
                          :autosize="{ minRows: 2, maxRows: 6 }"/>
            </el-form-item>
        </el-form>
    </FormDialog>
</template>

<style scoped>

</style>