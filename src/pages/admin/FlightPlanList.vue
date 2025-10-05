<script setup lang="ts">
import {Delete, Lock, Unlock} from "@element-plus/icons-vue";
import moment from "moment";
import {ref, Ref} from "vue";

import ApiFlightPlan from "@/api/flightplan.js";
import type {PageListCardInstance, PageListResponse} from "@/components/card/PageListCard.js";
import PageListCard from "@/components/card/PageListCard.vue";
import type {ConfirmDialogInstance} from "@/components/dialog/ConfirmDialog.js";
import ConfirmDialog from "@/components/dialog/ConfirmDialog.vue";
import {useReactiveWidth} from "@/composables/useReactiveWidth.js";
import {useUserStore} from "@/store/user.js";
import {showError, showSuccess} from "@/utils/message.js";
import {PermissionNode} from "@/utils/permission.js";
import {formatCid} from "@/utils/utils.js";

const userStore = useUserStore();

const getFlightPlans = async (page: number, pageSize: number): Promise<PageListResponse<FlightPlanModel>> => {
    const result: PageListResponse<FlightPlanModel> = {data: [], total: 0}
    const data = await ApiFlightPlan.getFlightPlans(page, pageSize);
    if (data != null) {
        result.data = data.items;
        result.total = data.total;
    }
    return result;
}

const flightPlanListRef: Ref<PageListCardInstance> = ref();

const lockFlightPlan = async (cid: number) => {
    if (!userStore.permission.hasPermissionNode(PermissionNode.FlightPlanChangeLock)) {
        showError("你无权这么做");
        return;
    }
    if (await ApiFlightPlan.lockFlightPlan(cid)) {
        showSuccess("锁定计划成功");
        flightPlanListRef.value?.flushData();
    }
}

const unlockFlightPlan = async (cid: number) => {
    if (!userStore.permission.hasPermissionNode(PermissionNode.FlightPlanChangeLock)) {
        showError("你无权这么做");
        return;
    }
    if (await ApiFlightPlan.unlockFlightPlan(cid)) {
        showSuccess("解锁计划成功");
        flightPlanListRef.value?.flushData();
    }
}

const targetCid = ref(0);
const confirmDeleteRef: Ref<ConfirmDialogInstance> = ref();

const confirmDeleteFlightPlan = async (cid: number) => {
    if (!userStore.permission.hasPermissionNode(PermissionNode.FlightPlanDelete)) {
        showError("你无权这么做");
        return;
    }
    targetCid.value = cid;
    confirmDeleteRef.value?.show();
}

const deleteFlightPlan = async () => {
    if (targetCid.value == 0) {
        showError("无效的目标CID");
        return;
    }
    if (await ApiFlightPlan.deleteFlightPlan(targetCid.value)) {
        showSuccess("删除计划成功");
        flightPlanListRef.value?.flushData();
    }
}

const {less1000px, less900px, less700px, less600px, less500px, less400px} = useReactiveWidth();
</script>

<template>
    <PageListCard ref="flightPlanListRef" :fetch-data="getFlightPlans" card-title="飞行计划管理" no-transform>
        <el-table-column type="expand">
            <template #default="scope">
                <el-descriptions :column="less700px ? 1 : 2" border :label-width="less400px ? 'auto' : 150">
                    <el-descriptions-item label="呼号">
                        {{ scope.row.callsign }}
                    </el-descriptions-item>
                    <el-descriptions-item label="飞行计划类型">
                        <span v-if="scope.row.flight_rules == 'I'">仪表飞行</span>
                        <span v-else-if="scope.row.flight_rules == 'V'">目视飞行</span>
                        <span v-else>未知</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="完整机型代码" :span="2">
                        {{ scope.row.aircraft }}
                    </el-descriptions-item>
                    <el-descriptions-item label="离场机场">
                        {{ scope.row.departure }}
                    </el-descriptions-item>
                    <el-descriptions-item label="到达机场">
                        {{ scope.row.arrival }}
                    </el-descriptions-item>
                    <el-descriptions-item label="备降机场">
                        {{ scope.row.alternate }}
                    </el-descriptions-item>
                    <el-descriptions-item label="预计离场时间">
                        {{ moment(scope.row.departure_time, "HH:mm").format("HH:mm") }}
                    </el-descriptions-item>
                    <el-descriptions-item label="飞行时间">
                        {{
                            moment(`${scope.row.route_time_hour}:${scope.row.route_time_minute}`, "HH:mm").format("HH:mm")
                        }}
                    </el-descriptions-item>
                    <el-descriptions-item label="滞空时间">
                        {{
                            moment(`${scope.row.fuel_time_hour}:${scope.row.fuel_time_minute}`, "HH:mm").format("HH:mm")
                        }}
                    </el-descriptions-item>
                    <el-descriptions-item label="计划巡航高度">
                        {{ scope.row.altitude }}
                    </el-descriptions-item>
                    <el-descriptions-item label="巡航真空速">
                        {{ scope.row.cruise_tas }} kts
                    </el-descriptions-item>
                    <el-descriptions-item label="飞行计划" :span="2">
                        <span v-if="scope.row.route == ''">无</span>
                        <span v-else>{{ scope.row.route }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="备注" :span="2">
                        <span v-if="scope.row.remarks == ''">无</span>
                        <span v-else>{{ scope.row.remarks }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="来自网页">
                        <el-tag type="success" v-if="scope.row.from_web">是</el-tag>
                        <el-tag type="danger" v-else>否</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="已锁定">
                        <el-tag type="success" v-if="scope.row.locked">是</el-tag>
                        <el-tag type="danger" v-else>否</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="操作" v-if="less500px">
                        <el-space wrap>
                            <el-button type="warning" :icon="Unlock" size="small" v-if="scope.row.locked"
                                       @click="unlockFlightPlan(scope.row.cid)"
                                       :disabled="!userStore.permission.hasPermissionNode(PermissionNode.FlightPlanChangeLock)">
                                解锁
                            </el-button>
                            <el-button type="warning" :icon="Lock" size="small" v-else
                                       @click="lockFlightPlan(scope.row.cid)"
                                       :disabled="!userStore.permission.hasPermissionNode(PermissionNode.FlightPlanChangeLock)">
                                锁定
                            </el-button>
                            <el-button type="danger" :icon="Delete" size="small"
                                       @click="confirmDeleteFlightPlan(scope.row.cid)"
                                       :disabled="!userStore.permission.hasPermissionNode(PermissionNode.FlightPlanDelete)">
                                删除
                            </el-button>
                        </el-space>
                    </el-descriptions-item>
                </el-descriptions>
            </template>
        </el-table-column>
        <el-table-column label="CID" v-if="!less700px">
            <template #default="scope">
                {{ formatCid(scope.row.cid) }}
            </template>
        </el-table-column>
        <el-table-column label="呼号" prop="callsign"/>
        <el-table-column label="机型" prop="aircraft" v-if="!less600px">
            <template #default="scope">
                {{ scope.row.aircraft.split('-')[0] }}
            </template>
        </el-table-column>
        <el-table-column label="离场机场" prop="departure" v-if="!less900px"/>
        <el-table-column label="到达机场" prop="arrival" v-if="!less900px"/>
        <el-table-column label="备降场" prop="alternate" v-if="!less1000px"/>
        <el-table-column label="已锁定" v-if="!less500px">
            <template #default="scope">
                <el-tag type="success" v-if="scope.row.locked">是</el-tag>
                <el-tag type="danger" v-else>否</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="操作" v-if="!less500px">
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