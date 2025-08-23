<script setup lang="ts">
import {ArrowLeft, ArrowRight, Calendar} from "@element-plus/icons-vue";
import {use, registerTheme} from "echarts/core";
import {BarChart} from "echarts/charts";
import {GridComponent, DatasetComponent, TooltipComponent} from "echarts/components";
import {SVGRenderer} from 'echarts/renderers';
import VChart from 'vue-echarts';
import {ref} from 'vue';

use([BarChart, TooltipComponent, DatasetComponent, GridComponent, SVGRenderer]);

const value = ref(new Date())

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

type Activity = {
    "time": string,
    "title": string
}

const activities = ref(new Map<string, Activity>([
    ["2025-08-21", {"time": "11:30", "title": "测试活动"}]
]))
</script>

<template>
    <div class="container">
        <el-card class="welcome">欢迎, Half_nothing, 今天想飞哪里？</el-card>
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
        <el-card class="calendar">
            <el-calendar v-model="value">
                <template #header="{ date }">
                    <div class="calendar-header">
                        <el-icon>
                            <Calendar/>
                        </el-icon>
                        <span>联飞活动</span>
                    </div>
                    <div>
                        <el-button :icon="ArrowLeft"></el-button>
                        <el-button>{{ date }}</el-button>
                        <el-button :icon="ArrowRight"></el-button>
                        <el-button>今天</el-button>
                    </div>
                </template>
                <template #date-cell="{ data }">
                    {{ data.day.split("-")[2] }}
                    <div v-if="activities.get(data.day) != null" class="activity">
                        <span>{{ activities.get(data.day)?.time }}</span>
                        <span>{{ activities.get(data.day)?.title }}</span>
                    </div>
                </template>
            </el-calendar>
        </el-card>
        <el-card class="chart-card">
            <v-chart class="chart" :option="option" autoresize/>
        </el-card>
    </div>
</template>

<style scoped>
.activity {
    margin: 5px 0;
    border-radius: 5px;
    background-color: #5856d6;
    color: #ffffff;
    display: flex;
    flex-direction: column;

    span {
        margin: 1px 0;
        font-size: 10px;
        padding: 0 5px;
    }
}

.calendar-header {
    display: flex;
    align-items: center;

    span {
        margin: 0 5px;
    }
}

.chart {
    height: 500px;
}

.welcome,
.calendar,
.status-card,
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