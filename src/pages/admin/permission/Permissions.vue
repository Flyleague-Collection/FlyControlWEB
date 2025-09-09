<script setup lang="ts">
import {
    Checked,
    CircleCheck,
    CircleCheckFilled,
    CircleClose,
    CircleCloseFilled,
    Close,
    EditPen
} from "@element-plus/icons-vue";
import {useRouter} from "vue-router";
import {useUserStore} from "@/store/user.js";
import {onMounted, ref} from "vue";
import {useServerConfigStore} from "@/store/server_config.js";
import {showError} from "@/utils/message.js";
import {Permission} from "@/utils/permission.js";

const router = useRouter();
const userStore = useUserStore();
const users = ref<UserModel[]>([]);
const serverConfig = useServerConfigStore();

const pageSize = ref(20);
const page = ref(1);
const total = ref(0);

const pageChange = async (value: number) => {
    page.value = value;
    await fetchPageData()
}

const pageSizeChange = async (value: number) => {
    pageSize.value = value;
    await fetchPageData()
}

const fetchPageData = async () => {
    const data = await userStore.getUserPage(page.value, pageSize.value)
    if (data == null) {
        showError("用户数据加载失败")
        return
    }

    users.value = data.items
    total.value = data.total
}

onMounted(async () => {
    await fetchPageData()
})
</script>

<template>
    <el-card footer-class="flex justify-content-center">
        <template #header>
            <div class="flex align-items-center">
                <span>用户权限一览</span>
            </div>
        </template>
        <el-table :data="users" @row-dblclick="(row, _, __) => router.push(`/admin/permissions/${row.id}`)">
            <el-table-column type="expand">
                <template #default="props">
                    <el-table :data="Object.values(new Permission(props.row.permission).getPermissionsRecord())">
                        <el-table-column prop="name" label="权限节点名"/>
                        <el-table-column prop="desc" label="权限节点描述"/>
                        <el-table-column label="拥有该权限">
                            <template #default="scope">
                                <el-icon v-if="scope.row.hasPermission" color="#67c23a" :size="20">
                                    <CircleCheckFilled/>
                                </el-icon>
                                <el-icon v-else color="#f56c6c" :size="20">
                                    <CircleCloseFilled/>
                                </el-icon>
                            </template>
                        </el-table-column>
                    </el-table>
                </template>
            </el-table-column>
            <el-table-column prop="cid" label="CID"/>
            <el-table-column prop="username" label="用户名"/>
            <el-table-column prop="email" label="邮箱"/>
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button :icon="EditPen" type="primary" dark
                               @click="router.push(`/admin/permissions/${scope.row.id}`)">编辑
                    </el-button>
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

</style>