<script setup lang="ts">
import {EditPen} from "@element-plus/icons-vue";
import moment from "moment";
import {computed, onBeforeMount, Ref, ref} from "vue";

import ApiActivity from "@/api/activity.js";
import {useReactiveWidth} from "@/composables/useReactiveWidth.js";
import {ActivityPilotStatus, ActivityStatus} from "@/global.js";
import {useUserStore} from "@/store/user.js";
import {showError, showSuccess} from "@/utils/message.js";
import {PermissionNode} from "@/utils/permission.js";

const userStore = useUserStore();
const activities = ref<ActivityModel[]>([]);

const fetchActivities = async () => {
    const data = await ApiActivity.getActivities(moment().format('YYYY-MM'));
    if (data != null) {
        activities.value = data.filter(activity => activity.status != ActivityStatus.Finish);
    }
}

onBeforeMount(async () => {
    await fetchActivities();
})

const showDrawer = ref(false);
const targetActivity: Ref<Nullable<ActivityModel>> = ref(null);
let interval: Nullable<number> = null;
const hasEditPermission = computed(() => userStore.permission.hasPermissionNode(PermissionNode.ActivityEditPilotState))

const onDrawerOpen = () => {
    if (!hasEditPermission) {
        showError("你无权这么做");
        showDrawer.value = false;
        return;
    }
    if (interval != null) {
        clearInterval(interval);
        interval = null;
    }
    if (targetActivity.value == null) {
        showError("无效活动");
        return
    }
    interval = setInterval(async () => {
        await updateActivityInfo(targetActivity.value?.id);
    }, 10000);
}

const onDrawerClose = () => {
    if (interval != null) {
        clearInterval(interval);
        interval = null;
    }
}

const updateActivityInfo = async (activityId: number) => {
    const data = await ApiActivity.getActivityById(activityId);
    if (data != null) {
        targetActivity.value = data;
    }
}

const changePilotStatus = async (pilotId: number, status: ActivityPilotStatus) => {
    if (await ApiActivity.updatePilotStatus(targetActivity.value?.id, pilotId, status)) {
        showSuccess("登记状态成功");
        await updateActivityInfo(targetActivity.value?.id);
    }
}

const openEditPanel = async (activityId: number) => {
    await updateActivityInfo(activityId);
    showDrawer.value = true;
}

const {less1000px, less800px, less700px, less600px, less400px} = useReactiveWidth();
</script>

