<script setup lang="ts">
import {onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {ArrowLeft, Check, Close} from "@element-plus/icons-vue";

import ConfirmDialog from "@/components/dialog/ConfirmDialog.vue";
import {useUserStore} from "@/store/user.js";
import {showSuccess, showWarning} from "@/utils/message.js";
import {Permission} from "@/utils/permission.js";
import request from "@/utils/request.js";
import AxiosXHR = Axios.AxiosXHR;
import {padStart} from "lodash-es";
import {formatCid} from "@/utils/utils.js";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const userModel = ref({} as UserModel);
const permission = ref(new Permission(0n));

const fetchUserData = async () => {
    loading.value = true;
    const data = await userStore.getUserByUid(route.params.id)
    if (data != null) {
        userModel.value = data
        permission.value = new Permission(BigInt(userModel.value.permission))
    }
    loading.value = false;
}

const changeMap: Record<string, boolean> = {}

const permissionChange = (permission: string, value: boolean) => {
    if (changeMap.hasOwnProperty(permission)) {
        if (changeMap[permission] != value) {
            delete changeMap[permission];
        }
    } else {
        changeMap[permission] = value;
    }
}

const changePermission = async () => {
    if (Object.keys(changeMap).length == 0) {
        showWarning("没有需要修改的权限")
        return
    }
    loading.value = true;
    const response = await request.patch(`/users/profiles/${route.params.id}/permission`, {permissions: changeMap}) as AxiosXHR<UserModel>;
    if (response.status == 200) {
        showSuccess("权限编辑成功")
        loading.value = false;
        exit()
    }
    loading.value = false;
}

const confirmExitDialog = ref(false);

const confirmExit = () => {
    if (Object.keys(changeMap).length == 0) {
        exit()
    } else {
        confirmExitDialog.value = true;
    }
}

const exit = () => {
    router.push(`/admin/permissions`)
}

onMounted(async () => {
    await fetchUserData()
})
</script>

<template>
    <el-card class="no-transform" footer-class="flex justify-content-flex-end">
        <template #header>
            <el-button :icon="ArrowLeft" text @click="confirmExit()"/>
            <span>编辑{{ formatCid(userModel.cid) }}的权限</span>
        </template>
        <el-table :data="Object.values(permission.getPermissionsRecord())">
            <el-table-column prop="name" label="权限节点名"/>
            <el-table-column prop="desc" label="权限节点描述"/>
            <el-table-column label="授予该权限">
                <template #default="scope">
                    <el-switch v-model="scope.row.hasPermission"
                               inline-prompt
                               :loading="loading"
                               :active-icon="Check"
                               :inactive-icon="Close"
                               @change="val => permissionChange(scope.row.name, val)"
                               v-if="userStore.permission.hasPermissionString(scope.row.name)"
                    />
                    <el-tag v-else effect="dark" type="danger">你没有该权限</el-tag>
                </template>
            </el-table-column>
        </el-table>
        <template #footer>
            <el-button type="success" :icon="Check" :loading="loading" dark @click="changePermission()">保存</el-button>
            <el-button type="danger" :icon="Close" :loading="loading" dark @click="confirmExit()">取消</el-button>
        </template>
    </el-card>
    <ConfirmDialog v-model="confirmExitDialog"
                   header-content="确认退出"
                   body-content="未保存的操作将会丢失, 确定退出吗？"
                   @confirm-event="exit()"
    />
</template>

<style scoped>

</style>