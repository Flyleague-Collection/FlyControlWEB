<script setup lang="ts">
import {CircleCheckFilled, CircleCloseFilled, EditPen} from "@element-plus/icons-vue";
import {useRouter} from "vue-router";

import ApiUser from "@/api/user.js";
import type {PageListResponse} from "@/components/card/PageListCard.js";
import PageListCard from "@/components/card/PageListCard.vue";
import {useReactiveWidth} from "@/composables/useReactiveWidth.js";
import {useUserStore} from "@/store/user.js";
import {Permission, PermissionNode} from "@/utils/permission.js";
import {formatCid} from "@/utils/utils.js";

const router = useRouter();
const userStore = useUserStore();

const fetchUsers = async (page: number, pageSize: number): Promise<PageListResponse<UserModel>> => {
    const result: PageListResponse<UserModel> = {data: [], total: 0}
    const data = await ApiUser.getUserPage(page, pageSize);
    if (data != null) {
        result.data = data.items;
        result.total = data.total;
    }
    return result;
}

const {less1000px, less800px, less600px, less500px} = useReactiveWidth();
</script>

<template>
    <PageListCard :fetch-data="fetchUsers" card-title="用户权限一览" no-transform>
        <el-table-column type="expand">
            <template #default="props">
                <el-table :data="Object.values(new Permission(BigInt(props.row.permission)).getPermissionsRecord())">
                    <el-table-column prop="name">
                        <template #header>
                            <el-space wrap>
                                <span>权限节点名</span>
                                <el-button :icon="EditPen" type="primary" dark size="small"
                                           @click="router.push(`/admin/permissions/${props.row.id}`)"
                                           v-if="less500px"
                                           :disabled="!userStore.permission.hasPermissionNode(PermissionNode.UserEditPermission)">
                                    编辑
                                </el-button>
                            </el-space>
                        </template>
                        <template #default="scope">
                            <span v-if="!less800px">{{ scope.row.name }}</span>
                            <el-tag v-else :type="scope.row.hasPermission ? 'success' : 'danger'">
                                {{ scope.row.name }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="desc" label="权限节点描述" v-if="!less600px"/>
                    <el-table-column label="拥有该权限" v-if="!less800px">
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
        <el-table-column prop="username" label="用户名" v-if="!less600px"/>
        <el-table-column prop="email" label="邮箱" v-if="!less1000px"/>
        <el-table-column label="操作" v-if="!less500px">
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