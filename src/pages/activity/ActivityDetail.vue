<script setup lang="ts">
import {useActivityStore} from "@/store/activity.js";
import {useRoute} from "vue-router";
import {computed, onMounted, onUnmounted, Ref, ref} from "vue";
import moment from "moment";
import type {Moment} from "moment";
import {Document} from "@element-plus/icons-vue";
import config from "@/config/index.js";
import ActivityPilotCard from "@/components/card/ActivityPilotCard.vue";
import ActivityFacilityCard from "@/components/card/ActivityFacilityCard.vue";
import type {TabBarInstance, TabsPaneContext} from "element-plus";
import ActivityPilotSignDialog from "@/components/dialog/ActivityPilotSignDialog.vue";
import {useUserStore} from "@/store/user.js";
import {showError, showSuccess} from "@/utils/message.js";

const route = useRoute();
const activityStore = useActivityStore();
const userStore = useUserStore();
const activity: Ref<ActivityModel> = ref({
    id: 0,
    publisher: 0,
    title: "",
    image_url: "",
    active_time: "",
    departure_airport: "",
    arrival_airport: "",
    route: "",
    distance: 0,
    status: 1,
    NOTAMS: "",
    pilots: [],
    controllers: [],
    facilities: []
});

const signTimeout = ref(false)

const value = ref<Moment>()

const getActivityInfo = async () => {
    const data = await activityStore.getActivityById(Number(route.params.id))
    if (data == null) {
        showError("获取活动信息失败")
        return
    }
    activity.value = data
    for (const controller of data.controllers) {
        for (const facility of data.facilities) {
            if (facility.controller) {
                continue
            }
            if (facility.id == controller.facility_id) {
                facility.controller = controller
                break
            }
        }
    }
    value.value = moment(activity.value?.active_time)
    if (value.value.isBefore(moment())) {
        signTimeout.value = true
    }
}

onMounted(async () => {
    await getActivityInfo();
})

const selectedValue = ref("pilot")
const activityTabs = ref<TabBarInstance>()

const controllerSignButton = () => {
    selectedValue.value = 'controller';
    activityTabs.value?.$el?.scrollIntoView({behavior: "smooth"});
}

const showPilotSignDialog = ref(false);

const submitPilotSign = async (data: ActivityPilotSignForm) => {
    if (await activityStore.pilotSign(activity.value.id, data)) {
        showSuccess("报名成功, 祝联飞顺利")
        await getActivityInfo()
    }
}

const submitControllerSign = async (facilityId: number) => {
    if (await activityStore.controllerSign(activity.value.id, facilityId)) {
        showSuccess("报名成功, 请及时参加管制协调会")
        await getActivityInfo()
    }
}

const activitySignedCallsign = ref("")

const alreadySignedPilot = computed(() => {
    // @ts-ignore
    const pilot = activity.value?.pilots?.find((element: ActivityPilotModel) => element.cid == userStore.userData.cid) as ActivityPilotModel
    if (pilot) {
        activitySignedCallsign.value = pilot.callsign;
        return true;
    }
    return false;
})

const alreadySignedController = computed(() => {
    // @ts-ignore
    const facility = activity.value?.facilities?.find((element: ActivityFacilityModel) => element.controller?.cid == userStore.userData.cid) as ActivityFacilityModel
    if (facility) {
        activitySignedCallsign.value = facility.callsign;
        return true;
    }
    return false;
})

const alreadySigned = computed(() => alreadySignedPilot.value || alreadySignedController.value)

const cancelSign = async (facilityId: number = 0) => {
    if (!alreadySigned.value) {
        return
    }
    if (alreadySignedPilot.value) {
        if (await activityStore.pilotUnsign(activity.value.id)) {
            showSuccess("取消报名成功, 下次活动再见")
        }
    }
    if (alreadySignedController.value) {
        if (facilityId == 0) {
            const facility = activity.value.facilities?.find((element: ActivityFacilityModel) => element.controller?.cid == userStore.userData.cid) as ActivityFacilityModel
            facilityId = facility.id
        }
        if (await activityStore.controllerUnsign(activity.value.id, facilityId)) {
            showSuccess("取消报名成功, 下次活动再见")
        }
    }
    await getActivityInfo()
}
</script>

