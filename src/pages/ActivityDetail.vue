<script setup lang="ts">
import {useActivityStore} from "@/store/activity.js";
import {useRoute} from "vue-router";
import {ref} from "vue";
import moment from "moment";
import {Document} from "@element-plus/icons-vue";

const route = useRoute();

const activityStore = useActivityStore();

const activity = ref(activityStore.getActivityById(Number(route.params.id)))

</script>

<template>
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
                <el-descriptions-item>
                    <template #label>
                        立刻报名
                    </template>
                    <el-button type="primary">飞行员报名</el-button>
                    <el-button type="primary">管制员报名</el-button>
                </el-descriptions-item>
            </el-descriptions>
        </div>
        <el-row :gutter="10" class="activity-status">
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <el-card class="card">
                    <div class="card-item">
                        <span class="card-item-title">飞行员报名数</span>
                        <span class="card-item-content">1</span>
                    </div>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <el-card class="card">
                    <div class="card-item">
                        <span class="card-item-title">管制员报名数</span>
                        <span class="card-item-content">1</span>
                    </div>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <el-card class="card">
                    <div class="card-item">
                        <span class="card-item-title">报名剩余时间</span>
                        <span class="card-item-content">1</span>
                    </div>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <el-card class="card">
                    <div class="card-item">
                        <span class="card-item-title">活动状态</span>
                        <span class="card-item-content">1</span>
                    </div>
                </el-card>
            </el-col>
        </el-row>
        <el-tabs class="demo-tabs">
            <el-tab-pane label="飞行员" name="first"></el-tab-pane>
            <el-tab-pane label="管制员" name="second"></el-tab-pane>
        </el-tabs>
    </div>
</template>

<style scoped>
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
        margin: 5px 0;
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
}

@media (max-width: 1025px) {
    .outside-layout {
        .activity-img {
            width: 100% !important;
            margin-bottom: 10px !important;
        }

        .activity-content {
            flex-direction: column;
        }
    }
}
</style>