<script setup lang="ts">
import ActivityCalendar from "@/components/ActivityCalendar.vue";
import {Clock} from "@element-plus/icons-vue";
import ActivityCard from "@/components/card/ActivityCard.vue";
import {useActivityStore} from "@/store/activity.js";
import {computed} from "vue";

const activityStore = useActivityStore();
const nearByActivity = computed(() => activityStore.activities.filter(activity => {
    const activityTime = new Date(activity.active_time);
    return activityTime.getTime() > Date.now();
}));
</script>

<template>
    <div class="container">
        <el-card class="activity-card">
            <div class="activity-card-header">
                <el-icon>
                    <Clock/>
                </el-icon>
                <span>近期活动</span>
            </div>
            <div class="nearby-activity-card">
                <ActivityCard class="activity-card-item" v-for="activity in nearByActivity" :activity="activity"/>
            </div>
        </el-card>
        <ActivityCalendar class="activity-calendar"/>
    </div>
</template>

<style scoped>
.activity-card-header {
    display: flex;
    align-items: center;
    font-size: 1.35rem;
    font-weight: bold;
}

.nearby-activity-card {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 10px;
    margin: 10px 0;
}

@media (max-width: 1400px) {
    .nearby-activity-card {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 700px) {
    .activity-calendar {
        display: none;
    }
}

.activity-card-item {
    border-radius: 20px;
}

.activity-card,
.activity-calendar {
    border-radius: 20px;
    margin-bottom: 15px;
}


</style>