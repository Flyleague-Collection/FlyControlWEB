<script setup lang="ts">
import moment from "moment";
import {computed, onMounted, Ref, ref} from "vue";

import ApiController from "@/api/controller.js";
import ApiUser from "@/api/user.js";
import type {PageListResponse} from "@/components/card/PageListCard.js";
import PageListCard from "@/components/card/PageListCard.vue";
import config from "@/config/index.js";
import {Global, Ratings} from "@/global.js";
import {useServerConfigStore} from "@/store/server_config.js";
import {useUserStore} from "@/store/user.js";
import {formatCid} from "@/utils/utils.js";

const userStore = useUserStore();
const serverConfigStore = useServerConfigStore();
const userData = userStore.userData;
const ratings = computed(() => {
    const rating = serverConfigStore.ratings[userData.rating + 1];
    return `${rating.short_name}/${rating.long_name}`;
})
const historyData: Ref<UserHistoryData> = ref({
    total_pilot_time: 0,
    total_atc_time: 0,
    controllers: [],
    pilots: []
});
const loadingHistoryData = ref(false);

onMounted(async () => {
    loadingHistoryData.value = true;
    const data = await ApiUser.getUserHistories();
    if (data == null) {
        loadingHistoryData.value = false;
        return;
    }
    historyData.value = data;
    loadingHistoryData.value = false;
})

const getColor = (selfRating: Ratings): string => {
    let color = "danger";
    if (userData.rating >= selfRating) {
        color = "success";
    }
    if (userData.rating == selfRating) {
        if (userData.under_monitor) {
            color = "warning";
        }
        if (userData.under_solo) {
            color = "primary";
        }
    }
    return color;
}

const fetchControllerRecord = async (page: number, pageSize: number): PageListResponse<ControllerRecordModel> => {
    const result: PageListResponse<ControllerRecordModel> = {data: [], total: 0}
    const data = await ApiController.getSelfRecords(page, pageSize);
    if (data != null) {
        result.data = data.items;
        result.total = data.total;
    }
    return result;
}
</script>

<template>
    <div class="container">
        <el-row :gutter="10">
            <el-col :xs="24" :sm="12" :md="6" :lg="5" :xl="5">
                <el-card>
                    <div class="flex flex-direction-column align-items-center">
                        <el-avatar v-if="userData.avatar_url != ''" :src="userData.avatar_url" :size="100"/>
                        <el-avatar v-else :size="100">{{ formatCid(userData.cid) }}</el-avatar>
                        <div class="flex flex-direction-column margin-left-10 align-items-center">
                            <span class="font-size-15rem">{{ userData.username }}</span>
                            <span class="font-size-12rem">CID: {{ formatCid(userData.cid) }}</span>
                            <el-space direction="vertical">
                                <el-space wrap class="justify-content-center">
                                    <el-space wrap class="justify-content-center">
                                        <el-tag style="border-color: transparent" effect="dark"
                                                :color="config.ratings[userData.rating + 1].color">
                                            {{ ratings }}
                                        </el-tag>
                                        <el-tag v-if="userData.tier2" type="success" effect="dark">Tier2</el-tag>
                                        <el-tag v-else type="danger" effect="dark">Tier2</el-tag>
                                    </el-space>
                                    <el-tag v-if="userData.under_solo" type="primary" effect="dark">
                                        Solo直至 {{ moment(userData.solo_until).format("YYYY-MM-DD HH:mm:ss") }}
                                    </el-tag>
                                    <el-space wrap class="justify-content-center">
                                        <el-tag v-if="userData.guest" type="info" effect="dark">客座管制</el-tag>
                                        <el-tag v-if="userData.under_monitor" type="warning" effect="dark">
                                            实习中
                                        </el-tag>
                                    </el-space>
                                </el-space>
                                <el-space wrap class="justify-content-center">
                                    <el-tag :type="getColor(Ratings.STU1)">DEL</el-tag>
                                    <el-tag :type="getColor(Ratings.STU1)">GND</el-tag>
                                    <el-tag :type="getColor(Ratings.STU2)">TWR</el-tag>
                                    <el-tag :type="getColor(Ratings.STU3)">APP</el-tag>
                                    <el-tag :type="getColor(Ratings.CTR1)">CTR</el-tag>
                                    <el-tag :type="getColor(Ratings.CTR3)">FSS</el-tag>
                                </el-space>
                            </el-space>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="18" :lg="19" :xl="19">
                <el-card>
                    <template #header>
                        <span>管制记录(最近10次)</span>
                    </template>
                    <el-table v-if="historyData.controllers.length > 0" :data="historyData.controllers">
                        <el-table-column prop="callsign" label="席位"/>
                        <el-table-column prop="start_time" label="上线时间"/>
                        <el-table-column prop="end_time" label="下线时间"/>
                        <el-table-column prop="online_time" label="在线时间">
                            <template #default="scope">
                                {{ (scope.row.online_time / 3600.0).toFixed(2) }} h
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-empty v-else description="你好像还没有进行过管制"></el-empty>
                </el-card>
                <PageListCard :fetch-data="fetchControllerRecord" card-title="管制履历">
                    <el-table-column label="记录时间">
                        <template #default="scope">
                            {{ moment(scope.row.time).format('YYYY-MM-DD HH:mm:ss') }}
                        </template>
                    </el-table-column>
                    <el-table-column label="类型">
                        <template #default="scope">
                            <el-tag>{{ Global.controllerRecordTypes[scope.row.type].label }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="记录人">
                        <template #default="scope">
                            {{ scope.row.operator_cid }}
                        </template>
                    </el-table-column>
                    <el-table-column label="内容">
                        <template #default="scope">
                            {{ scope.row.content }}
                        </template>
                    </el-table-column>
                </PageListCard>
            </el-col>
        </el-row>
    </div>
</template>

<style scoped>
</style>