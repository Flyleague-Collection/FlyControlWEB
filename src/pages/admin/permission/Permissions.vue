<script setup lang="ts">
import {CircleCheckFilled, CircleCloseFilled, EditPen} from "@element-plus/icons-vue";
import {useRouter} from "vue-router";
import {useUserStore} from "@/store/user.js";
import {showError} from "@/utils/message.js";
import {Permission, PermissionNode} from "@/utils/permission.js";
import type {PageListResponse} from "@/components/card/PageListCard.js";
import PageListCard from "@/components/card/PageListCard.vue";
import {formatCid} from "@/utils/utils.js";

const router = useRouter();
const userStore = useUserStore();

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
</script>

<template>
    <PageListCard :fetch-data="fetchUsers" card-title="用户权限一览">
        <el-table-column type="expand">
            <template #default="props">
                <el-table :data="Object.values(new Permission(BigInt(props.row.permission)).getPermissionsRecord())">
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
        <el-table-column label="CID">
            <template #default="scope">
                {{ formatCid(scope.row.cid) }}
            </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名"/>
        <el-table-column prop="email" label="邮箱"/>
        <el-table-column label="操作">
            <template #default="scope">
                <el-button :icon="EditPen" type="primary" dark
                           @click="router.push(`/admin/permissions/${scope.row.id}`)"
                           :disabled="!userStore.permission.hasPermissionNode(PermissionNode.UserEditPermission)">
                    编辑
                </el-button>
            </template>
        </el-table-column>
    </PageListCard>
</template>

<style scoped>

</style>