<template>
    <el-card class="no-transform">
        <template #header>
            活动登记
        </template>
        <el-table :data="activities" v-if="activities.length > 0">
            <el-table-column label="活动id" prop="id" v-if="!less1000px"/>
            <el-table-column label="发布者" prop="publisher" v-if="!less1000px"/>
            <el-table-column label="标题">
                <template #default="scope">
                    <el-space wrap>
                        <span>{{ scope.row.title }}</span>
                        <span v-if="less700px">
                            <el-tag type="primary" size="small"
                                    v-if="scope.row.status == ActivityStatus.Sign">报名中</el-tag>
                            <el-tag type="success" size="small" v-else>活动中</el-tag>
                        </span>
                        <el-button type="primary" :icon="EditPen" size="small"
                                   @click="openEditPanel(scope.row.id)"
                                   v-if="less600px"
                                   :disabled="scope.row.status != ActivityStatus.Active || !hasEditPermission">
                            活动登记
                        </el-button>
                    </el-space>
                </template>
            </el-table-column>
            <el-table-column label="活动时间" v-if="!less1000px">
                <template #default="scope">
                    {{ moment(scope.row.active_time).format('YYYY-MM-DD HH:mm:ss') }}
                </template>
            </el-table-column>
            <el-table-column label="活动状态" v-if="!less700px">
                <template #default="scope">
                    <el-tag type="primary" v-if="scope.row.status == ActivityStatus.Sign">报名中</el-tag>
                    <el-tag type="success" v-else>活动中</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" v-if="!less600px">
                <template #default="scope">
                    <el-button type="primary" :icon="EditPen"
                               @click="openEditPanel(scope.row.id)"
                               :disabled="scope.row.status != ActivityStatus.Active || !hasEditPermission">
                        活动登记
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-empty v-else description="暂时还没有进行中的活动~"/>
    </el-card>
    <el-drawer v-model="showDrawer" direction="rtl" draggable="true" title="登记活动信息"
               @open="onDrawerOpen()" @close="onDrawerClose()" :size="less800px ? '100%': '50%'">
        <el-table :data="targetActivity?.pilots" v-if="!less400px">
            <el-table-column label="呼号" prop="callsign"/>
            <el-table-column label="机型" prop="aircraft_type"/>
            <el-table-column label="状态">
                <template #default="scope">
                    <el-tag type="primary" effect="dark"
                            v-if="scope.row.status == ActivityPilotStatus.Sign">
                        已报名
                    </el-tag>
                    <el-tag type="success" effect="dark"
                            v-else-if="scope.row.status == ActivityPilotStatus.Delivery">
                        已放行
                    </el-tag>
                    <el-tag color="#b2c75e" effect="dark" class="border-none"
                            v-else-if="scope.row.status == ActivityPilotStatus.Takeoff">
                        已起飞
                    </el-tag>
                    <el-tag color="#c78636" effect="dark" class="border-none" v-else>
                        已落地
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button type="primary"
                               @click="changePilotStatus(scope.row.uid, ActivityPilotStatus.Delivery)"
                               v-if="scope.row.status == ActivityPilotStatus.Sign">
                        放行
                    </el-button>
                    <el-button type="success"
                               @click="changePilotStatus(scope.row.uid, ActivityPilotStatus.Takeoff)"
                               v-else-if="scope.row.status == ActivityPilotStatus.Delivery">
                        起飞
                    </el-button>
                    <el-button type="warning"
                               @click="changePilotStatus(scope.row.uid, ActivityPilotStatus.Land)"
                               v-else :disabled="scope.row.status == ActivityPilotStatus.Land">
                        落地
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-space v-else direction="vertical" fill class="w-full">
            <div v-for="item in targetActivity?.pilots" class="flex flex-direction-column pilot-card">
                <span class="margin-bottom-10">{{ item.callsign }} ({{ item.aircraft_type }})</span>
                <el-space>
                    <el-tag type="primary" effect="dark" size="small"
                            v-if="item.status == ActivityPilotStatus.Sign">
                        已报名
                    </el-tag>
                    <el-tag type="success" effect="dark" size="small"
                            v-else-if="item.status == ActivityPilotStatus.Delivery">
                        已放行
                    </el-tag>
                    <el-tag color="#b2c75e" effect="dark" class="border-none" size="small"
                            v-else-if="item.status == ActivityPilotStatus.Takeoff">
                        已起飞
                    </el-tag>
                    <el-tag color="#c78636" effect="dark" class="border-none" size="small" v-else>
                        已落地
                    </el-tag>
                    <el-button type="primary" size="small"
                               @click="changePilotStatus(item.uid, ActivityPilotStatus.Delivery)"
                               v-if="item.status == ActivityPilotStatus.Sign">
                        放行
                    </el-button>
                    <el-button type="success" size="small"
                               @click="changePilotStatus(item.uid, ActivityPilotStatus.Takeoff)"
                               v-else-if="item.status == ActivityPilotStatus.Delivery">
                        起飞
                    </el-button>
                    <el-button type="warning" size="small"
                               @click="changePilotStatus(item.uid, ActivityPilotStatus.Land)"
                               v-else :disabled="item.status == ActivityPilotStatus.Land">
                        落地
                    </el-button>
                </el-space>
            </div>
        </el-space>
    </el-drawer>
</template>

<style scoped>

.pilot-card {
    margin: 5px 0;
    border-radius: 15px;
    border: 1px solid #ddd;
    width: 100%;
    padding: 10px 5px;
}

</style>