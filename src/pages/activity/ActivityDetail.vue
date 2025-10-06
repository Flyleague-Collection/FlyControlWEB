<script setup lang="ts">
import moment from "moment";
import type {Moment} from "moment";
import {useRoute, useRouter} from "vue-router";
import {computed, onMounted, Ref, ref} from "vue";
import type {FormInstance, FormRules, TabBarInstance, TabsPaneContext} from "element-plus";
import {ArrowLeft, Document, Promotion} from "@element-plus/icons-vue";

import ApiActivity from "@/api/activity.js";
import ActivityPilotCard from "@/components/card/ActivityPilotCard.vue";
import ActivityFacilityCard from "@/components/card/ActivityFacilityCard.vue";
import type {FormDialogInstance} from "@/components/dialog/FormDialog.js";
import FormDialog from "@/components/dialog/FormDialog.vue";
import {useReactiveWidth} from "@/composables/useReactiveWidth.js";
import config from "@/config/index.js";
import {useUserStore} from "@/store/user.js";
import {showSuccess} from "@/utils/message.js";
import {formatCid} from "@/utils/utils.js";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const signTimeout = ref(false);
const value = ref<Moment>();
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

const getActivityInfo = async () => {
    const data = await ApiActivity.getActivityById(Number(route.params.id));
    if (data == null) {
        return;
    }
    activity.value = data;
    value.value = moment(activity.value?.active_time);
    if (value.value.isBefore(moment())) {
        signTimeout.value = true;
    }
}

onMounted(async () => {
    await getActivityInfo();
})

const selectedValue = ref("pilot");
const activityTabs = ref<TabBarInstance>();

const clickControllerSignButton = () => {
    selectedValue.value = "controller";
    activityTabs.value?.$el?.scrollIntoView({behavior: "smooth"});
}

const pilotSignLoading = ref(false);
const pilotSignFormDialogRef: Ref<FormDialogInstance> = ref();
const pilotSignFormRef = ref<FormInstance>();
const pilotSignFormData = ref<PilotSignData>({
    callsign: "",
    aircraft_type: ""
});
const rules = ref<FormRules<PilotSignData>>({
    callsign: [{required: true, message: "请输入执飞呼号", trigger: "blur"}],
    aircraft_type: [{required: true, message: "请输入执飞机型", trigger: "blur"}]
});

const submitPilotSign = async () => {
    pilotSignLoading.value = true;
    try {
        await pilotSignFormRef.value?.validate();
    } catch {
        pilotSignLoading.value = false;
        return;
    }
    if (await ApiActivity.pilotSign(activity.value.id, pilotSignFormData.value.callsign, pilotSignFormData.value.aircraft_type)) {
        showSuccess("报名成功, 祝联飞顺利");
        await getActivityInfo();
    }
    pilotSignLoading.value = false;
}

const submitControllerSign = async (facilityId: number) => {
    if (await ApiActivity.controllerSign(activity.value.id, facilityId)) {
        showSuccess("报名成功, 请及时参加管制协调会");
        await getActivityInfo();
    }
}

