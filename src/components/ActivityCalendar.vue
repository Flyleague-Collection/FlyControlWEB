<script setup lang="ts">
import {ArrowLeft, ArrowRight, Calendar} from "@element-plus/icons-vue";
import type {CalendarDateType, CalendarInstance} from 'element-plus'
import {onMounted, ref} from "vue";
import {useActivityStore} from "@/store/activity.js";
import {useRouter} from "vue-router";
import moment, {Moment} from "moment";
import ApiActivity from "@/api/activity.js";

const calendar = ref<CalendarInstance>()
const router = useRouter();

const activityStatusClass = ["activity-status-sign", "activity-status-under", "activity-status-end"]

const activityStore = useActivityStore()

let currentTime: Moment

const selectDate = (val: CalendarDateType) => {
    if (!calendar.value) return
    calendar.value.selectDate(val)
    switch (val) {
        case "next-month":
            fetchActivities(currentTime.add('months', 1))
            break
        case "prev-month":
            fetchActivities(currentTime.subtract('months', 1))
            break
        case "today":
            currentTime = moment()
            fetchActivities(moment())
    }
}

const activities = ref<ActivityModel[]>([]);
const activitiesRecord = ref<Record<string, ActivityModel>>({});

const fetchActivities = async (date: Moment) => {
    const data = await ApiActivity.getActivities(date.format('YYYY-MM'));
    if (data == null) {
        return
    }
    activities.value = data;
    activitiesRecord.value = activityStore.translateActivityData(activities.value);
}

defineExpose({activities, activitiesRecord, fetchActivities});

onMounted(async () => {
    await fetchActivities(moment());
})
</script>

<template>
    <el-card class="calendar">
        <el-calendar ref="calendar">
            <template #header="{ date }">
                <div class="calendar-header">
                    <el-icon>
                        <Calendar/>
                    </el-icon>
                    <span>联飞活动</span>
                </div>
                <div>
                    <el-button-group>
                        <el-button :icon="ArrowLeft" @click="selectDate('prev-month')"></el-button>
                        <el-button>{{ date }}</el-button>
                        <el-button :icon="ArrowRight" @click="selectDate('next-month')"></el-button>
                        <el-button @click="selectDate('today')">今天</el-button>
                    </el-button-group>
                </div>
            </template>
            <template #date-cell="{ data }">
                {{ data.day.split("-")[2] }}
                <div v-if="activitiesRecord[data.day] != null" class="activity"
                     :class="activityStatusClass[activitiesRecord[data.day].status]"
                     @click="router.push(`/activities/${activitiesRecord[data.day].id}`)">
                    <span>{{ activitiesRecord[data.day].start_time }}</span>
                    <span>{{ activitiesRecord[data.day].title }}</span>
                </div>
            </template>
        </el-calendar>
    </el-card>
</template>

<style lang="scss" scoped>
.activity {
    margin: 5px 0;
    border-radius: 5px;
    background-color: var(--bg-color);
    color: var(--text-color);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    span {
        margin: 1px 0;
        font-size: 10px;
        padding: 0 5px;
    }
}

.calendar {
    border-radius: 20px;
    margin-bottom: 15px;
    height: 100%;
}

.calendar-header {
    display: flex;
    align-items: center;
    font-size: 1.35rem;
    font-weight: bold;

    span {
        margin: 0 5px;
    }
}

</style>