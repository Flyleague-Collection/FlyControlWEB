<script setup lang="ts">
import request from "@/api/request.js";
import AxiosXHR = Axios.AxiosXHR;
import type {PageListCardInstance, PageListResponse} from "@/components/card/PageListCard.js";
import PageListCard from "@/components/card/PageListCard.vue";
import {formatCid} from "@/utils/utils.js";
import {Delete, Lock, Unlock} from "@element-plus/icons-vue";
import {PermissionNode} from "@/utils/permission.js";
import {showError, showSuccess} from "@/utils/message.js";
import {useUserStore} from "@/store/user.js";
import {ref, Ref} from "vue";
import ConfirmDialog from "@/components/dialog/ConfirmDialog.vue";
import {ConfirmDialogInstance} from "@/components/dialog/ConfirmDialog.js";

const userStore = useUserStore();

const getFlightPlans = async (page: number, pageSize: number): Promise<PageListResponse<FlightPlanModel>> => {
    const result: PageListResponse<FlightPlanModel> = {data: [], total: 0}
    const response = await request.get(`/plans?page_number=${page}&page_size=${pageSize}`) as AxiosXHR<PageDataResponse<FlightPlanModel>>
    if (response.status == 200) {
        result.data = response.data.items
        result.total = response.data.total
    }
    return result;
}

const flightPlanListRef: Ref<PageListCardInstance> = ref()

const lockFlightPlan = async (cid: number) => {
    if (!userStore.permission.hasPermissionNode(PermissionNode.FlightPlanChangeLock)) {
        showError("你无权这么做")
        return
    }
    const response = await request.put(`/plans/${cid}/lock`) as AxiosXHR<boolean>;
    if (response.status == 200 && response.data) {
        showSuccess("锁定计划成功");
        flightPlanListRef.value?.flushData();
    }
}

const unlockFlightPlan = async (cid: number) => {
    if (!userStore.permission.hasPermissionNode(PermissionNode.FlightPlanChangeLock)) {
        showError("你无权这么做")
        return
    }
    const response = await request.delete(`/plans/${cid}/lock`) as AxiosXHR<boolean>;
    if (response.status == 200 && response.data) {
        showSuccess("解锁计划成功");
        flightPlanListRef.value?.flushData();
    }
}

const targetCid = ref(0)
const confirmDeleteRef: Ref<ConfirmDialogInstance> = ref()

const confirmDeleteFlightPlan = async (cid: number) => {
    if (!userStore.permission.hasPermissionNode(PermissionNode.FlightPlanDelete)) {
        showError("你无权这么做")
        return
    }
    targetCid.value = cid;
    confirmDeleteRef.value?.show();
}

const deleteFlightPlan = async () => {
    if (targetCid.value == 0) {
        showError("无效的目标CID");
        return;
    }
    const response = await request.delete(`/plans/${targetCid.value}`) as AxiosXHR<boolean>;
    if (response.status == 200 && response.data) {
        showSuccess("删除计划成功");
        flightPlanListRef.value?.flushData();
    }
}
</script>

<template>
    <PageListCard ref="flightPlanListRef" :fetch-data="getFlightPlans" card-title="飞行计划管理" no-transform>
        <el-table-column label="CID">
            <template #default="scope">
                {{ formatCid(scope.row.cid) }}
            </template>
        </el-table-column>
        <el-table-column label="呼号" prop="callsign"/>
        <el-table-column label="机型" prop="aircraft">
            <template #default="scope">
                {{ scope.row.aircraft.split('-')[0] }}
            </template>
        </el-table-column>
        <el-table-column label="离场机场" prop="departure"/>
        <el-table-column label="到达机场" prop="arrival"/>
        <el-table-column label="备降场" prop="alternate"/>
        <el-table-column label="已锁定">
            <template #default="scope">
                <el-tag type="success" v-if="scope.row.locked">是</el-tag>
                <el-tag type="danger" v-else>否</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="操作">
            <template #default="scope">
                <el-space wrap>
                    <el-button type="warning" :icon="Unlock" v-if="scope.row.locked"
                               @click="unlockFlightPlan(scope.row.cid)"
                               :disabled="!userStore.permission.hasPermissionNode(PermissionNode.FlightPlanChangeLock)">
                        解锁
                    </el-button>
                    <el-button type="warning" :icon="Lock" v-else
                               @click="lockFlightPlan(scope.row.cid)"
                               :disabled="!userStore.permission.hasPermissionNode(PermissionNode.FlightPlanChangeLock)">
                        锁定
                    </el-button>
                    <el-button type="danger" :icon="Delete"
                               @click="confirmDeleteFlightPlan(scope.row.cid)"
                               :disabled="!userStore.permission.hasPermissionNode(PermissionNode.FlightPlanDelete)">
                        删除
                    </el-button>
                </el-space>
            </template>
        </el-table-column>
    </PageListCard>
    <ConfirmDialog ref="confirmDeleteRef" body-content="你确定要删除这份计划吗？" header-content="确认删除?"
                   @confirm-event="deleteFlightPlan()"/>
</template>

<style scoped>

</style>