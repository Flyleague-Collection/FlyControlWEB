<script setup lang="ts">
import {use, registerTheme} from "echarts/core";
import {BarChart} from "echarts/charts";
import {GridComponent, DatasetComponent, TitleComponent, TooltipComponent} from "echarts/components";
import {SVGRenderer} from 'echarts/renderers';
import VChart from 'vue-echarts';
import {ref} from 'vue';
import ActivityCalendar from "@/components/ActivityCalendar.vue";
import {useAuthStore} from "@/store/auth.js";

use([BarChart, TitleComponent, TooltipComponent, DatasetComponent, GridComponent, SVGRenderer]);

const authStore = useAuthStore();

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
            data: ['2352', '5516', '0926', '5740', '1111', '1546', '1547', '6854', '5233', '6105', '5363', '4654', '6982', '8926', '5666'],
            name: "联飞呼号"
        },
        yAxis: {
            type: 'value',
            name: "联飞时长/h"
        },
        series: [
            {
                data: [120, 200, 150, 80, 70, 234, 435, 546, 756, 78, 897, 123, 45, 456, 45],
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

</script>

<template>
    <div class="container">
        <el-card class="welcome">欢迎, {{ authStore.userData.username }}, 今天想飞哪里？</el-card>
        <el-row class="status-card" :gutter="20">
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <el-card class="card">
                    <div class="card-item">
                        <span class="card-item-title">注册用户总数</span>
                        <span class="card-item-content">1111</span>
                    </div>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <el-card class="card">
                    <div class="card-item">
                        <span class="card-item-title">管制团队</span>
                        <span class="card-item-content">111</span>
                    </div>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <el-card class="card">
                    <div class="card-item">
                        <span class="card-item-title">举办活动数</span>
                        <span class="card-item-content">11</span>
                    </div>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <el-card class="card">
                    <div class="card-item">
                        <span class="card-item-title">当前在线用户数</span>
                        <span class="card-item-content">1</span>
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