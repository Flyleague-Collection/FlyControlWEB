<script setup lang="ts">
import {Delete, EditPen, Plus} from "@element-plus/icons-vue";
import {ref, Ref} from "vue";
import {useRouter} from "vue-router";

import ApiActivity from "@/api/activity.js";
import type {PageListCardInstance, PageListResponse} from "@/components/card/PageListCard.js";
import PageListCard from "@/components/card/PageListCard.vue";
import type {ConfirmDialogInstance} from "@/components/dialog/ConfirmDialog.js";
import ConfirmDialog from "@/components/dialog/ConfirmDialog.vue";
import {useUserStore} from "@/store/user.js";
import {showError, showSuccess} from "@/utils/message.js";
import {PermissionNode} from "@/utils/permission.js";
import {formatCid} from "@/utils/utils.js";

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
        showError("你无权这么做")
        return
    }
    activityId.value = id;
    confirmDeleteActivityRef.value?.show();
}

const activityDataListRef: Ref<PageListCardInstance> = ref()

const deleteActivity = async () => {
    if (activityId.value == 0) {
        showError("活动ID错误")
        return
    }
    if (await ApiActivity.deleteActivity(activityId.value)) {
        showSuccess("删除活动成功")
        activityId.value = 0
    }
    activityDataListRef.value?.flushData()
}
</script>

<template>
    <PageListCard ref="activityDataListRef" :fetch-data="getActivityData" no-transform>
        <template #header>
            <el-space wrap>
                <span>活动总览</span>
                <el-button class="margin-left-10" :icon="Plus" type="success"
                           @click="router.push(`/admin/activities/new`)"
                           :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ActivityPublish)">
                    发布活动
                </el-button>
            </el-space>
        </template>
        <el-table-column prop="id" label="活动ID"/>
        <el-table-column label="发布者">
            <template #default="scope">
                {{ formatCid(scope.row.publisher) }}
            </template>
        </el-table-column>
        <el-table-column prop="title" label="活动标题"/>
        <el-table-column prop="active_time" label="活动时间"/>
        <el-table-column label="操作">
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