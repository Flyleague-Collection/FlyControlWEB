<script setup lang="ts">
import {use, registerTheme} from "echarts/core";
import {BarChart} from "echarts/charts";
import {GridComponent, DatasetComponent, TitleComponent, TooltipComponent} from "echarts/components";
import {SVGRenderer} from 'echarts/renderers';
import VChart from 'vue-echarts';
import {onMounted, Ref, ref} from 'vue';
import ActivityCalendar from "@/components/ActivityCalendar.vue";
import {useUserStore} from "@/store/user.js";
import request from "@/utils/request.js";
import {formatCid, handleImageUrl} from "@/utils/utils.js";

use([BarChart, TitleComponent, TooltipComponent, DatasetComponent, GridComponent, SVGRenderer]);

const userStore = useUserStore();
const totalUser = ref(0);
const totalController = ref(0);
const totalActivity = ref(0);
const totalOnline = ref(0);
const pilotRatingData: Ref<ServerRatingModel> = ref([]);
const pilotRatingMax = ref(0);
const controllerRatingData: Ref<ServerRatingModel> = ref([]);
const controllerRatingMax = ref(0);

const getServerInfo = async () => {
    const response = (await request.get(`/server/info`)) as Axios.AxiosXHR<GetServerInfoResponse>
    if (response.status == 200) {
        totalUser.value = response.data.total_user
        totalController.value = response.data.total_controller
        totalActivity.value = response.data.total_activity
    }
}

const getServerOnline = async () => {
    const response = (await request.get(`/clients`)) as Axios.AxiosXHR<GetOnlineClientResponse>
    if (response.status == 200) {
        totalOnline.value = response.data.general.connected_clients
    }
}

const getServerRating = async () => {
    const response = (await request.get(`/server/rating`)) as Axios.AxiosXHR<GetServerRatingResponse>
    if (response.status == 200) {
        response.data.pilots.forEach(pilot => {
            pilot.avatar_url = handleImageUrl(pilot.avatar_url);
        })
        response.data.controllers.forEach(controller => {
            controller.avatar_url = handleImageUrl(controller.avatar_url);
        })
        pilotRatingMax.value = response.data.pilots[0].time
        pilotRatingData.value = response.data.pilots
        controllerRatingMax.value = response.data.controllers[0].time
        controllerRatingData.value = response.data.controllers
    }
}

onMounted(async () => {
    await getServerInfo()
    await getServerOnline()
    await getServerRating()
})
</script>

<template>
    <div class="container">
        <el-card class="welcome">欢迎, {{ userStore.userData.username }}, 今天想飞哪里？</el-card>
        <el-row class="status-card" :gutter="20">
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <el-card class="card">
                    <div class="card-item">
                        <span class="card-item-title">注册用户总数</span>
                        <span class="card-item-content">{{ totalUser }}</span>
                    </div>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <el-card class="card">
                    <div class="card-item">
                        <span class="card-item-title">管制团队</span>
                        <span class="card-item-content">{{ totalController }}</span>
                    </div>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <el-card class="card">
                    <div class="card-item">
                        <span class="card-item-title">举办活动数</span>
                        <span class="card-item-content">{{ totalActivity }}</span>
                    </div>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <el-card class="card">
                    <div class="card-item">
                        <span class="card-item-title">当前在线用户数</span>
                        <span class="card-item-content">{{ totalOnline }}</span>
                    </div>
                </el-card>
            </el-col>
        </el-row>
        <ActivityCalendar class="calendar"/>
        <el-row :gutter="20">
            <el-col :md="12">
                <el-card class="rating-card">
                    <template #header>
                        联飞时长排行榜
                    </template>
                    <el-card class="no-transform" v-for="item in pilotRatingData">
                        <div class="flex">
                            <div class="flex align-items-center">
                                <el-avatar size="large" v-if="item.avatar_url != ''" :src="item.avatar_url"></el-avatar>
                                <el-avatar size="large" v-else>{{ formatCid(item.cid) }}</el-avatar>
                            </div>
                            <div class="flex flex-direction-column w-full margin-left-10">
                                <span class="margin-bottom-10" style="font-size: 1.2rem">{{ formatCid(item.cid) }}</span>
                                <el-progress :percentage="item.time/pilotRatingMax * 100"
                                             :stroke-width="20">
                                    {{ (item.time / 3600.0).toFixed(2) }}h
                                </el-progress>
                            </div>
                        </div>
                    </el-card>
                </el-card>
            </el-col>
            <el-col :md="12">
                <el-card class="rating-card">
                    <template #header>
                        管制时长排行榜
                    </template>
                    <el-card class="no-transform" v-for="item in controllerRatingData">
                        <div class="flex">
                            <div class="flex">
                                <el-avatar size="large" v-if="item.avatar_url != ''" :src="item.avatar_url"></el-avatar>
                                <el-avatar size="large" v-else>{{ formatCid(item.cid) }}</el-avatar>
                            </div>
                            <div class="flex flex-direction-column w-full margin-left-10">
                                <span class="margin-bottom-10" style="font-size: 1.2rem">{{ formatCid(item.cid) }}</span>
                                <el-progress :percentage="item.time/controllerRatingMax * 100"
                                             :stroke-width="20">
                                    {{ (item.time / 3600.0).toFixed(2) }}h
                                </el-progress>
                            </div>
                        </div>
                    </el-card>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<style scoped>
@media (max-width: 560px) {
    .calendar {
        display: none;
    }
}

.chart {
    height: 500px;
}

.welcome,
.el-col,
.chart-card {
    border-radius: 20px;
}

.card {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
}

.card-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.card-item-title {
    font-size: 15px;
    font-weight: 200;
}

.card-item-content {
    font-size: 1.2rem;
    font-weight: bold;
}
</style>