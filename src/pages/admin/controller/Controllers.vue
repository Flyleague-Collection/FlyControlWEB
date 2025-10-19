<script setup lang="ts">
import {cloneDeep} from "lodash";
import moment from "moment";
import {EditPen} from "@element-plus/icons-vue";
import {computed, Ref, ref} from "vue";
import {useRouter} from "vue-router";

import ApiController from "@/api/controller.js";
import ApiUser from "@/api/user.js";
import type {PageListCardInstance, PageListResponse} from "@/components/card/PageListCard.js";
import PageListCard from "@/components/card/PageListCard.vue";
import type {FormDialogInstance} from "@/components/dialog/FormDialog.js";
import FormDialog from "@/components/dialog/FormDialog.vue";
import {useReactiveWidth} from "@/composables/useReactiveWidth.js";
import config from "@/config/index.js";
import {useServerConfigStore} from "@/store/server_config.js";
import {useUserStore} from "@/store/user.js";
import {showError, showSuccess, showWarning} from "@/utils/message.js";
import {PermissionNode} from "@/utils/permission.js";
import {formatCid, handleImageUrl} from "@/utils/utils.js";

const router = useRouter();
const userStore = useUserStore();
const serverConfig = useServerConfigStore();
const hasAnyEditPermission = computed(() => {
    return userStore.permission.hasAnyPermissions(
        PermissionNode.ControllerEditRating,
        PermissionNode.ControllerChangeGuest,
        PermissionNode.ControllerChangeSolo,
        PermissionNode.ControllerTier2Rating
    )
})

const fetchUsers = async (page: number, pageSize: number): Promise<PageListResponse<UserModel>> => {
    const result: PageListResponse<UserModel> = {data: [], total: 0};
    const data = await ApiUser.getUserPage(page, pageSize);
    if (data != null) {
        result.data = data.items;
        result.total = data.total;
    }
    return result;
}

const fetchControllers = async (page: number, pageSize: number): Promise<PageListResponse<UserModel>> => {
    const result: PageListResponse<UserModel> = {data: [], total: 0};
    const data = await ApiController.getControllers(page, pageSize);
    if (data != null) {
        result.data = data.items;
        result.total = data.total;
    }
    return result;
}

const editRatingDialogRef: Ref<FormDialogInstance> = ref(null);
const oldValue: Ref<UserModel> = ref({});
const userInfo: Ref<UserModel> = ref({});

const showEditRatingDialog = async (id: number) => {
    if (!hasAnyEditPermission) {
        showError("你无权这么做");
        return;
    }
    const user = await ApiUser.getUserByUid(id);
    if (user == null) {
        return;
    }
    if (!user.under_solo) {
        user.solo_until = moment().format("YYYY-MM-DD HH:mm:ss");
    }
    userInfo.value = user;
    oldValue.value = cloneDeep(user);
    editRatingDialogRef.value?.show();
}

const userListCardRef: Ref<PageListCardInstance> = ref(null);
const controllerListCardRef: Ref<PageListCardInstance> = ref(null);

