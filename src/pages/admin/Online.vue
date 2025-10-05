<script setup lang="ts">
import {FormInstance, FormRules} from "element-plus";
import moment from "moment";
import {onMounted, onUnmounted, Ref, ref} from "vue";

import ApiClient from "@/api/client.js";
import PageListCard from "@/components/card/PageListCard.vue";
import type {ConfirmDialogInstance} from "@/components/dialog/ConfirmDialog.js";
import ConfirmDialog from "@/components/dialog/ConfirmDialog.vue";
import type {FormDialogInstance} from "@/components/dialog/FormDialog.js";
import FormDialog from "@/components/dialog/FormDialog.vue";
import config from "@/config/index.js";
import {useServerConfigStore} from "@/store/server_config.js";
import {useUserStore} from "@/store/user.js";
import {showError, showSuccess} from "@/utils/message.js";
import {PermissionNode} from "@/utils/permission.js";
import {formatCid} from "@/utils/utils.js";


const userStore = useUserStore();
const serverConfigStore = useServerConfigStore();

const onlineControllers = ref<OnlineControllerModel[]>([]);
const onlinePilots = ref<OnlinePilotModel[]>([]);

const getOnlineData = async () => {
    const data = await ApiClient.getOnlineClient();
    if (data != null) {
        onlineControllers.value = data.controllers;
        onlinePilots.value = data.pilots;
    }
}

let interval: number;

onMounted(async () => {
    await getOnlineData();
    interval = setInterval(async () => {
        await getOnlineData();
    }, 15000)
})

onUnmounted(async () => {
    clearInterval(interval);
})

const sendMessageToClient = async (callsign: string, message: string): Promise<boolean> => {
    if (await ApiClient.sendMessageToClient(callsign, message)) {
        showSuccess("发送消息成功")
        return true;
    }
    return false;
}

const broadcastMessageToClient = async (target: string, message: string): Promise<boolean> => {
    if (await ApiClient.broadcastMessageToClient(target, message)) {
        showSuccess("广播消息成功")
        return true;
    }
    return false;
}

const kickedFromServer = async (callsign: string, reason: string): Promise<boolean> => {
    if (await ApiClient.kickClientFromServer(callsign, reason)) {
        showSuccess("踢出客户端成功")
        return true;
    }
    return false;
}

type SendMessage = {
    callsign: string;
    message: string;
}

const sendMessageFormDialogRef: Ref<FormDialogInstance> = ref();
const sendMessageFormRef: Ref<FormInstance> = ref();
const sendMessageFormData = ref<SendMessage>({
    callsign: "",
    message: ""
})
const sendMessageFormRules = ref<FormRules>({
    message: [
        {required: true, message: "消息不能为空", trigger: "blur"}
    ]
})

const sendMessage = (callsign: string) => {
    sendMessageFormData.value.callsign = callsign;
    sendMessageFormDialogRef.value?.show();
}

const submitSendMessageForm = async () => {
    if (!userStore.permission.hasPermissionNode(PermissionNode.ClientSendMessage)) {
        showError("你无权这么做");
        return;
    }
    try {
        await sendMessageFormRef.value?.validate();
    } catch {
        return;
    }
    if (await sendMessageToClient(sendMessageFormData.value.callsign, sendMessageFormData.value.message)) {
        sendMessageFormData.value = {
            callsign: "",
            message: ""
        }
        sendMessageFormDialogRef.value?.hide();
    }
}

type BroadcastMessage = {
    target: string;
    message: string;
}

const broadcastMessageFormDialogRef: Ref<FormDialogInstance> = ref();
const broadcastMessageFormRef: Ref<FormInstance> = ref();
const broadcastMessageFormData = ref<BroadcastMessage>({
    target: "",
    message: ""
})
const broadcastMessageFormRules = ref<FormRules>({
    message: [
        {required: true, message: "消息不能为空", trigger: "blur"}
    ]
})

