<script setup lang="ts">
import {use, registerTheme} from "echarts/core";
import {BarChart} from "echarts/charts";
import {GridComponent, DatasetComponent, TitleComponent, TooltipComponent} from "echarts/components";
import {SVGRenderer} from 'echarts/renderers';
import VChart from 'vue-echarts';
import {onMounted, ref} from 'vue';
import ActivityCalendar from "@/components/ActivityCalendar.vue";
import {useUserStore} from "@/store/user.js";
import request from "@/utils/request.js";

use([BarChart, TitleComponent, TooltipComponent, DatasetComponent, GridComponent, SVGRenderer]);

const userStore = useUserStore();
const totalUser = ref(0);
const totalController = ref(0);
const totalActivity = ref(0);
const totalOnline = ref(0);

const option = ref({
        title: {
            show: true,
            text: "联飞时长排行榜",
            textAlign: "left"
        },
        tooltip: {
            show: true,
            formatter: "{b}: {c}h"
        },
        xAxis: {
            type: 'category',
            data: [],
            name: "联飞呼号"
        },
        yAxis: {
            type: 'value',
            name: "联飞时长/h"
        },
        series: [
            {
                data: [],
                type: 'bar',
                name: "联飞时长/h",
                realtimeSort: true,
                label: {
                    show: true,
                    formatter: "{c}h",
                    position: "top"
                }
            }
        ]
    }
);

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
        option.value.xAxis.data = []
        option.value.series[0].data = []
        response.data.pilots.forEach(client => {
            option.value.xAxis.data.push(client.cid)
            option.value.series[0].data.push((client.time / 3600.0).toFixed(2))
        })
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
        <el-card class="chart-card">
            <v-chart class="chart" :option="option" autoresize/>
        </el-card>
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
    margin-bottom: 15px;
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