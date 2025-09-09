<script setup lang="ts">
import {useRouter} from "vue-router";
import {useUserStore} from "@/store/user.js";
import {Ref, ref} from "vue";
import {useServerConfigStore} from "@/store/server_config.js";
import {showError, showSuccess, showWarning} from "@/utils/message.js";
import type {PageListCardInstance, PageListResponse} from "@/components/card/PageListCard.js";
import {EditPen} from "@element-plus/icons-vue";
import PageListCard from "@/components/card/PageListCard.vue";
import FormDialog from "@/components/dialog/FormDialog.vue";
import type {FormDialogInstance} from "@/components/dialog/FormDialog.js";
import config from "@/config/index.js";
import {padEnd} from "lodash";
import request from "@/utils/request.js";
import AxiosXHR = Axios.AxiosXHR;

const router = useRouter();
const userStore = useUserStore();
const serverConfig = useServerConfigStore();

const fetchUsers = async (page: number, pageSize: number): Promise<PageListResponse<UserModel>> => {
    const result: PageListResponse<UserModel> = {data: [], total: 0};
    const data = await userStore.getUserPage(page, pageSize);
    if (data == null) {
        showError("用户数据加载失败");
    } else {
        result.data = data.items;
        result.total = data.total;
    }
    return result;
}

const fetchControllers = async (page: number, pageSize: number): Promise<PageListResponse<UserModel>> => {
    const result: PageListResponse<UserModel> = {data: [], total: 0};
    const data = await userStore.getControllerPage(page, pageSize);
    if (data == null) {
        showError("管制员数据加载失败");
    } else {
        result.data = data.items;
        result.total = data.total;
    }
    return result;
}

const editRatingDialogRef: Ref<FormDialogInstance> = ref(null);
const oldRating = ref(0);
const userInfo: Ref<UserModel> = ref({});

const showEditRatingDialog = async (id: number) => {
    const user = await userStore.getUserByUid(id)
    if (user == null) {
        return
    }
    userInfo.value = user;
    oldRating.value = user.rating;
    editRatingDialogRef.value?.show()
}

const userListCardRef: Ref<PageListCardInstance> = ref(null);
const controllerListCardRef: Ref<PageListCardInstance> = ref(null);

const confirmUpdateRating = async () => {
    if (oldRating.value == userInfo.value.rating) {
        showWarning("与原管制权限相同")
        return
    }
    const response = await request.put(`/users/${userInfo.value.id}/rating`, {rating: userInfo.value.rating}) as AxiosXHR<UserModel>
    if (response.status == 200) {
        showSuccess("编辑管制权限成功")
        editRatingDialogRef.value?.hide()
        userListCardRef.value?.flushData()
        controllerListCardRef.value?.flushData()
    }
}
</script>

<template>
    <PageListCard ref="userListCardRef"
                  :fetch-data="fetchUsers"
                  card-title="用户总览">
        <el-table-column prop="cid" label="CID"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column label="管制权限">
            <template #default="scope">
                <el-tag class="level text-color-white border-none" round
                        :color="config.rating_color[scope.row.rating]">
                    {{ serverConfig.getRatingShortName(scope.row.rating as number) }}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column label="操作">
            <template #default="scope">
                <el-button :icon="EditPen" type="primary" @click="showEditRatingDialog(scope.row.id)">
                    编辑
                </el-button>
            </template>
        </el-table-column>
    </PageListCard>
    <PageListCard ref="controllerListCardRef" :fetch-data="fetchControllers" card-title="管制员总览">
        <el-table-column prop="cid" label="CID"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column label="管制权限">
            <template #default="scope">
                <el-tag class="level text-color-white border-none" round
                        :color="config.rating_color[scope.row.rating]">
                    {{ serverConfig.getRatingShortName(scope.row.rating as number) }}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column label="操作">
            <template #default="scope">
                <el-button :icon="EditPen" type="primary" @click="showEditRatingDialog(scope.row.id)">
                    编辑
                </el-button>
            </template>
        </el-table-column>
    </PageListCard>
    <FormDialog ref="editRatingDialogRef" title="修改管制权限" @dialog-confirm-event="confirmUpdateRating()">
        <el-form :model="userInfo">
            <el-form-item label="CID">
                <el-input :placeholder="userInfo.cid.toString().padEnd(4, '0')" disabled/>
            </el-form-item>
            <el-form-item label="管制权限">
                <el-select v-model.number="userInfo.rating" :options="config.ratings"/>
            </el-form-item>
        </el-form>
    </FormDialog>
</template>

<style scoped>
.el-card {
    transform: none;
}
</style>