const confirmUpdateRating = async () => {
    if (!hasAnyEditPermission) {
        showError("你无权这么做");
        return;
    }
    const requestData: Record<string, string | number | boolean> = {}
    if (userStore.permission.hasPermissionNode(PermissionNode.ControllerEditRating) && oldValue.value.rating != userInfo.value.rating) {
        requestData.rating = userInfo.value.rating;
    }
    if (userStore.permission.hasPermissionNode(PermissionNode.ControllerTier2Rating) && oldValue.value.tier2 != userInfo.value.tier2) {
        requestData.tier2 = userInfo.value.tier2;
    }
    if (userStore.permission.hasPermissionNode(PermissionNode.ControllerChangeGuest) && oldValue.value.guest != userInfo.value.guest) {
        requestData.guest = userInfo.value.guest;
    }
    if (!userInfo.value.guest) {
        if (userStore.permission.hasPermissionNode(PermissionNode.ControllerChangeUnderMonitor) && oldValue.value.under_monitor != userInfo.value.under_monitor) {
            requestData.under_monitor = userInfo.value.under_monitor;
        }
        if (userStore.permission.hasPermissionNode(PermissionNode.ControllerChangeSolo) && oldValue.value.under_solo != userInfo.value.under_solo) {
            requestData.under_solo = userInfo.value.under_solo;
            if (userInfo.value.under_solo) {
                if (moment(userInfo.value.solo_until).isBefore(moment())) {
                    showError("Solo许可时间不得早于当前时间");
                    return;
                }
                requestData.solo_until = userInfo.value.solo_until;
            }
        }
    }
    if (Object.values(requestData).length == 0) {
        showWarning("没有需要修改的部分");
        return;
    }
    requestData.rating = userInfo.value.rating;
    requestData.tier2 = userInfo.value.tier2;
    requestData.guest = userInfo.value.guest;
    requestData.under_monitor = userInfo.value.under_monitor;
    requestData.under_solo = userInfo.value.under_solo;
    requestData.solo_until = moment(userInfo.value.solo_until).utc().format();
    if (await ApiController.updateControllerRating(userInfo.value.id, requestData)) {
        showSuccess("编辑管制权限成功");
        editRatingDialogRef.value?.hide();
        userListCardRef.value?.flushData();
        controllerListCardRef.value?.flushData();
    }
}

const {less900px, less500px, less400px} = useReactiveWidth();
</script>