<template>
    <ActivityPilotSignDialog v-model="showPilotSignDialog" @dialog-confirm-event="submitPilotSign"/>
    <div class="outside-layout">
        <span class="activity-title">{{ activity?.title }}</span>
        <div class="activity-content">
            <img :src="activity?.image_url" alt="活动图片" class="activity-img"/>
            <el-descriptions :column="1" border class="activity-descriptions">
                <template #title>
                    <div style="display: flex;align-items: center">
                        <el-icon>
                            <Document/>
                        </el-icon>
                        <span>活动简报</span>
                    </div>
                </template>
                <el-descriptions-item>
                    <template #label>
                        活动时间
                    </template>
                    {{ moment(activity?.active_time).format("YYYY-MM-DD HH:mm:ss") }}
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        起飞机场
                    </template>
                    {{ activity?.departure_airport }}
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        到达机场
                    </template>
                    {{ activity?.arrival_airport }}
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        发布人
                    </template>
                    {{ activity?.publisher }}
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        航路
                    </template>
                    {{ activity?.route }}
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        飞行距离
                    </template>
                    {{ activity?.distance }}
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        NOTAMS
                    </template>
                    {{ activity?.NOTAMS }}
                </el-descriptions-item>
                <el-descriptions-item v-if="alreadySigned">
                    <template #label>
                        报名信息
                    </template>
                    <div class="flex flex-direction-column align-items-center display-over-450px"
                         v-if="alreadySignedPilot">
                        <el-tag effect="dark" class="margin-bottom-5" type="success">你已报名作为机组, 呼号:
                            {{ activitySignedCallsign }}
                        </el-tag>
                        <el-tag effect="dark">祝联飞顺利</el-tag>
                    </div>
                    <div class="flex flex-direction-column align-items-center display-over-450px" v-else>
                        <el-tag effect="dark" class="margin-bottom-5" type="success">你已报名作为管制, 席位:
                            {{ activitySignedCallsign }}
                        </el-tag>
                        <el-tag effect="dark">请及时参与管制协调会, 祝管制顺利</el-tag>
                    </div>
                    <div
                        class="display-none display-flex-below-450px flex-direction-column align-items-center"
                        v-if="alreadySignedPilot">
                        <el-tag effect="dark" class="margin-bottom-5" type="success">你已报名作为机组</el-tag>
                        <el-tag effect="dark" class="margin-bottom-5">呼号: {{ activitySignedCallsign }}</el-tag>
                        <el-tag effect="dark">祝联飞顺利</el-tag>
                    </div>
                    <div
                        class="display-none display-flex-below-450px flex-direction-column align-items-center"
                        v-else>
                        <el-tag effect="dark" class="margin-bottom-5" type="success">你已报名作为管制</el-tag>
                        <el-tag effect="dark" class="margin-bottom-5">席位: {{ activitySignedCallsign }}</el-tag>
                        <el-tag effect="dark" class="margin-bottom-5">请及时参与管制协调会</el-tag>
                        <el-tag effect="dark">祝管制顺利</el-tag>
                    </div>
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        立刻报名
                    </template>
                    <div class="join-activity" v-if="!alreadySigned">
                        <el-button type="primary" @click="showPilotSignDialog = true" :disabled="alreadySigned">
                            飞行员报名
                        </el-button>
                        <el-button type="primary" @click="controllerSignButton" :disabled="alreadySigned">
                            管制员报名
                        </el-button>
                    </div>
                    <div class="join-activity" v-else>
                        <el-button type="danger" @click="_ => cancelSign()">取消报名</el-button>
                    </div>
                </el-descriptions-item>
            </el-descriptions>
        </div>
        <el-row :gutter="10" class="activity-status">
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <el-card class="card">
                    <div class="card-item">
                        <span class="card-item-title">飞行员报名数</span>
                        <el-statistic class="card-item-content" :value="activity.pilots?.length"></el-statistic>
                    </div>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <el-card class="card">
                    <div class="card-item">
                        <span class="card-item-title">管制员报名数</span>
                        <el-statistic class="card-item-content" :value="activity.controllers?.length"></el-statistic>
                    </div>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <el-card class="card"
                         :class="{'activity-signing': !signTimeout, 'activity-signed': signTimeout}">
                    <div class="card-item">
                        <span class="card-item-title">报名剩余时间</span>
                        <el-countdown class="card-item-content" :value="value" format="HH:mm:ss"/>
                    </div>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <el-card class="card" :class="config.activity_status[activity?.status - 1].class">
                    <div class="card-item">
                        <span class="card-item-title margin-bottom-10">活动状态</span>
                        <span class="card-item-content">
                            {{ config.activity_status[activity?.status - 1].label }}
                        </span>
                    </div>
                </el-card>
            </el-col>
        </el-row>
        <el-tabs class="demo-tabs" :model-value="selectedValue" type="border-card" ref="activityTabs"
                 @tab-click="(e: TabsPaneContext) => selectedValue=e.paneName as string">
            <el-tab-pane label="飞行员" name="pilot">
                <el-row :gutter="15">
                    <el-col v-for="pilot in activity?.pilots" :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
                        <ActivityPilotCard :pilot="pilot"/>
                    </el-col>
                </el-row>
            </el-tab-pane>
            <el-tab-pane label="管制员" name="controller">
                <el-row :gutter="15" v-if="activity && activity.facilities">
                    <el-col v-for="facility in activity?.facilities"
                            :xs="24" :sm="24" :md="12" :lg="8" :xl="6">
                        <ActivityFacilityCard :facility="facility" :already-signed="alreadySigned"
                                              @controller-sign-event="submitControllerSign"
                                              @controller-unsign-event="cancelSign"/>
                    </el-col>
                </el-row>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<style lang="scss" scoped>
.el-tab-pane {
    padding-top: 10px;
}

.activity-status-sign,
.activity-status-under,
.activity-status-end {
    font-size: var(--el-font-size-base) !important;
    font-weight: var(--el-button-font-weight) !important;
    background-color: var(--bg-color);
    color: var(--text-color);
    border-radius: 10px;
    height: 87px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    line-height: 1;
}

.outside-layout {
    display: flex;
    flex-flow: column;

    .activity-title {
        font-size: 1.8rem;
        font-weight: bold;
    }

    .activity-content {
        display: flex;
        margin: 5px 0;

        .activity-img {
            margin: 0 5px;
            width: 70%;
            border-radius: 20px;
        }

        .activity-descriptions {
            margin: 0 5px;
        }
    }

    .card {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 10px;
        border-radius: 20px;
    }

    .card-item {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .card-item-title {
        font-size: 15px;
        font-weight: 200;
    }

    .card-item-content {
        font-size: 1.2rem;
        font-weight: bold;
    }

    .join-activity {
        display: flex;
        align-items: center;
        justify-content: center;
    }
}

@media (max-width: 1250px) {
    .outside-layout {
        .activity-img {
            width: 100% !important;
            margin-bottom: 10px !important;
        }

        .activity-content {
            flex-direction: column;
        }

        .join-activity {
            flex-direction: row;

            * {
                margin: 0 5px;
            }
        }
    }
}

@media (max-width: 450px) {
    .outside-layout {
        .join-activity {
            flex-direction: column;

            * {
                margin: 5px 0;
            }
        }
    }
}
</style>