const broadcastMessage = (target: string) => {
    broadcastMessageFormData.value.target = target;
    broadcastMessageFormDialogRef.value?.show();
}

const submitBroadcastMessageForm = async () => {
    if (!userStore.permission.hasPermissionNode(PermissionNode.ClientSendBroadcastMessage)) {
        showError("你无权这么做");
        return;
    }
    try {
        await broadcastMessageFormRef.value?.validate();
    } catch {
        return;
    }
    if (await broadcastMessageToClient(broadcastMessageFormData.value.target, broadcastMessageFormData.value.message)) {
        broadcastMessageFormData.value = {
            target: "",
            message: ""
        }
        broadcastMessageFormDialogRef.value?.hide();
    }
}

type KickerFromServer = {
    target: string;
    reason: string;
}

const kickFromServerFormDialogRef: Ref<FormDialogInstance> = ref();
const kickFromServerFormRef: Ref<FormInstance> = ref();
const confirmKickedFromServerRef: Ref<ConfirmDialogInstance> = ref();
const kickFromServerFormData = ref<KickerFromServer>({
    target: "",
    reason: ""
})
const kickFromServerFormRules = ref<FormRules>({
    reason: [
        {required: true, message: "踢出理由不能为空", trigger: "blur"}
    ]
})

const kickFromServer = (target: string) => {
    kickFromServerFormData.value.target = target;
    kickFromServerFormDialogRef.value?.show();
}

const confirmKick = () => {
    confirmKickedFromServerRef.value?.show();
}

const submitKickFromServerForm = async () => {
    if (!userStore.permission.hasPermissionNode(PermissionNode.ClientKill)) {
        showError("你无权这么做");
        return;
    }
    try {
        await kickFromServerFormRef.value?.validate();
    } catch {
        return;
    }
    if (await kickedFromServer(kickFromServerFormData.value.target, kickFromServerFormData.value.reason)) {
        kickFromServerFormData.value = {
            target: "",
            reason: ""
        }
        kickFromServerFormDialogRef.value?.hide();
    }
}
</script>

