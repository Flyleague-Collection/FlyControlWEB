<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {ArrowLeft, Plus} from "@element-plus/icons-vue";

import {useUserStore} from "@/store/user.js";
import request from "@/api/request.js";
import AxiosXHR = Axios.AxiosXHR;
import PageListCard from "@/components/card/PageListCard.vue";
import {PageListCardInstance, PageListResponse} from "@/components/card/PageListCard.js";
import moment from "moment";
import {onMounted, ref, Ref} from "vue";
import {PermissionNode} from "@/utils/permission.js";
import FormDialog from "@/components/dialog/FormDialog.vue";
import {showError, showSuccess} from "@/utils/message.js";
import {Global} from "@/global.js";
import {padStart} from "lodash-es";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const userData: Ref<UserModel> = ref({});

const fetchControllerRecord = async (page: number, pageSize: number): Promise<PageListResponse<ControllerRecordModel>> => {
    const data: PageListResponse<ControllerRecordModel> = {data: [], total: 0}
    const response = await request.get(`/controllers/records/${route.params.id}?page_number=${page}&page_size=${pageSize}`) as AxiosXHR<PageDataResponse<ControllerRecordModel>>;
    if (response.status == 200) {
        data.data = response.data.items
        data.total = response.data.total
    }
    return data;
}

onMounted(async () => {
    const data = await userStore.getUserByUid(route.params.id);
    if (data) {
        userData.value = data
    }
})

const addControllerRecordDialog = ref(false)
type AddControllerRecord = {
    type: number;
    content: string;
}
const formData = ref<AddControllerRecord>({
    type: 0,
    content: ''
})
const recordListCardRef: Ref<PageListCardInstance> = ref()

const submitCreateRecord = async () => {
    if (!userStore.permission.hasPermissionNode(PermissionNode.ControllerCreateRecord)) {
        showError("你无权这么做")
        return
    }
    const response = await request.post(`/controllers/records/${route.params.id}`, formData.value) as AxiosXHR<boolean>;
    if (response.status == 200 && response.data) {
        showSuccess("添加管制员履历成功")
        recordListCardRef.value?.flushData()
        formData.value.type = 0
        formData.value.content = ''
        addControllerRecordDialog.value = false
    }
}

const removeRecord = async (recordId: number) => {
    if (!userStore.permission.hasPermissionNode(PermissionNode.ControllerDeleteRecord)) {
        showError("你无权这么做")
        return
    }
    const response = await request.delete(`/controllers/records/${userData.value.id}/${recordId}`) as AxiosXHR<boolean>;
    if (response.status == 200 && response.data) {
        showSuccess("删除管制员履历成功")
        recordListCardRef.value?.flushData()
    }
}
</script>

<template>
    <PageListCard ref="recordListCardRef" :fetch-data="fetchControllerRecord" no-transform>
        <template #header>
            <el-space wrap>
                <el-button :icon="ArrowLeft" text @click="router.push(`/admin/controllers`)"/>
                <span>{{ padStart(userData.cid, 4, '0') }}的履历</span>
                <el-button :icon="Plus" type="success" @click="addControllerRecordDialog = true"
                           :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ControllerCreateRecord)">
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
                {{ padStart(scope.row.operator_cid, 4, '0') }}
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
                           :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ControllerDeleteRecord)">
                    删除
                </el-button>
            </template>
        </el-table-column>
    </PageListCard>
    <FormDialog v-model="addControllerRecordDialog" title="添加管制员履历" :width="600"
                @dialog-confirm-event="submitCreateRecord()">
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