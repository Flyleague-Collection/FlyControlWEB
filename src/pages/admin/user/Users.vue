<script setup lang="ts">
import {useRouter} from "vue-router";
import {useUserStore} from "@/store/user.js";
import {onMounted, reactive, ref} from "vue";
import {showError, showSuccess} from "@/utils/message.js";
import {Check, Close, EditPen} from "@element-plus/icons-vue";
import {useServerConfigStore} from "@/store/server_config.js";
import {cloneDeep} from "lodash";
import {FormInstance, FormRules} from "element-plus";
import request from "@/utils/request.js";

const router = useRouter();
const userStore = useUserStore();
const users = ref<UserModel[]>([]);
const serverConfig = useServerConfigStore();

const pageSize = ref(20);
const page = ref(1);
const total = ref(0);

const fetchPageData = async () => {
    const data = await userStore.getUserPage(page.value, pageSize.value)
    if (data == null) {
        showError("用户数据加载失败")
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

const userData = ref<UserModel>({} as UserModel);
let userId = 0;
const showUserEditDialog = ref(false);
const userEditFormRef = ref<FormInstance>()

const rules = reactive<FormRules>({
    username: [{required: true, message: "用户名不能为空", trigger: "blur"}],
    email: [
        {required: true, message: "邮箱不能为空", trigger: "blur"},
        {type: "email", message: "邮箱格式错误", trigger: "blur"}
    ]
})

const showDialog = (id: number) => {
    userId = id;
    userEditFormRef.value?.clearValidate()
    userData.value = cloneDeep(users.value[id]);
    userData.value["password"] = ""
    showUserEditDialog.value = true;
}

const saveUserProfile = async () => {
    try {
        await userEditFormRef.value?.validate()
    } catch {
        showError("表单验证失败")
        return
    }
    const oldValue = users.value[userId];
    const data: Record<string, string | number> = {};
    if (oldValue.username != userData.value.username) {
        data['username'] = userData.value.username;
    }
    if (oldValue.email != userData.value.email) {
        data['email'] = userData.value.email;
    }
    if (oldValue.qq != userData.value.qq) {
        data["qq"] = userData.value.qq
    }
    if (userData.value["password"] != "") {
        data['new_password'] = userData.value["password"];
    }
    if (Object.keys(data).length == 0) {
        showError("没有需要修改的内容")
        return
    }
    const response = await request.patch(`/users/${oldValue.id}/profile`, data)
    if (response.status == 200) {
        showSuccess("编辑用户信息成功")
        await fetchPageData()
        showUserEditDialog.value = false;
    }
}

onMounted(async () => {
    await fetchPageData()
    userData.value = users.value[0]
    userData.value["password"] = ""
})
</script>


<template>
    <el-card footer-class="flex justify-content-center">
        <template #header>
            <div class="flex align-items-center">
                <span>用户总览</span>
            </div>
        </template>
        <el-table :data="users">
            <el-table-column prop="cid" label="CID"></el-table-column>
            <el-table-column prop="username" label="用户名"></el-table-column>
            <el-table-column prop="email" label="邮箱"></el-table-column>
            <el-table-column label="管制权限">
                <template #default="scope">
                    {{ serverConfig.ratings[scope.row.rating + 1].short_name }}
                </template>
            </el-table-column>
            <el-table-column prop="permission" label="飞控权限"></el-table-column>
            <el-table-column label="操作">
                <template #default="scope">
                    <div id="activity-option-container" class="flex">
                        <el-button id="activity-option-edit-btn" :icon="EditPen" type="primary"
                                   @click="showDialog(scope.$index)">
                            编辑
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
    <el-dialog v-model="showUserEditDialog" :close-on-click-modal="false" :show-close="false"
               :close-on-press-escape="false">
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
            <el-form-item label="密码">
                <el-input v-model="userData.password" type="password"/>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="flex justify-content-flex-end">
                <el-button type="success" dark :icon="Check" @click="saveUserProfile">保存</el-button>
                <el-button type="danger" dark :icon="Close" @click="showUserEditDialog = false">取消</el-button>
            </div>
        </template>
    </el-dialog>
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