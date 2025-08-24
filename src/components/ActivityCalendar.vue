<script setup lang="ts">
import {ArrowLeft, ArrowRight, Calendar} from "@element-plus/icons-vue";
import type {CalendarDateType, CalendarInstance} from 'element-plus'
import {ref} from "vue";
import {useActivityStore} from "@/store/activity.js";
import {useRouter} from "vue-router";

const calendar = ref<CalendarInstance>()
const router = useRouter();

const activityStore = useActivityStore()

const selectDate = (val: CalendarDateType) => {
    if (!calendar.value) return
    calendar.value.selectDate(val)
}
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
                <div v-if="activityStore.activitiesRecord[data.day] != null" class="activity"
                     @click="router.push(`/activities/${activityStore.activitiesRecord[data.day].id}`)">
                    <span>{{ activityStore.activitiesRecord[data.day].start_time }}</span>
                    <span>{{ activityStore.activitiesRecord[data.day].title }}</span>
                </div>
            </template>
        </el-calendar>
    </el-card>
</template>

<style scoped>
.activity {
    margin: 5px 0;
    border-radius: 5px;
    background-color: #5856d6;
    color: #ffffff;
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