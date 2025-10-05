<script setup lang="ts">
import {FormInstance, FormRules} from "element-plus";
import {Plus} from "@element-plus/icons-vue";
import moment from "moment";
import {Ref, ref} from "vue";
import {refManualReset} from "@vueuse/core";

import ApiTicket from "@/api/ticket.js";
import type {PageListCardInstance, PageListResponse} from "@/components/card/PageListCard.js";
import PageListCard from "@/components/card/PageListCard.vue";
import type {FormDialogInstance} from "@/components/dialog/FormDialog.js";
import FormDialog from "@/components/dialog/FormDialog.vue";
import {Global} from "@/global.js";
import {showSuccess} from "@/utils/message.js";

const getTickets = async (page: number, pageSize: number): PageListResponse<TicketModel> => {
    const res: PageListResponse<TicketModel> = {
        data: [],
        total: 0
    }
    const data = await ApiTicket.getSelfTickets(page, pageSize);
    if (data != null) {
        res.data = data.items;
        res.total = data.total;
    }
    return res;
}

type NewTicketForm = {
    type: number;
    title: string;
    content: string;
}
const formData = ref<NewTicketForm>({
    type: 0,
    title: '',
    content: ''
});
const formRule = ref<FormRules<NewTicketForm>>({
    type: [
        {required: true, message: "类型不能为空", trigger: "blur"}
    ],
    title: [
        {required: true, message: "标题不能为空", trigger: "blur"},
        {min: 4, message: "标题不能小于4个字", trigger: "blur"}
    ],
    content: [
        {required: true, message: "工单内容不能为空", trigger: "blur"},
        {min: 8, message: "工单内容不能小于8个字", trigger: "blur"}
    ]
});
const newTicketFormDialogRef: Ref<FormDialogInstance> = ref();

const showNewTicketForm = () => {
    newTicketFormDialogRef.value?.show();
}

const newTicketFormRef: Ref<FormInstance> = ref();
const ticketListCardRef: Ref<PageListCardInstance> = ref();

const submitForm = async () => {
    try {
        await newTicketFormRef.value.validate();
    } catch {
        return;
    }
    const data = await ApiTicket.createTicket(formData.value.type, formData.value.title, formData.value.content);
    if (data) {
        showSuccess("创建工单成功");
        formData.value = {
            type: 0,
            title: '',
            content: ''
        }
        ticketListCardRef.value?.flushData();
        newTicketFormDialogRef.value?.hide();
    }
}
</script>

<template>
    <PageListCard ref="ticketListCardRef" :fetch-data="getTickets" no-transform>
        <template #header>
            <el-space wrap>
                <span>历史工单记录</span>
                <el-button type="success" :icon="Plus" @click="showNewTicketForm()">新建工单</el-button>
            </el-space>
        </template>
        <el-table-column type="expand">
            <template #default="scope">
                <el-descriptions :column="1" border>
                    <el-descriptions-item label="工单内容">
                        {{ scope.row.content }}
                    </el-descriptions-item>
                    <el-descriptions-item label="回复时间" v-if="scope.row.reply != ''">
                        {{ moment(scope.row.close_at).format('YYYY-MM-DD HH:mm:ss') }}
                    </el-descriptions-item>
                    <el-descriptions-item label="回复内容" v-if="scope.row.reply != ''">
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
                <el-tag type="success" v-if="scope.row.reply != ''">已回复</el-tag>
                <el-tag type="danger" v-else>未回复</el-tag>
            </template>
        </el-table-column>
    </PageListCard>
    <FormDialog ref="newTicketFormDialogRef" title="新建工单" :width="450" @dialog-confirm-event="submitForm()">
        <el-form ref="newTicketFormRef" :model="formData" :rules="formRule">
            <el-form-item label="工单类型" prop="type">
                <el-radio-group v-model.number="formData.type">
                    <el-radio-button v-for="item in Global.ticketTypes" :value="item.value" :label="item.label"/>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="工单标题" prop="title">
                <el-input v-model="formData.title" placeholder="请输入工单标题"/>
            </el-form-item>
            <el-form-item label="工单内容" prop="content">
                <el-input v-model="formData.content" placeholder="请输入工单内容" type="textarea"
                          :autosize="{minRows: 2, maxRows: 6}"/>
            </el-form-item>
        </el-form>
    </FormDialog>
</template>

<style scoped>

</style>