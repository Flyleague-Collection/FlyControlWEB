<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {useUserStore} from "@/store/user.js";
import {onMounted, ref} from "vue";
import request from "@/utils/request.js";
import AxiosXHR = Axios.AxiosXHR;
import {Permission} from "@/utils/permission.js";
import {
    ArrowLeft,
    Check,
    CircleCheck,
    CircleCheckFilled,
    CircleClose,
    CircleCloseFilled,
    Close
} from "@element-plus/icons-vue";
import ConfirmDialog from "@/components/dialog/ConfirmDialog.vue";
import {showError, showSuccess, showWarning} from "@/utils/message.js";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const userModel = ref({} as UserModel);
const permission = ref(new Permission(0));
const changeMap: Record<string, boolean> = {}

const fetchUserData = async () => {
    const response = await request.get(`/users/${route.params.id}/profile`) as AxiosXHR<UserModel>;
    if (response.status != 200) {
        return
    }
    userModel.value = response.data
    permission.value = new Permission(userModel.value.permission)
}

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
    const response = await request.patch(`/users/${route.params.id}/permission`, {permissions: changeMap}) as AxiosXHR<UserModel>;
    if (response.status == 200) {
        showSuccess("权限编辑成功")
        userModel.value = response.data
        permission.value = new Permission(userModel.value.permission)
    }
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
    <el-card footer-class="flex justify-content-flex-end">
        <template #header>
            <el-button :icon="ArrowLeft" text @click="confirmExit()"/>
            <span>编辑{{ userModel.cid }}的权限</span>
        </template>
        <el-table :data="Object.values(permission.getPermissionsRecord())">
            <el-table-column prop="name" label="权限节点名"/>
            <el-table-column prop="desc" label="权限节点描述"/>
            <el-table-column label="授予该权限">
                <template #default="scope">
                    <el-switch v-model="scope.row.hasPermission"
                               inline-prompt
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
            <el-button type="success" :icon="Check" dark @click="changePermission">保存</el-button>
            <el-button type="danger" :icon="Close" dark @click="confirmExit">取消</el-button>
        </template>
    </el-card>
    <ConfirmDialog v-model="confirmExitDialog"
                   header-content="确认退出"
                   body-content="未保存的操作将会丢失, 确定退出吗？"
                   @confirm-event="exit()"
    />
</template>

<style scoped>
.el-card {
    transform: none;
}
</style>