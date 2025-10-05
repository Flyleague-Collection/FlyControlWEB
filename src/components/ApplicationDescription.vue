<script setup lang="ts">
import {formatCid} from "@/utils/utils.js";

defineProps<{ application?: ControllerApplicationModel, title?: string }>();
</script>

<template>
    <el-descriptions class="information" :column="1" border :title="title ? title : '提交的申请信息'">
        <el-descriptions-item label="申请ID">
            {{ application?.id }}
        </el-descriptions-item>
        <el-descriptions-item label="CID">
            {{ formatCid(application?.user.cid) }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
            {{ application?.user.email }}
        </el-descriptions-item>
        <el-descriptions-item label="为什么想成为管制员">
            {{ application?.why_want_to_be_controller }}
        </el-descriptions-item>
        <el-descriptions-item label="管制经历">
            {{ application?.controller_record }}
        </el-descriptions-item>
        <el-descriptions-item label="客座管制">
            <el-tag type="success" v-if="application?.is_guest">是</el-tag>
            <el-tag type="danger" v-else>否</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="客座平台" v-if="application?.is_guest">
            {{ application?.platform }}
        </el-descriptions-item>
        <el-descriptions-item label="佐证材料" v-if="application?.is_guest">
            <el-image :src="application?.evidence">
                <template #error>
                    <el-tag type="danger" effect="dark">图片加载失败</el-tag>
                </template>
            </el-image>
        </el-descriptions-item>
    </el-descriptions>
</template>

<style scoped>
.information {
    margin: 0 20%;
}

@media (max-width: 600px) {
    .information {
        margin: 0;
    }
}
</style>