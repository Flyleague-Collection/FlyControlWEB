<script setup lang="ts">
import {Delete, EditPen} from "@element-plus/icons-vue";
import {useRouter} from "vue-router";
import {useUserStore} from "@/store/user.js";
import {onMounted, ref} from "vue";
import {useServerConfigStore} from "@/store/server_config.js";
import {showError} from "@/utils/message.js";

const router = useRouter();
const userStore = useUserStore();
const users = ref<UserModel[]>([]);
const serverConfig = useServerConfigStore();

const pageSize = ref(20);
const page = ref(1);
const total = ref(0);

const fetchPageData = async () => {
    const data = await userStore.getControllerPage(page.value, pageSize.value)
    if (data == null) {
        showError("管制员数据加载失败")
        return
    }

    users.value = data.items
    total.value = data.total

    console.log(data.items)
}

const pageChange = async (value: number) => {
    page.value = value;
    await fetchPageData()
}

const pageSizeChange = async (value: number) => {
    pageSize.value = value;
    await fetchPageData()
}

onMounted(async () => {
    await fetchPageData()
})
</script>

<template>
    <el-card footer-class="flex justify-content-center">
        <template #header>
            <div class="flex align-items-center">
                <span>管制员总览</span>
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
                        <el-button id="activity-option-edit-btn" :icon="EditPen" type="primary">
                            编辑
                        </el-button>
                        <el-button id="activity-option-delete-btn" :icon="Delete" type="danger">
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