<template>
    <el-space wrap fill class="w-full" size="large">
        <PageListCard ref="onlinePilotsRef" v-model="onlinePilots" no-transform>
            <template #header>
                <el-space wrap>
                    <span>在线飞行员</span>
                    <el-button type="warning" @click="broadcastMessage('*P')"
                               :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ClientSendBroadcastMessage)">
                        飞行员广播
                    </el-button>
                </el-space>
            </template>
            <el-table-column label="呼号" prop="callsign"/>
            <el-table-column label="CID">
                <template #default="scope">
                    {{ formatCid(scope.row.cid) }}
                </template>
            </el-table-column>
            <el-table-column label="登录时间">
                <template #default="scope">
                    {{ moment(scope.row.logon_time).format("YYYY-MM-DD HH:mm:ss") }}
                </template>
            </el-table-column>
            <el-table-column label="地速">
                <template #default="scope">
                    {{ scope.row.ground_speed }} kt
                </template>
            </el-table-column>
            <el-table-column label="高度">
                <template #default="scope">
                    {{ scope.row.altitude }} ft
                </template>
            </el-table-column>
            <el-table-column label="应答机" prop="transponder"/>
            <el-table-column label="操作">
                <template #default="scope">
                    <el-space wrap>
                        <el-button type="primary" @click="sendMessage(scope.row.callsign)"
                                   :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ClientSendMessage)">
                            发送消息
                        </el-button>
                        <el-button type="danger" @click="kickFromServer(scope.row.callsign)"
                                   :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ClientKill)">
                            踢出服务器
                        </el-button>
                    </el-space>
                </template>
            </el-table-column>
        </PageListCard>
        <PageListCard ref="onlineControllersRef" v-model="onlineControllers" no-transform>
            <template #header>
                <el-space wrap>
                    <span>在线管制员</span>
                    <el-button type="warning" @click="broadcastMessage('*A')"
                               :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ClientSendBroadcastMessage)">
                        管制员广播
                    </el-button>
                    <el-button type="warning" @click="broadcastMessage('*S')"
                               :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ClientSendBroadcastMessage)">
                        SUP广播
                    </el-button>
                    <el-button type="warning" @click="broadcastMessage('*')"
                               :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ClientSendBroadcastMessage)">
                        客户端广播
                    </el-button>
                </el-space>
            </template>
            <el-table-column label="呼号" prop="callsign"/>
            <el-table-column label="CID">
                <template #default="scope">
                    {{ formatCid(scope.row.cid) }}
                </template>
            </el-table-column>
            <el-table-column label="登录时间">
                <template #default="scope">
                    {{ moment(scope.row.logon_time).format("YYYY-MM-DD HH:mm:ss") }}
                </template>
            </el-table-column>
            <el-table-column label="登录权限">
                <template #default="scope">
                    <el-tag class="border-none"
                            :color="config.ratings[scope.row.rating + 1].color"
                            effect="dark">
                        {{ config.ratings[scope.row.rating + 1].label }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="席位">
                <template #default="scope">
                    <el-tag class="border-none"
                            :color="config.facilities[scope.row.facility]"
                            effect="dark">
                        {{ serverConfigStore.facilities[scope.row.facility].short_name }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="频率">
                <template #default="scope">
                    {{ (scope.row.frequency / 1000).toFixed(3) }}
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template #default="scope">
                    <el-space wrap>
                        <el-button type="primary" @click="sendMessage(scope.row.callsign)"
                                   :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ClientSendMessage)">
                            发送消息
                        </el-button>
                        <el-button type="danger" @click="kickFromServer(scope.row.callsign)"
                                   :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ClientKill)">
                            踢出服务器
                        </el-button>
                    </el-space>
                </template>
            </el-table-column>
        </PageListCard>
    </el-space>
    <FormDialog ref="sendMessageFormDialogRef" :title="`向${sendMessageFormData.callsign}发送消息`" :width="350"
                @dialog-confirm-event="submitSendMessageForm()">
        <el-form ref="sendMessageFormRef" :model="sendMessageFormData" :rules="sendMessageFormRules">
            <el-form-item label="消息" prop="message">
                <el-input v-model="sendMessageFormData.message" type="textarea" :autosize="{minRows: 2, maxRows: 6}"/>
            </el-form-item>
        </el-form>
    </FormDialog>
    <FormDialog ref="broadcastMessageFormDialogRef" title="广播消息" :width="350"
                @dialog-confirm-event="submitBroadcastMessageForm()">
        <el-form ref="broadcastMessageFormRef" :model="broadcastMessageFormData" :rules="broadcastMessageFormRules">
            <el-form-item label="广播消息" prop="message">
                <el-input v-model="broadcastMessageFormData.message" type="textarea"
                          :autosize="{minRows: 2, maxRows: 6}"/>
            </el-form-item>
        </el-form>
    </FormDialog>
    <FormDialog ref="kickFromServerFormDialogRef" :title="`将${kickFromServerFormData.target}踢出服务器`" :width="350"
                @dialog-confirm-event="confirmKick()">
        <el-form ref="kickFromServerFormRef" :model="kickFromServerFormData" :rules="kickFromServerFormRules">
            <el-form-item label="踢出理由" prop="reason">
                <el-input v-model="kickFromServerFormData.reason" type="textarea"
                          :autosize="{minRows: 2, maxRows: 6}"/>
            </el-form-item>
        </el-form>
    </FormDialog>
    <ConfirmDialog ref="confirmKickedFromServerRef"
                   :body-content="`确认踢出${kickFromServerFormData.target}吗?`"
                   header-content="踢出客户端"
                   @confirm-event="submitKickFromServerForm()"/>
</template>

<style scoped>

</style>