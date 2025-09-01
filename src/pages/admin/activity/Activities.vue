<script setup lang="ts">
import {useActivityStore} from "@/store/activity.js";
import {Delete, EditPen, Plus} from "@element-plus/icons-vue";
import {useRouter} from "vue-router";
import {onMounted, ref, Ref} from "vue";
import {showError, showSuccess} from "@/utils/message.js";

const activityStore = useActivityStore();
const router = useRouter();

const activities: Ref<ActivityModel[]> = ref([])

const pageSize = ref(20);
const page = ref(1);
const total = ref(0);

const fetchPageData = async () => {
    const data = await activityStore.getActivitiesPage(page.value, pageSize.value)
    if (data == null) {
        showError("活动数据加载失败")
        return
    }

    activities.value = data.items
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

const deleteActivity = async (id: number) => {
    const response = await activityStore.deleteActivity(id);
    if (response) {
        showSuccess("删除活动成功")
    }
    await fetchPageData()
}

onMounted(async () => {
    await fetchPageData()
})
</script>

<template>
    <div class="container">
        <el-card footer-class="flex justify-content-center">
            <template #header>
                <div class="flex align-items-center">
                    <span>活动总览</span>
                    <el-button class="margin-left-10" :icon="Plus" type="success"
                               @click="router.push(`/admin/activities/new`)">发布活动
                    </el-button>
                </div>
            </template>
            <el-table :data="activities">
                <el-table-column prop="id" label="活动ID"></el-table-column>
                <el-table-column prop="publisher" label="发布者"></el-table-column>
                <el-table-column prop="title" label="活动标题"></el-table-column>
                <el-table-column prop="active_time" label="活动时间"></el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <div id="activity-option-container" class="flex">
                            <el-button id="activity-option-edit-btn" :icon="EditPen" type="primary"
                                       @click="router.push(`/admin/activities/${scope.row.id}`)">
                                编辑
                            </el-button>
                            <el-button id="activity-option-delete-btn" :icon="Delete" type="danger"
                                       @click="deleteActivity(scope.row.id)">
                                删除
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
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
    </div>
</template>

<style scoped>
.el-card {
    transform: none;
}

@media (max-width: 1105px) {
    #activity-option-container {
        flex-direction: column;
    }

    #activity-option-edit-btn {
        margin-bottom: 10px;
    }

    #activity-option-delete-btn {
        margin: 0;
    }
}
</style>