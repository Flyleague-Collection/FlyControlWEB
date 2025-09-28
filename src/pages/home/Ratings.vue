<script setup lang="ts">
import request from "@/api/request.js";
import AxiosXHR = Axios.AxiosXHR;
import PageListCard from "@/components/card/PageListCard.vue";
import type {PageListResponse} from "@/components/card/PageListCard.js";
import {handleImageUrl} from "@/utils/utils.js";
import config from "@/config/index.js";
import {useServerConfigStore} from "@/store/server_config.js";
import moment from "moment";

const serverConfigStore = useServerConfigStore();

const fetchRatingsData = async (page: number, pageSize: number): PageListResponse<ControllerRating> => {
    const result: PageListResponse<ControllerRating> = {data: [], total: 0}
    const response = await request.get(`/controllers/ratings?page_number=${page}&page_size=${pageSize}`) as AxiosXHR<any>
    if (response.status == 200) {
        result.data = response.data.items
        result.total = response.data.total
    }
    return result;
}
</script>

<template>
    <div class="container">
        <p class="title">管制员权限公示</p>
        <div class="content">
            <p>下方表格的内容基于管制员中心数据自动生成，正常情况下最多存在24小时延迟</p>
            <p>表中数据仅包含至少含有一类席位管制权限的管制员（含客座管制员），即不包含在下表中的管制员不再拥有管制权限</p>
            <PageListCard class="w-full" :fetch-data="fetchRatingsData" card-title="管制员权限公示表">
                <el-table-column label="CID">
                    <template #default="scope">
                        <el-space>
                            <el-avatar v-if="scope.row.avatar_url == ''">{{ scope.row.cid }}</el-avatar>
                            <el-avatar v-else :src="handleImageUrl(scope.row.avatar_url)"></el-avatar>
                            <span style="font-size: 1.2rem;font-weight: 450;margin-left: 10px">
                                {{ scope.row.cid }}
                            </span>
                        </el-space>
                    </template>
                </el-table-column>
                <el-table-column label="管制等级">
                    <template #default="scope">
                        <el-space wrap class="justify-content-center">
                            <el-tag v-if="scope.row.tier2" type="success" effect="dark">Tier2</el-tag>
                            <el-tag v-else type="danger" effect="dark">Tier2</el-tag>
                            <el-tag class="level text-color-white border-none" effect="dark"
                                    :color="config.ratings[scope.row.rating + 1].color">
                                {{ serverConfigStore.ratings[scope.row.rating + 1].short_name }}
                            </el-tag>
                        </el-space>
                    </template>
                </el-table-column>
                <el-table-column label="客座管制">
                    <template #default="scope">
                        <el-tag type="success" v-if="scope.row.is_guest">是</el-tag>
                        <el-tag type="danger" v-else>否</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="实习中">
                    <template #default="scope">
                        <el-tag type="success" v-if="scope.row.under_monitor">是</el-tag>
                        <el-tag type="danger" v-else>否</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="SOLO">
                    <template #default="scope">
                        <el-tag type="success" v-if="scope.row.under_solo">
                            {{ moment(scope.row.until_solo).format('YYYY-MM-DD HH:mm:ss') }}
                        </el-tag>
                        <el-tag type="danger" v-else>否</el-tag>
                    </template>
                </el-table-column>
            </PageListCard>
        </div>
    </div>
</template>

<style scoped lang="scss">
.container {
    width: 100%;
    padding: 50px 10% 0 10%;
    display: flex;
    flex-direction: column;
    align-items: center;

    .el-card {
        transform: none;
    }

    p {
        font-size: 1.05rem;
        line-height: 1.75;
    }

    .title {
        font-size: 2.5rem;
        font-weight: 600;
        color: $color-primary;
        margin-bottom: 40px;
    }
}
</style>