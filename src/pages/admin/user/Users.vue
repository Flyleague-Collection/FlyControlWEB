<script setup lang="ts">
import {cloneDeep} from "lodash";
import {FormInstance, FormRules} from "element-plus";
import {Check, Close, EditPen} from "@element-plus/icons-vue";
import {reactive, Ref, ref} from "vue";

import PageListCard from "@/components/card/PageListCard.vue";
import type {PageListCardInstance, PageListResponse} from "@/components/card/PageListCard.js";
import ConfirmDialog from "@/components/dialog/ConfirmDialog.vue";
import type {ConfirmDialogInstance} from "@/components/dialog/ConfirmDialog.js";
import {useUserStore} from "@/store/user.js";
import {useServerConfigStore} from "@/store/server_config.js";
import {showError, showSuccess, showWarning} from "@/utils/message.js";
import config from "@/config/index.js";

const userStore = useUserStore();
const serverConfig = useServerConfigStore();

const fetchUsers = async (page: number, pageSize: number): Promise<PageListResponse<UserModel>> => {
    const result: PageListResponse<UserModel> = {data: [], total: 0}
    const data = await userStore.getUserPage(page, pageSize)
    if (data == null) {
        showError("用户数据加载失败")
    } else {
        result.data = data.items
        result.total = data.total
    }
    return result;
}

let oldUserData: UserModel | null = null;
const userData: Ref<UserModel & { password: string }> = ref({} as UserModel & { password: string });
const showUserEditDialog: Ref<boolean> = ref(false);

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
    const user = await userStore.getUserByUid(id)
    if (user == null) {
        return
    }
    oldUserData = cloneDeep(user);
    userData.value = user as UserModel & { password: string }
    userData.value.password = ""
    showUserEditDialog.value = true
}

const pageListCardRef: Ref<PageListCardInstance> = ref(null)
const userEditFormRef = ref<FormInstance>()

const updateUserProfile = async () => {
    if (oldUserData == null) {
        showError("原始用户数据出错")
        return
    }
    userEditFormRef.value?.clearValidate()
    const data: RequestUpdateUserProfile = {};
    if (userData.value.username != "" && oldUserData.username != userData.value.username) {
        try {
            await userEditFormRef.value?.validateField("username")
        } catch {
            showError("表单验证失败")
            return
        }
        data.username = userData.value.username;
    }
    if (userData.value.email != "" && oldUserData.email != userData.value.email) {
        try {
            await userEditFormRef.value?.validateField("email")
        } catch {
            showError("表单验证失败")
            return
        }
        data.email = userData.value.email;
    }
    if (userData.value.qq != 0 && oldUserData.qq != userData.value.qq) {
        data.qq = userData.value.qq
    }
    if (userData.value.password != "") {
        data.new_password = userData.value.password;
    }
    if (Object.keys(data).length == 0) {
        showWarning("没有需要修改的内容")
        return
    }
    const response = await userStore.updateUserInformation(oldUserData.id, data)
    if (response != null) {
        showSuccess("编辑用户信息成功")
        await pageListCardRef.value?.flushData()
        showUserEditDialog.value = false;
    }
}

const confirmDialogRef: Ref<ConfirmDialogInstance> = ref(null)

const confirmExit = () => {
    confirmDialogRef.value?.show()
}

const exit = () => {
    showUserEditDialog.value = false
}
</script>

<template>
    <PageListCard ref="pageListCardRef"
                  :fetch-data="fetchUsers"
                  card-title="用户总览"
                  :double-click-row="row => showEditUserProfileDialog(row.id)">
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
        <el-table-column prop="permission" label="飞控权限"></el-table-column>
        <el-table-column label="操作">
            <template #default="scope">
                <div id="user-option-container" class="flex">
                    <el-button id="user-option-edit-btn"
                               :icon="EditPen"
                               type="primary"
                               @click="showEditUserProfileDialog(scope.row.id)">
                        编辑
                    </el-button>
                </div>
            </template>
        </el-table-column>
    </PageListCard>
    <el-dialog v-model="showUserEditDialog"
               :close-on-click-modal="false"
               :show-close="false"
               :close-on-press-escape="false"
               :align-center="true">
        <template #header>
            编辑用户信息
        </template>
        <el-form :model="userData" :rules="rules" ref="userEditFormRef">
            <el-form-item label="CID">
                <el-input v-model.number="userData.cid" disabled/>
            </el-form-item>
            <el-form-item label="用户名" prop="username">
                <el-input v-model="userData.username"/>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="userData.email"/>
            </el-form-item>
            <el-form-item label="QQ">
                <el-input v-model.number="userData.qq"/>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="userData.password" type="password"/>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="flex justify-content-flex-end">
                <el-button type="success" dark :icon="Check" @click="updateUserProfile()">保存</el-button>
                <el-button type="danger" dark :icon="Close" @click="confirmExit()">取消</el-button>
            </div>
        </template>
    </el-dialog>
    <ConfirmDialog ref="confirmDialogRef"
                   header-content="确认退出"
                   body-content="未保存的操作会丢失, 确认退出吗？"
                   @confirm-event="exit()"/>
</template>

<style scoped>
.el-card {
    transform: none;
}

@media (max-width: 1105px) {
    #user-option-container {
        flex-direction: column;
    }

    #user-option-edit-btn {
        margin-bottom: 10px;
    }
}
</style>