<script setup lang="ts">
import AxiosXHR = Axios.AxiosXHR;
import moment from "moment";

import PageListCard from "@/components/card/PageListCard.vue";
import {PageListResponse} from "@/components/card/PageListCard.js";
import request from "@/api/request.js";
import {padStart} from "lodash-es";
import {formatCid} from "@/utils/utils.js";

const fetchAuditLogs = async (page: number, pageSize: number): Promise<PageListResponse<AuditLogModel>> => {
    const data: PageListResponse<AuditLogModel> = {data: [], total: 0};
    const response = await request.get(`/audits?page_number=${page}&page_size=${pageSize}`) as AxiosXHR<GetAuditLogsPageResponse>;
    if (response.status === 200) {
        data.data = response.data.items;
        data.total = response.data.total;
    }
    return data;
}
</script>

<template>
    <PageListCard :fetch-data="fetchAuditLogs" card-title="审计日志" no-transform>
        <el-table-column type="expand">
            <template #default="props">
                <el-descriptions :label-width="100" border>
                    <el-descriptions-item label="操作时间">
                        {{ moment(props.row.time).format('YYYY-MM-DD HH:mm:ss') }}
                    </el-descriptions-item>
                    <el-descriptions-item label="来源IP">
                        {{ props.row.ip }}
                    </el-descriptions-item>
                    <el-table-column label="事件名">
                        <template #default="scope">
                            <el-tag>{{ scope.row.event_type }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-descriptions-item label="操作人">
                        {{ formatCid(props.row.subject) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="操作对象">
                        {{ props.row.object }}
                    </el-descriptions-item>
                    <el-descriptions-item label="用户代理">
                        {{ props.row.user_agent }}
                    </el-descriptions-item>
                    <el-descriptions-item label="详细信息" :span="3">
                        <div v-if="props.row.change_details">
                            <el-tag type="warning">{{ props.row.change_details.old_value }}</el-tag>
                            <br/>
                            <el-tag type="primary">{{ props.row.change_details.new_value }}</el-tag>
                        </div>
                        <div v-else>
                            <el-tag type="info">无</el-tag>
                        </div>
                    </el-descriptions-item>
                </el-descriptions>
            </template>
        </el-table-column>
        <el-table-column label="时间">
            <template #default="scope">
                {{ moment(scope.row.time).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
        </el-table-column>
        <el-table-column label="事件名">
            <template #default="scope">
                <el-tag>{{ scope.row.event_type }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="操作人">
            <template #default="scope">
                {{ formatCid(scope.row.subject) }}
            </template>
        </el-table-column>
        <el-table-column prop="object" label="操作对象"/>
    </PageListCard>
</template>

<style scoped>
.el-card {
    transform: none;
}
</style>