<template>
    <el-space wrap fill class="w-full" size="large">
        <PageListCard ref="userListCardRef"
                      :fetch-data="fetchUsers"
                      card-title="用户总览"
                      no-transform>
            <el-table-column label="CID" :width="less900px ? less400px ? '' : 60 : ''">
                <template #default="scope">
                    <el-space wrap class="flex align-items-center">
                        <span v-if="!less900px">
                            <el-avatar v-if="scope.row.avatar_url == ''">
                                {{ formatCid(scope.row.cid) }}
                            </el-avatar>
                            <el-avatar v-else :src="handleImageUrl(scope.row.avatar_url)"/>
                        </span>
                        <span>{{ formatCid(scope.row.cid) }}</span>
                        <el-space wrap v-if="less400px">
                            <el-button :icon="EditPen" type="primary"
                                       :disabled="!hasAnyEditPermission"
                                       size="small" @click="showEditRatingDialog(scope.row.id)">
                                编辑
                            </el-button>
                        </el-space>
                    </el-space>
                </template>
            </el-table-column>
            <el-table-column prop="username" label="用户名" v-if="!less900px"/>
            <el-table-column prop="email" label="邮箱" v-if="!less900px"/>
            <el-table-column label="管制权限" v-if="!less500px">
                <template #default="scope">
                    <el-space wrap>
                        <el-tag v-if="scope.row.tier2" type="success" round effect="dark">Tier2</el-tag>
                        <el-tag v-else type="danger" round effect="dark">Tier2</el-tag>
                        <el-tag class="level text-color-white border-none" round
                                :color="config.ratings[scope.row.rating + 1].color">
                            {{ serverConfig.getRatingShortName(scope.row.rating as number) }}
                        </el-tag>
                        <el-tag v-if="scope.row.under_solo" type="primary" effect="dark" round>Solo</el-tag>
                        <el-tag v-if="scope.row.guest" type="info" effect="dark" round>客座管制</el-tag>
                        <el-tag v-if="scope.row.under_monitor" type="warning" effect="dark" round>实习管制</el-tag>
                    </el-space>
                </template>
            </el-table-column>
            <el-table-column label="操作" v-if="!less400px">
                <template #default="scope">
                    <el-button :icon="EditPen" type="primary"
                               :disabled="!hasAnyEditPermission"
                               @click="showEditRatingDialog(scope.row.id)">
                        编辑
                    </el-button>
                </template>
            </el-table-column>
        </PageListCard>
        <PageListCard ref="controllerListCardRef" :fetch-data="fetchControllers" card-title="管制员总览" no-transform>
            <el-table-column label="CID" :width="less900px ? less400px ? '' : 60 : ''">
                <template #default="scope">
                    <el-space wrap class="flex align-items-center">
                        <span v-if="!less900px">
                            <el-avatar v-if="scope.row.avatar_url == ''">
                                {{ formatCid(scope.row.cid) }}
                            </el-avatar>
                            <el-avatar v-else :src="handleImageUrl(scope.row.avatar_url)"/>
                        </span>
                        <span>{{ formatCid(scope.row.cid) }}</span>
                        <el-space wrap v-if="less400px">
                            <el-button :icon="EditPen" type="success" size="small"
                                       @click="showEditRatingDialog(scope.row.id)"
                                       :disabled="!hasAnyEditPermission">
                                编辑权限
                            </el-button>
                            <el-button :icon="EditPen" type="primary" size="small"
                                       @click="router.push(`/admin/controllers/${scope.row.id}`)"
                                       :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ControllerShowRecord)">
                                编辑履历
                            </el-button>
                        </el-space>
                    </el-space>
                </template>
            </el-table-column>
            <el-table-column prop="username" label="用户名" v-if="!less900px"/>
            <el-table-column prop="email" label="邮箱" v-if="!less900px"/>
            <el-table-column label="管制权限" v-if="!less500px">
                <template #default="scope">
                    <el-space wrap>
                        <el-tag v-if="scope.row.tier2" type="success" round effect="dark">Tier2</el-tag>
                        <el-tag v-else type="danger" round effect="dark">Tier2</el-tag>
                        <el-tag class="level text-color-white border-none" round
                                :color="config.ratings[scope.row.rating + 1].color">
                            {{ serverConfig.getRatingShortName(scope.row.rating as number) }}
                        </el-tag>
                        <el-tag v-if="scope.row.under_solo" type="primary" effect="dark" round>Solo</el-tag>
                        <el-tag v-if="scope.row.guest" type="info" effect="dark" round>客座管制</el-tag>
                        <el-tag v-if="scope.row.under_monitor" type="warning" effect="dark" round>实习管制</el-tag>
                    </el-space>
                </template>
            </el-table-column>
            <el-table-column label="操作" v-if="!less400px">
                <template #default="scope">
                    <el-space wrap>
                        <el-button :icon="EditPen" type="success"
                                   @click="showEditRatingDialog(scope.row.id)"
                                   :disabled="!hasAnyEditPermission">
                            编辑权限
                        </el-button>
                        <el-button :icon="EditPen" type="primary"
                                   @click="router.push(`/admin/controllers/${scope.row.id}`)"
                                   :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ControllerShowRecord)">
                            编辑履历
                        </el-button>
                    </el-space>
                </template>
            </el-table-column>
        </PageListCard>
    </el-space>
    <FormDialog ref="editRatingDialogRef"
                class="a"
                title="修改管制权限"
                @dialog-confirm-event="confirmUpdateRating()"
                :width="300">
        <el-form :model="userInfo">
            <el-form-item label="CID">
                <el-input :placeholder="formatCid(userInfo.cid)" disabled/>
            </el-form-item>
            <el-form-item label="管制权限">
                <el-select v-model.number="userInfo.rating" :options="config.ratings"
                           :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ControllerEditRating)"/>
            </el-form-item>
            <el-form-item label="客座管制">
                <el-switch v-model="userInfo.guest"
                           :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ControllerChangeGuest)"/>
            </el-form-item>
            <el-form-item label="UM权限" v-if="!userInfo.guest">
                <el-switch v-model="userInfo.under_monitor"
                           :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ControllerChangeUnderMonitor)"/>
            </el-form-item>
            <el-form-item label="Solo权限" v-if="!userInfo.guest">
                <el-switch v-model="userInfo.under_solo"
                           :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ControllerChangeSolo)"/>
            </el-form-item>
            <el-form-item label="Solo直至" v-if="!userInfo.guest && userInfo.under_solo">
                <el-date-picker type="datetime" v-model="userInfo.solo_until"
                                :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ControllerChangeSolo)"/>
            </el-form-item>
            <el-form-item label="Tier2权限">
                <el-switch v-model="userInfo.tier2"
                           :disabled="!userStore.permission.hasPermissionNode(PermissionNode.ControllerTier2Rating)"/>
            </el-form-item>
        </el-form>
    </FormDialog>
</template>

<style scoped>

</style>