<script setup lang="ts">
import {PageListCardInstance, PageListResponse} from "@/components/card/PageListCard.js";
import request from "@/utils/request.js";
import PageListCard from "@/components/card/PageListCard.vue";
import {Global} from "@/global.js";
import moment from "moment";
import {padStart} from "lodash-es";
import {Delete, Edit} from "@element-plus/icons-vue";
import {useUserStore} from "@/store/user.js";
import {PermissionNode} from "@/utils/permission.js";
import AxiosXHR = Axios.AxiosXHR;
import FormDialog from "@/components/dialog/FormDialog.vue";
import {ref, Ref} from "vue";
import {FormDialogInstance} from "@/components/dialog/FormDialog.js";
import {FormInstance, FormRules} from "element-plus";
import {showError, showSuccess} from "@/utils/message.js";
import ConfirmDialog from "@/components/dialog/ConfirmDialog.vue";
import {ConfirmDialogInstance} from "@/components/dialog/ConfirmDialog.js";
import {formatCid} from "@/utils/utils.js";

const userStore = useUserStore();

const getTickets = async (page: number, pageSize: number): PageListResponse<TicketModel> => {
    const res: PageListResponse<TicketModel> = {
        data: [],
        total: 0
    }
    const response = await request.get(`/tickets?page_number=${page}&page_size=${pageSize}`) as AxiosXHR<PageDataResponse<TicketModel>>;
    if (response.status == 200) {
        res.data = response.data.items;
        res.total = response.data.total;
    }
    return res;
}

const replyTicketFormDialogRef: Ref<FormDialogInstance> = ref()
const ticketDataListRef: Ref<PageListCardInstance> = ref()
const formData = ref<TicketModel>({
    creator: 0,
    type: 0,
    title: "",
    content: "",
    reply: ""
})
const formRule = ref<FormRules>({
    reply: [
        {required: true, message: "回复不能为空", trigger: "blur"},
        {min: 8, message: "回复内容不能少于8个字", trigger: "blur"}
    ]
})

const showReplyTicketFormDialog = (data: TicketModel) => {
    formData.value = data;
    replyTicketFormDialogRef.value?.show();
}

const replyTicketFormRef: Ref<FormInstance> = ref()

const submitReplyForm = async () => {
    if (!userStore.permission.hasPermissionNode(PermissionNode.TicketReply)) {
        showError("你无权这么做")
        return
    }
    try {
        await replyTicketFormRef.value.validate();
    } catch {
        showError("您填写的数据有误");
        return;
    }
    const response = await request.put(`/tickets/${formData.value.id}`, {reply: formData.value.reply}) as AxiosXHR<boolean>;
    if (response.status == 200 && response.data) {
        showSuccess("回复工单成功");
        formData.value = {
            creator: 0,
            type: 0,
            title: "",
            content: "",
            reply: ""
        }
        ticketDataListRef.value?.flushData();
        replyTicketFormDialogRef.value?.hide();
    }
}

const confirmDeleteDialogRef: Ref<ConfirmDialogInstance> = ref()
const targetTicketId = ref(0)

const confirmDeleteTicket = async (ticketId: number) => {
    targetTicketId.value = ticketId
    confirmDeleteDialogRef.value?.show();
}

const deleteTicket = async () => {
    if (!userStore.permission.hasPermissionNode(PermissionNode.TicketRemove)) {
        showError("你无权这么做")
        return
    }
    if (targetTicketId.value == 0) {
        return;
    }
    const response = await request.delete(`/tickets/${targetTicketId.value}`) as AxiosXHR<boolean>;
    if (response.status == 200 && response.data) {
        showSuccess("删除工单成功");
        ticketDataListRef.value?.flushData();
        targetTicketId.value = 0;
    }
}

</script>

<template>
    <PageListCard ref="ticketDataListRef" :fetch-data="getTickets" card-title="工单">
        <el-table-column type="expand">
            <template #default="scope">
                <el-descriptions :column="1" border>
                    <el-descriptions-item label="工单内容">
                        {{ scope.row.content }}
                    </el-descriptions-item>
                    <el-descriptions-item label="回复时间" v-if="scope.row.closer != 0">
                        {{ moment(scope.row.close_at).format('YYYY-MM-DD HH:mm:ss') }}
                    </el-descriptions-item>
                    <el-descriptions-item label="回复人" v-if="scope.row.closer != 0">
                        {{ formatCid(scope.row.closer) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="回复内容" v-if="scope.row.closer != 0">
                        {{ scope.row.reply }}
                    </el-descriptions-item>
                </el-descriptions>
            </template>
        </el-table-column>
        <el-table-column label="创建时间">
            <template #default="scope">
                {{ moment(scope.row.open_at).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
        </el-table-column>
        <el-table-column label="创建人">
            <template #default="scope">
                {{ formatCid(scope.row.user.cid) }}
            </template>
        </el-table-column>
        <el-table-column label="工单类型">
            <template #default="scope">
                <el-tag :type="Global.ticketTypes[scope.row.type].type">
                    {{ Global.ticketTypes[scope.row.type].label }}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column label="标题" prop="title"/>
        <el-table-column label="回复状态">
            <template #default="scope">
                <el-tag type="success" v-if="scope.row.closer != 0">已回复</el-tag>
                <el-tag type="danger" v-else>未回复</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="操作">
            <template #default="scope">
                <el-space wrap>
                    <el-button :icon="Edit" type="primary" v-if="scope.row.closer == 0"
                               @click="showReplyTicketFormDialog(scope.row)"
                               :disabled="!userStore.permission.hasPermissionNode(PermissionNode.TicketReply)">
                        回复
                    </el-button>
                    <el-button :icon="Delete" type="danger" @click="confirmDeleteTicket(scope.row.id)"
                               :disabled="!userStore.permission.hasPermissionNode(PermissionNode.TicketRemove)">
                        删除
                    </el-button>
                </el-space>
            </template>
        </el-table-column>
    </PageListCard>
    <FormDialog ref="replyTicketFormDialogRef" title="回复用户工单" :width="450"
                @dialog-confirm-event="submitReplyForm()">
        <el-form ref="replyTicketFormRef" :model="formData" :rules="formRule" label-position="left" label-width="auto">
            <el-form-item label="工单类型">
                <el-select v-model.number="formData.type" :options="Global.ticketTypes" disabled/>
            </el-form-item>
            <el-form-item label="创建人">
                <el-input v-model.number="formData.creator" disabled/>
            </el-form-item>
            <el-form-item label="工单标题">
                <el-input :placeholder="formData.title" disabled/>
            </el-form-item>
            <el-form-item label="工单内容">
                <el-input :placeholder="formData.content" type="textarea" disabled/>
            </el-form-item>
            <el-form-item label="回复内容" prop="reply">
                <el-input v-model="formData.reply" placeholder="请输入回复内容" type="textarea"
                          :autosize="{minRows: 2, maxRows: 6}"/>
            </el-form-item>
        </el-form>
    </FormDialog>
    <ConfirmDialog ref="confirmDeleteDialogRef" body-content="确认删除吗" header-content="删除工单"
                   @confirm-event="deleteTicket()"/>
</template>

<style scoped>

</style>