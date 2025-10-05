<script setup lang="ts">
import {FormInstance, FormRules} from "element-plus";
import {EditPen} from "@element-plus/icons-vue";
import {cloneDeep} from "lodash";
import {computed, reactive, Ref, ref} from "vue";

import ApiUser from "@/api/user.js";
import type {PageListCardInstance, PageListResponse} from "@/components/card/PageListCard.js";
import PageListCard from "@/components/card/PageListCard.vue";
import type {FormDialogInstance} from "@/components/dialog/FormDialog.js";
import FormDialog from "@/components/dialog/FormDialog.vue";
import config from "@/config/index.js";
import {useServerConfigStore} from "@/store/server_config.js";
import {useUserStore} from "@/store/user.js";
import {showError, showSuccess, showWarning} from "@/utils/message.js";
import {PermissionNode} from "@/utils/permission.js";
import {formatCid} from "@/utils/utils.js";

const userStore = useUserStore();
const serverConfig = useServerConfigStore();

const fetchUsers = async (page: number, pageSize: number): Promise<PageListResponse<UserModel>> => {
    const result: PageListResponse<UserModel> = {data: [], total: 0}
    const data = await ApiUser.getUserPage(page, pageSize);
    if (data != null) {
        result.data = data.items;
        result.total = data.total;
    }
    return result;
}

type FullUserModel = UserModel & { password: string }

let oldUserData: Nullable<UserModel> = null;
const userData: Ref<FullUserModel> = ref({} as FullUserModel);
const userEditDialogRef: Ref<FormDialogInstance> = ref();

const rules = reactive<FormRules>({
    username: [
        {required: true, message: "用户名不能为空", trigger: "blur"},
        ...serverConfig.usernameLimit
    ],
    email: [
        {required: true, message: "邮箱不能为空", trigger: "blur"},
        ...serverConfig.emailLimit
    ],
    password: [
        ...serverConfig.passwordLimit
    ]
})

const showEditUserProfileDialog = async (id: number) => {
    const user = await ApiUser.getUserByUid(id);
    if (user == null) {
        return;
    }
    oldUserData = cloneDeep(user);
    userData.value = user as FullUserModel;
    userData.value.password = "";
    userEditDialogRef.value?.show();
}

const pageListCardRef: Ref<PageListCardInstance> = ref(null);
const userEditFormRef = ref<FormInstance>();
const canEditBaseInfo = computed(() => userStore.permission.hasPermissionNode(PermissionNode.UserEditBaseInfo));
const canEditPassword = computed(() => userStore.permission.hasPermissionNode(PermissionNode.UserSetPassword));
const hasAnyEditPermission = computed(() => canEditBaseInfo.value | canEditPassword.value);

const updateUserProfile = async () => {
    if (!hasAnyEditPermission.value) {
        showError("你无权这么做");
        return;
    }
    if (oldUserData == null) {
        showError("原始用户数据出错");
        return;
    }
    userEditFormRef.value?.clearValidate();
    const data: UpdateUserProfileData = {};
    if (userStore.permission.hasPermissionNode(PermissionNode.UserEditBaseInfo)) {
        if (userData.value.username != "" && oldUserData.username != userData.value.username) {
            try {
                await userEditFormRef.value?.validateField("username");
            } catch {
                showError("表单验证失败");
                return;
            }
            data.username = userData.value.username;
        }
        if (userData.value.email != "" && oldUserData.email != userData.value.email) {
            try {
                await userEditFormRef.value?.validateField("email");
            } catch {
                showError("表单验证失败");
                return;
            }
            data.email = userData.value.email;
        }
        if (userData.value.qq != 0 && oldUserData.qq != userData.value.qq) {
            data.qq = userData.value.qq;
        }
    }
    if (userStore.permission.hasPermissionNode(PermissionNode.UserSetPassword) && userData.value.password != "") {
        data.new_password = userData.value.password;
    }
    if (Object.keys(data).length == 0) {
        showWarning("没有需要修改的内容");
        return;
    }
    const response = await ApiUser.updateUserInformation(oldUserData.id, data);
    if (response != null) {
        showSuccess("编辑用户信息成功");
        await pageListCardRef.value?.flushData();
        userEditDialogRef.value?.hide();
    }
}
</script>

<template>
    <PageListCard ref="pageListCardRef" :fetch-data="fetchUsers" card-title="用户总览" no-transform>
        <el-table-column label="CID">
            <template #default="scope">
                <div class="flex align-items-center">
                    <el-avatar v-if="scope.row.avatar_url == ''">{{ formatCid(scope.row.cid) }}</el-avatar>
                    <el-avatar v-else :src="scope.row.avatar_url"></el-avatar>
                    <span class="margin-left-5">{{ formatCid(scope.row.cid) }}</span>
                </div>
            </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名"/>
        <el-table-column prop="email" label="邮箱"/>
        <el-table-column label="管制权限">
            <template #default="scope">
                <el-tag v-if="scope.row.tier2" type="success" round effect="dark">Tier2</el-tag>
                <el-tag v-else type="danger" round effect="dark">Tier2</el-tag>
                <el-tag class="level text-color-white border-none margin-left-5" round
                        :color="config.ratings[scope.row.rating + 1].color">
                    {{ serverConfig.getRatingShortName(scope.row.rating) }}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="permission" label="飞控权限"></el-table-column>
        <el-table-column label="操作">
            <template #default="scope">
                <div id="user-option-container" class="flex">
                    <el-button id="user-option-edit-btn"
                               :icon="EditPen"
                               type="primary"
                               @click="showEditUserProfileDialog(scope.row.id)"
                               :disabled="!hasAnyEditPermission">
                        编辑
                    </el-button>
                </div>
            </template>
        </el-table-column>
    </PageListCard>
    <FormDialog ref="userEditDialogRef" title="编辑用户信息" @dialog-confirm-event="updateUserProfile()" :width="400">
        <el-form :model="userData" :rules="rules" ref="userEditFormRef">
            <el-form-item label="CID">
                <el-input v-model.number="userData.cid" disabled/>
            </el-form-item>
            <el-form-item label="用户名" prop="username" v-if="canEditBaseInfo">
                <el-input v-model="userData.username"/>
            </el-form-item>
            <el-form-item label="邮箱" prop="email" v-if="canEditBaseInfo">
                <el-input v-model="userData.email"/>
            </el-form-item>
            <el-form-item label="QQ" v-if="canEditBaseInfo">
                <el-input v-model.number="userData.qq"/>
            </el-form-item>
            <el-form-item label="密码" prop="password" v-if="canEditPassword">
                <el-input v-model="userData.password" type="password"
                          :disable="userStore.permission.hasPermissionNode(PermissionNode.UserSetPassword)"/>
            </el-form-item>
        </el-form>
    </FormDialog>
</template>

<style scoped>

</style>