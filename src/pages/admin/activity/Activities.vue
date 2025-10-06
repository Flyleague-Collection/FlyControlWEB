<script setup lang="ts">
import {Delete, EditPen, Plus} from "@element-plus/icons-vue";
import {computed, ref, Ref} from "vue";
import {useRouter} from "vue-router";

import ApiActivity from "@/api/activity.js";
import type {PageListCardInstance, PageListResponse} from "@/components/card/PageListCard.js";
import PageListCard from "@/components/card/PageListCard.vue";
import type {ConfirmDialogInstance} from "@/components/dialog/ConfirmDialog.js";
import ConfirmDialog from "@/components/dialog/ConfirmDialog.vue";
import {useReactiveWidth} from "@/composables/useReactiveWidth.js";
import {useUserStore} from "@/store/user.js";
import {showError, showSuccess} from "@/utils/message.js";
import {PermissionNode} from "@/utils/permission.js";
import {formatCid} from "@/utils/utils.js";
import {ActivityStatus} from "@/global.js";
import moment from "moment";

const userStore = useUserStore();
const router = useRouter();

const getActivityData = async (page: number, pageSize: number): PageListResponse<ActivityModel> => {
    const res: PageListResponse<ActivityModel> = {data: [], total: 0}
    const data = await ApiActivity.getActivitiesPage(page, pageSize);
    if (data != null) {
        res.data = data.items;
        res.total = data.total;
    }
    return res;
}

const confirmDeleteActivityRef: Ref<ConfirmDialogInstance> = ref()
const activityId = ref(0)

const confirmDeleteActivity = (id: number) => {
    if (!userStore.permission.hasPermissionNode(PermissionNode.ActivityDelete)) {
        showError("你无权这么做");
        return;
    }
    activityId.value = id;
    confirmDeleteActivityRef.value?.show();
}

const activityDataListRef: Ref<PageListCardInstance> = ref()

const deleteActivity = async () => {
    if (activityId.value == 0) {
        showError("活动ID错误");
        return;
    }
    if (await ApiActivity.deleteActivity(activityId.value)) {
        showSuccess("删除活动成功");
        activityId.value = 0;
    }
    activityDataListRef.value?.flushData();
}

const hasChangeStatusPermission = computed(() => userStore.permission.hasPermissionNode(PermissionNode.ActivityEditState));

const changeActivityStatus = async (id: number, status: ActivityStatus) => {
    if (!hasChangeStatusPermission) {
        showError("你无权这么做");
        return;
    }
    if (await ApiActivity.updateActivityStatus(id, status)) {
        showSuccess("修改活动状态成功");
        activityDataListRef.value?.flushData();
    }
}

const {less1200px, less900px, less700px, less500px, less400px} = useReactiveWidth();
</script>

<template>
    <PageListCard ref="activityDataListRef" :fetch-data="getActivityData" no-transform>
        <template #header>
            <el-space wrap>
                <span>活动总览</span>
                <el-button class="margin-left-10" :icon="Plus" type="success" :size="less400px ? 'small' : 'default'"
                           @click="router.push(`/admin/activities/new`)"
                           :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ActivityPublish)">
                    发布活动
                </el-button>
            </el-space>
        </template>
        <el-table-column prop="id" label="活动ID" :width="less1200px ? '' : 120" v-if="!less900px"/>
        <el-table-column label="发布者" v-if="!less700px" :width="less1200px ? '' : 120">
            <template #default="scope">
                {{ formatCid(scope.row.publisher) }}
            </template>
        </el-table-column>
        <el-table-column label="活动标题">
            <template #default="scope">
                <el-space wrap>
                    <span>{{ scope.row.title }}</span>
                    <span v-if="less500px">
                        <el-tag type="primary" size="small" v-if="scope.row.status == ActivityStatus.Sign">
                            报名中
                        </el-tag>
                        <el-tag type="success" size="small" v-else-if="scope.row.status == ActivityStatus.Active">
                            活动中
                        </el-tag>
                        <el-tag type="warning" size="small" v-else>
                            已结束
                        </el-tag>
                    </span>
                    <el-space wrap v-if="less400px">
                        <el-button id="activity-option-edit-btn" :icon="EditPen" type="primary" size="small"
                                   @click="router.push(`/admin/activities/${scope.row.id}`)"
                                   :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ActivityEdit)">
                            编辑
                        </el-button>
                        <el-button id="activity-option-delete-btn" :icon="Delete" type="danger" size="small"
                                   @click="confirmDeleteActivity(scope.row.id)"
                                   :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ActivityDelete)">
                            删除
                        </el-button>
                        <el-button type="success" size="small"
                                   @click="changeActivityStatus(scope.row.id, ActivityStatus.Active)"
                                   :disabled="scope.row.status >= ActivityStatus.Active || !hasChangeStatusPermission">
                            开始
                        </el-button>
                        <el-button type="danger" size="small"
                                   @click="changeActivityStatus(scope.row.id, ActivityStatus.Finish)"
                                   :disabled="scope.row.status >= ActivityStatus.Finish || !hasChangeStatusPermission">
                            结束
                        </el-button>
                    </el-space>
                </el-space>
            </template>
        </el-table-column>
        <el-table-column label="活动时间" v-if="!less500px" :width="less1200px ? '' : 200">
            <template #default="scope">
                {{ moment(scope.row.active_time).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
        </el-table-column>
        <el-table-column label="活动状态" v-if="!less500px" :width="less1200px ? '' : 120">
            <template #default="scope">
                <el-tag type="primary" v-if="scope.row.status == ActivityStatus.Sign">报名中</el-tag>
                <el-tag type="success" v-else-if="scope.row.status == ActivityStatus.Active">活动中</el-tag>
                <el-tag type="warning" v-else>已结束</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="操作" v-if="!less400px" :width="less1200px ? '' : 400">
            <template #default="scope">
                <el-space wrap>
                    <el-button id="activity-option-edit-btn" :icon="EditPen" type="primary"
                               @click="router.push(`/admin/activities/${scope.row.id}`)"
                               :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ActivityEdit)">
                        编辑
                    </el-button>
                    <el-button id="activity-option-delete-btn" :icon="Delete" type="danger"
                               @click="confirmDeleteActivity(scope.row.id)"
                               :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ActivityDelete)">
                        删除
                    </el-button>
                    <el-button type="success"
                               @click="changeActivityStatus(scope.row.id, ActivityStatus.Active)"
                               :disabled="scope.row.status >= ActivityStatus.Active || !hasChangeStatusPermission">
                        开始
                    </el-button>
                    <el-button type="danger"
                               @click="changeActivityStatus(scope.row.id, ActivityStatus.Finish)"
                               :disabled="scope.row.status >= ActivityStatus.Finish || !hasChangeStatusPermission">
                        结束
                    </el-button>
                </el-space>
            </template>
        </el-table-column>
    </PageListCard>
    <ConfirmDialog ref="confirmDeleteActivityRef"
                   body-content="确认要删除该活动吗?"
                   header-content="删除活动"
                   @confirm-event="deleteActivity()"/>
</template>

<style scoped>

</style>