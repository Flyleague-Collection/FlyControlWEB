<script setup lang="ts">
import {useRouter} from "vue-router";
import {useUserStore} from "@/store/user.js";
import {onMounted, ref} from "vue";
import {showError} from "@/utils/message.js";
import request from "@/utils/request.js";
import moment from "moment";

const router = useRouter();
const userStore = useUserStore();
const users = ref<AuditLogModel[]>([]);

const pageSize = ref(20);
const page = ref(1);
const total = ref(0);

const getAuditLogs = async (page: number, pageSize: number): Promise<GetAuditLogsPageResponse | null> => {
    const response = await request.get(`/audits?page_number=${page}&page_size=${pageSize}`);
    if (response.status === 200) {
        return response.data as GetAuditLogsPageResponse;
    }
    return null;
}

const fetchPageData = async () => {
    const data = await getAuditLogs(page.value, pageSize.value)
    if (data == null) {
        showError("审计日志加载失败")
        return
    }

    users.value = data.items
    total.value = data.total
}

const pageChange = async (value: number) => {
    page.value = value;
    await fetchPageData()
}

const pageSizeChange = async (value: number) => {
    pageSize.value = value;
    await fetchPageData()
}

onMounted(async () => {
    await fetchPageData()
})
</script>

<template>
    <el-card footer-class="flex justify-content-center">
        <template #header>
            <div class="flex align-items-center">
                <span>审计日志</span>
            </div>
        </template>
        <el-table :data="users">
            <el-table-column type="expand">
                <template #default="props">
                    <p>来源IP: {{ props.row.ip }}</p>
                    <p>用户代理: {{ props.row.user_agent }}</p>
                    <div v-if="props.row.change_details">
                        <p>原始值: {{ props.row.change_details.old_value }}</p>
                        <p>新值: {{ props.row.change_details.new_value }}</p>
                    </div>
                    <div v-else>无详细信息</div>
                </template>
            </el-table-column>
            <el-table-column label="时间">
                <template #default="scope">
                    {{ moment(scope.row.time).format('YYYY-MM-DD HH:mm:ss') }}
                </template>
            </el-table-column>
            <el-table-column prop="event_type" label="事件名"></el-table-column>
            <el-table-column prop="subject" label="操作人"></el-table-column>
            <el-table-column prop="object" label="操作对象"></el-table-column>
        </el-table>
        <template #footer>
            <el-pagination
                :page-size="pageSize"
                :current-page="page"
                :total="total"
                :page-sizes="[10, 20, 30, 40, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                @update:current-page="pageChange"
                @update:page-size="pageSizeChange"
            />
        </template>
    </el-card>
</template>

<style scoped>
.el-card {
    transform: none;
}
</style>