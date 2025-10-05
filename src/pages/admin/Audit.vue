<script setup lang="ts">
import moment from "moment";

import Api from "@/api/utils.js";
import type {PageListResponse} from "@/components/card/PageListCard.js";
import PageListCard from "@/components/card/PageListCard.vue";
import {useReactiveWidth} from "@/composables/useReactiveWidth.js";
import {formatCid} from "@/utils/utils.js";

const fetchAuditLogs = async (page: number, pageSize: number): Promise<PageListResponse<AuditLogModel>> => {
    const result: PageListResponse<AuditLogModel> = {data: [], total: 0};
    const data = await Api.getAuditLogs(page, pageSize);
    if (data != null) {
        result.data = data.items;
        result.total = data.total;
    }
    return result;
}

const {less800px, less700px, less600px, less500px} = useReactiveWidth();
</script>

<template>
    <PageListCard :fetch-data="fetchAuditLogs" card-title="审计日志" no-transform>
        <el-table-column type="expand">
            <template #default="props">
                <el-descriptions :column="less800px ? 1 : 2" :label-width="100" border>
                    <el-descriptions-item label="操作时间" v-if="less800px">
                        {{ moment(props.row.time).format('YYYY-MM-DD HH:mm:ss') }}
                    </el-descriptions-item>
                    <el-descriptions-item label="事件名">
                        <el-tag>{{ props.row.event_type }}</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="操作人" v-if="less500px">
                        {{ formatCid(props.row.subject) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="操作对象" v-if="less700px">
                        {{ props.row.object }}
                    </el-descriptions-item>
                    <el-descriptions-item label="来源IP" :span="2">
                        {{ props.row.ip }}
                    </el-descriptions-item>
                    <el-descriptions-item label="用户代理" :span="2">
                        {{ props.row.user_agent }}
                    </el-descriptions-item>
                    <el-descriptions-item label="修改前值" :span="2" v-if="props.row.change_details">
                        {{ props.row.change_details.old_value }}
                    </el-descriptions-item>
                    <el-descriptions-item label="修改后值" :span="2" v-if="props.row.change_details">
                        {{ props.row.change_details.new_value }}
                    </el-descriptions-item>
                    <el-descriptions-item label="修改详情" :span="2" v-if="!props.row.change_details">
                        无
                    </el-descriptions-item>
                </el-descriptions>
            </template>
        </el-table-column>
        <el-table-column label="时间" v-if="!less800px">
            <template #default="scope">
                {{ moment(scope.row.time).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
        </el-table-column>
        <el-table-column label="事件名">
            <template #default="scope">
                <el-tag>{{ scope.row.event_type }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="操作人" :width="less600px ? 100 : ''" v-if="!less500px">
            <template #default="scope">
                {{ formatCid(scope.row.subject) }}
            </template>
        </el-table-column>
        <el-table-column prop="object" label="操作对象" v-if="!less700px"/>
    </PageListCard>
</template>

<style scoped>
.el-card {
    transform: none;
}
</style>