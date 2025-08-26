<script setup lang="ts">
import {ArrowRight, Clock, Location, Position} from "@element-plus/icons-vue";
import moment from "moment";
import {useRouter} from "vue-router";

defineProps<{
    activity: ActivityModel
}>()

const router = useRouter();

</script>

<template>
    <el-card>
        <div class="activity-card">
            <div class="activity-img">
                <img :src="activity.image_url" alt="活动图片"/>
            </div>
            <div class="activity-content">
                <span class="title">{{ activity.title }}</span>
                <span>
                    <el-icon>
                        <Clock/>
                    </el-icon>
                    {{ moment(activity.active_time).format("YYYY-MM-DD HH:mm:ss") }}
                </span>
                <span>
                    <el-icon>
                        <Location/>
                    </el-icon>
                    {{ activity.departure_airport }} - {{ activity.arrival_airport }}
                </span>
                <span>
                    <el-icon>
                        <Position/>
                    </el-icon>
                    {{ activity.publisher }}
                </span>
                <el-button type="primary" @click="router.push(`/activities/${activity.id}`)">
                    立刻报名
                    <el-icon>
                        <ArrowRight/>
                    </el-icon>
                </el-button>
            </div>
        </div>
    </el-card>
</template>

<style scoped>
.el-button {
    max-width: 120px;
}

.activity-img {
    display: flex;
    justify-content: center;
}

.activity-card {
    display: grid;
    grid-template-columns: 300px auto;
    grid-gap: 10px;
}

@media (max-width: 710px) {
    .activity-img {
        justify-content: flex-start;
    }

    .activity-card {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 500px) {
    .activity-img {
        display: none;
    }
}

.activity-content {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    span {
        margin: 3px 0;
        display: flex;
        align-items: center;
    }

    .title {
        font-size: 1.3rem;
        font-weight: bold;
    }
}

img {
    height: 150px;
}
</style>