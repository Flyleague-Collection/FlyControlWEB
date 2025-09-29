<script setup lang="ts">
import {onMounted, Ref, ref} from 'vue';
import ActivityCalendar from "@/components/ActivityCalendar.vue";
import {useUserStore} from "@/store/user.js";
import {formatCid, handleImageUrl} from "@/utils/utils.js";
import Server from "@/api/server";
import PageListCard from "@/components/card/PageListCard.vue";
import type {PageListCardInstance, PageListResponse} from "@/components/card/PageListCard.js";
import Announcement from "@/api/announcement.js";
import moment from "moment";
import {Check, Message} from "@element-plus/icons-vue";
import {getAnnouncementTypeColor, getAnnouncementTypeLabel} from "@/global.js";
import DOMPurify from "dompurify";
import {marked} from "marked";

const userStore = useUserStore();
const totalUser = ref(0);
const totalController = ref(0);
const totalActivity = ref(0);
const totalOnline = ref(0);
const pilotRatingData: Ref<ServerRatingModel[]> = ref([]);
const pilotRatingMax = ref(0);
const controllerRatingData: Ref<ServerRatingModel[]> = ref([]);
const shownDialogList: Ref<Set<number>> = ref(new Set([]));
const needShowList: Ref<UserAnnouncementModel[]> = ref([]);
const controllerRatingMax = ref(0);

const getServerInfo = async () => {
    const data = await Server.getServerInfo()
    if (data != null) {
        totalUser.value = data.total_user
        totalController.value = data.total_controller
        totalActivity.value = data.total_activity
    }
}

const getServerOnline = async () => {
    const data = await Server.getServerOnline();
    if (data != null) {
        totalOnline.value = data.general.connected_clients
    }
}

const getServerRating = async () => {
    const data = await Server.getServerRating();
    if (data != null) {
        data.pilots.forEach(pilot => {
            pilot.avatar_url = handleImageUrl(pilot.avatar_url);
        })
        data.controllers.forEach(controller => {
            controller.avatar_url = handleImageUrl(controller.avatar_url);
        })
        pilotRatingMax.value = data.pilots[0].time
        pilotRatingData.value = data.pilots
        controllerRatingMax.value = data.controllers[0].time
        controllerRatingData.value = data.controllers
    }
}

const getAnnouncements = async (page: number, pageSize: number): Promise<PageListResponse<UserAnnouncementModel>> => {
    const result: PageListResponse<UserAnnouncementModel> = {data: [], total: 0}
    const data = await Announcement.getAnnouncements(page, pageSize);
    if (data != null) {
        result.data = data.items;
        result.total = data.total;
        data.items.forEach(item => {
            if (item.force_show) {
                needShowList.value.push(item)
            }
        })
    }
    return result;
}

const announcementDialogShow = ref(false);
const announcementsRef: Ref<PageListCardInstance> = ref();
const targetAnnouncement: Ref<UserAnnouncementModel> = ref(null);

const showAnnouncementDialog = (index: number) => {
    targetAnnouncement.value = announcementsRef.value?.getDataByIndex(index);
    announcementDialogShow.value = true;
}

const closeAnnouncementDialog = () => {
    if (shownDialogList.value.has(targetAnnouncement.value.id)) {
        return;
    }
    shownDialogList.value.add(targetAnnouncement.value.id);
    localStorage.setItem("announcements", JSON.stringify(Array.from(shownDialogList.value)));
}

let intervalHandle = null;

onMounted(async () => {
    await Promise.allSettled([
        new Promise(resolve => {
            shownDialogList.value = new Set(JSON.parse(localStorage.getItem("announcements") || "[]") as number[]);
            resolve();
        }),
        getServerOnline(),
        getServerRating(),
        getServerInfo()
    ])
    intervalHandle = setInterval(() => {
        if (needShowList.value.length == 0) {
            clearInterval(intervalHandle);
            return;
        }
        if (announcementDialogShow.value) {
            return;
        }
        const data = needShowList.value.pop();
        if (shownDialogList.value.has(data?.id)) {
            return;
        }
        targetAnnouncement.value = data;
        announcementDialogShow.value = true;
    }, 100)
})
</script>