const currentPilot: Ref<ActivityPilotModel> = ref();
const currentFacility: Ref<ActivityFacilityModel> = ref();
const activitySignedCallsign = ref("");
const alreadySignedPilot = computed(() => {
    const pilot = activity.value.pilots.find((element: ActivityPilotModel) => element.uid == userStore.userData.id)
    if (pilot) {
        currentPilot.value = pilot;
        activitySignedCallsign.value = pilot.callsign;
        return true;
    }
    return false;
})
const alreadySignedController = computed(() => {
    const facility = activity.value.facilities.find((element: ActivityFacilityModel) => element.controller?.uid == userStore.userData.id)
    if (facility) {
        currentFacility.value = facility;
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
        if (await ApiActivity.pilotUnsign(activity.value.id)) {
            showSuccess("取消报名成功, 下次活动再见");
        }
    }
    if (alreadySignedController.value) {
        if (facilityId == 0) {
            facilityId = currentFacility.value.id;
        }
        if (await ApiActivity.controllerUnsign(activity.value.id, facilityId)) {
            showSuccess("取消报名成功, 下次活动再见");
        }
    }
    await getActivityInfo();
}

const toFlightPlanPage = () => {
    router.push({
        name: "FlightPlan",
        query: {
            activity_plan: encodeURI(`(${activity.value.departure_airport}-${activity.value.arrival_airport}-${activity.value.route}-${activitySignedCallsign.value}-${currentPilot.value.aircraft_type})`)
        }
    })
}

const {less900px} = useReactiveWidth();
</script>

<template>
    <div class="outside-layout">
        <div class="flex align-items-center">
            <el-button :icon="ArrowLeft" text @click="router.push('/activities')"/>
            <span class="activity-title">{{ activity?.title }}</span>
        </div>
        <img :src="activity?.image_url" alt="活动图片" class="activity-img" v-if="less900px"/>
        <div class="activity-content">
            <el-splitter>
                <el-splitter-panel size="60%" v-if="!less900px">
                    <img :src="activity?.image_url" alt="活动图片" class="activity-img"/>
                </el-splitter-panel>
                <el-splitter-panel>
                    <el-descriptions :column="1" border class="activity-descriptions">
                        <template #title>
                            <div style="display: flex;align-items: center">
                                <el-icon>
                                    <Document/>
                                </el-icon>
                                <span>活动简报</span>
                            </div>
                        </template>
                        <el-descriptions-item label="活动时间">
                            {{ moment(activity?.active_time).format("YYYY-MM-DD HH:mm:ss") }}
                        </el-descriptions-item>
                        <el-descriptions-item label="起飞机场">
                            {{ activity?.departure_airport }}
                        </el-descriptions-item>
                        <el-descriptions-item label="到达机场">
                            {{ activity?.arrival_airport }}
                        </el-descriptions-item>
                        <el-descriptions-item label="发布人">
                            {{ formatCid(activity?.publisher) }}
                        </el-descriptions-item>
                        <el-descriptions-item label="航路">
                            {{ activity?.route }}
                            <el-button :icon="Promotion" :text="true" @click="toFlightPlanPage()"
                                       v-if="alreadySignedPilot"/>
                        </el-descriptions-item>
                        <el-descriptions-item label="飞行距离">
                            {{ activity?.distance }}
                        </el-descriptions-item>
                        <el-descriptions-item label="NOTAMS">
                            {{ activity?.NOTAMS }}
                        </el-descriptions-item>
                        <el-descriptions-item label="报名信息" v-if="alreadySigned">
                            <el-space wrap
                                      class="flex flex-direction-column align-items-center display-over-450px"
                                      v-if="alreadySignedPilot">
                                <el-tag effect="dark" class="margin-bottom-5" type="success">
                                    你已报名作为机组, 呼号: {{ activitySignedCallsign }}
                                </el-tag>
                                <el-tag effect="dark">祝联飞顺利</el-tag>
                            </el-space>
                            <el-space class="flex flex-direction-column align-items-center display-over-450px" v-else>
                                <el-tag effect="dark" class="margin-bottom-5" type="success">
                                    你已报名作为管制, 席位: {{ activitySignedCallsign }}
                                </el-tag>
                                <el-tag effect="dark">请及时参与管制协调会, 祝管制顺利</el-tag>
                            </el-space>
                            <el-space
                                class="display-none display-flex-below-450px flex-direction-column align-items-center"
                                v-if="alreadySignedPilot">
                                <el-tag effect="dark" class="margin-bottom-5" type="success">你已报名作为机组</el-tag>
                                <el-tag effect="dark" class="margin-bottom-5">
                                    呼号: {{ activitySignedCallsign }}
                                </el-tag>
                                <el-tag effect="dark">祝联飞顺利</el-tag>
                            </el-space>
                            <el-space
                                class="display-none display-flex-below-450px flex-direction-column align-items-center"
                                v-else>
                                <el-tag effect="dark" class="margin-bottom-5" type="success">你已报名作为管制</el-tag>
                                <el-tag effect="dark" class="margin-bottom-5">
                                    席位: {{ activitySignedCallsign }}
                                </el-tag>
                                <el-tag effect="dark" class="margin-bottom-5">请及时参与管制协调会</el-tag>
                                <el-tag effect="dark">祝管制顺利</el-tag>
                            </el-space>
                        </el-descriptions-item>
                        <el-descriptions-item label="立刻报名" v-if="!signTimeout">
                            <el-space wrap v-if="!alreadySigned">
                                <el-button type="primary" @click="pilotSignFormDialogRef?.show()"
                                           :disabled="alreadySigned">
                                    飞行员报名
                                </el-button>
                                <el-button type="primary" @click="clickControllerSignButton()"
                                           :disabled="alreadySigned">
                                    管制员报名
                                </el-button>
                            </el-space>
                            <div class="join-activity" v-else>
                                <el-button type="danger" @click="cancelSign()">取消报名</el-button>
                            </div>
                        </el-descriptions-item>
                    </el-descriptions>
                </el-splitter-panel>
            </el-splitter>
        </div>
        <el-row :gutter="10">
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <el-card class="card">
                    <div class="card-item">
                        <span class="card-item-title">飞行员报名数</span>
                        <el-statistic class="card-item-content" :value="activity.pilots?.length"/>
                    </div>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <el-card class="card">
                    <div class="card-item">
                        <span class="card-item-title">管制员报名数</span>
                        <el-statistic class="card-item-content" :value="activity.controllers?.length"/>
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
                <el-card class="card" :class="config.activity_status[activity?.status].class">
                    <div class="card-item">
                        <span class="card-item-title margin-bottom-10">活动状态</span>
                        <span class="card-item-content">
                            {{ config.activity_status[activity?.status].label }}
                        </span>
                    </div>
                </el-card>
            </el-col>
        </el-row>
        <el-tabs class="demo-tabs" :model-value="selectedValue" type="border-card" ref="activityTabs"
                 @tab-click="(e: TabsPaneContext) => selectedValue = e.paneName as string">
            <el-tab-pane label="飞行员" name="pilot">
                <el-row :gutter="15">
                    <el-col v-for="pilot in activity?.pilots" :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
                        <ActivityPilotCard :data="pilot"/>
                    </el-col>
                </el-row>
            </el-tab-pane>
            <el-tab-pane label="管制员" name="controller">
                <el-row :gutter="15" v-if="activity && activity.facilities">
                    <el-col v-for="facility in activity?.facilities"
                            :xs="24" :sm="24" :md="12" :lg="8" :xl="6">
                        <ActivityFacilityCard :data="facility" :already-signed="alreadySigned"
                                              :sign-time-out="signTimeout"
                                              @controller-sign-event="submitControllerSign"
                                              @controller-unsign-event="cancelSign"/>
                    </el-col>
                </el-row>
            </el-tab-pane>
        </el-tabs>
    </div>
    <FormDialog ref="pilotSignFormDialogRef" title="飞行员报名" @dialog-confirm-event="submitPilotSign()"
                :loading="pilotSignLoading">
        <el-form :model="pilotSignFormData" :rules="rules" label-width="80px" ref="pilotSignFormRef">
            <el-form-item class="flex flex-direction-column" prop="callsign"
                          label-width="100px" label-position="left" label="执飞呼号:">
                <el-input v-model="pilotSignFormData.callsign" placeholder="请输入活动执飞呼号"/>
            </el-form-item>
            <el-form-item class="flex flex-direction-column" prop="aircraft_type"
                          label-width="100px" label-position="left" label="执飞机型:">
                <el-input v-model="pilotSignFormData.aircraft_type" placeholder="请输入活动执飞机型"/>
            </el-form-item>
        </el-form>
    </FormDialog>
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
            padding: 5px;
            width: 100%;
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