<template>
    <div class="container">
        <el-card class="welcome">欢迎, {{ userStore.userData.username }}, 今天想飞哪里？</el-card>
        <el-row class="status-card" :gutter="20">
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <el-card class="card">
                    <el-space wrap fill>
                        <span class="card-item-title">注册用户总数</span>
                        <span class="card-item-content">{{ totalUser }}</span>
                    </el-space>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <el-card class="card">
                    <el-space wrap fill>
                        <span class="card-item-title">管制团队</span>
                        <span class="card-item-content">{{ totalController }}</span>
                    </el-space>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <el-card class="card">
                    <el-space wrap fill>
                        <span class="card-item-title">举办活动数</span>
                        <span class="card-item-content">{{ totalActivity }}</span>
                    </el-space>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <el-card class="card">
                    <el-space wrap fill>
                        <span class="card-item-title">当前在线用户数</span>
                        <span class="card-item-content">{{ totalOnline }}</span>
                    </el-space>
                </el-card>
            </el-col>
        </el-row>
        <div class="pagination">
            <ActivityCalendar class="calendar"/>
            <PageListCard ref="announcementsRef" :fetch-data="getAnnouncements">
                <template #header>
                    <el-space>
                        <el-icon>
                            <Message/>
                        </el-icon>
                        <span>系统公告</span>
                    </el-space>
                </template>
                <template #main="{data}">
                    <div class="announcement-container">
                        <div v-for="(item, index) in data" :key="index" class="announcement"
                             :class="{'announcement-item': index != data.length - 1}"
                             @click.prevent="showAnnouncementDialog(index)">
                            <span style="font-size: .8em">{{ moment(item.created_at).format("YYYY-MM-DD") }}</span>
                            <el-space>
                                <el-tag type="warning" effect="dark" v-if="item.important" size="small">
                                    重要
                                </el-tag>
                                <el-tag :color="getAnnouncementTypeColor(item.type)" effect="dark" size="small">
                                    {{ getAnnouncementTypeLabel(item.type) }}
                                </el-tag>
                                <span>{{ item.title }}</span>
                            </el-space>
                        </div>
                    </div>
                </template>
            </PageListCard>
        </div>
        <el-row :gutter="20">
            <el-col :md="12">
                <el-card class="rating-card">
                    <template #header>
                        联飞时长排行榜
                    </template>
                    <el-card class="no-transform" v-for="item in pilotRatingData">
                        <div class="flex">
                            <div class="flex align-items-center">
                                <el-avatar size="large" v-if="item.avatar_url != ''" :src="item.avatar_url"/>
                                <el-avatar size="large" v-else>{{ formatCid(item.cid) }}</el-avatar>
                            </div>
                            <div class="flex flex-direction-column w-full margin-left-10">
                                <span class="margin-bottom-10" style="font-size: 1.2rem">{{
                                        formatCid(item.cid)
                                    }}</span>
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
                                <span class="margin-bottom-10" style="font-size: 1.2rem">
                                    {{ formatCid(item.cid) }}
                                </span>
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
    <el-dialog v-model="announcementDialogShow" footer-class="flex justify-content-flex-end" style="max-width: 600px;"
               @close="closeAnnouncementDialog()">
        <template #title>
            <el-space fill wrap class="w-full">
                <el-space wrap>
                    <span style="font-size: 1.25rem">{{ targetAnnouncement.title }}</span>
                    <el-tag type="warning" effect="dark" v-if="targetAnnouncement.important" size="small">
                        重要
                    </el-tag>
                    <el-tag :color="getAnnouncementTypeColor(targetAnnouncement.type)" effect="dark" size="small">
                        {{ getAnnouncementTypeLabel(targetAnnouncement.type) }}
                    </el-tag>
                </el-space>
                <el-space>
                <span style="font-size: .8em">
                    发布时间：{{ moment(targetAnnouncement.created_at).format("YYYY-MM-DD") }}
                </span>
                    <span style="font-size: .8em">
                    更新时间：{{ moment(targetAnnouncement.updated_at).format("YYYY-MM-DD") }}
                </span>
                </el-space>
            </el-space>
        </template>
        <div v-html="DOMPurify.sanitize(marked.parse(targetAnnouncement.content))" class="announcement-content"/>
        <template #footer>
            <el-button :icon="Check" type="success" @click="announcementDialogShow = false">确认</el-button>
        </template>
    </el-dialog>
</template>

<style scoped>
.announcement-content:deep(p),
.announcement-content:deep(img) {
    width: 100%;
}

.pagination {
    display: grid;
    grid-template-columns: 3fr 2fr;
    grid-template-rows: 1fr;
    grid-gap: 20px;
    margin-bottom: 20px;
}

@media (max-width: 1500px) {
    .pagination {
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 1fr;
    }
}

.announcement-container {
    height: 100%;
    margin-bottom: 0;
}

.announcement {
    display: flex;
    flex-direction: column;
    padding: 10px 5px;
}

.announcement:hover {
    cursor: pointer;
    background-color: #2421211E;
}

.announcement-item {
    border-bottom: #1A1A1A4A solid 1px;
}

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