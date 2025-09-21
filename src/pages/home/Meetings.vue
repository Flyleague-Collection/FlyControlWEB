<script setup lang="ts">
import {homeConfig} from "@/config/index.js";
</script>

<template>
    <div class="container">
        <span class="title">会议记录</span>
        <el-table :data="homeConfig.meetings">
            <el-table-column label="文件名" prop="name"/>
            <el-table-column label="详细内容">
                <template #default="scope">
                    <a :href="scope.row.file_url" target="_blank">
                        {{ scope.row.file_display_name }}
                    </a>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<style scoped lang="scss">
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    flex-grow: 1;

    .title {
        font-size: 2.5rem;
        font-weight: 600;
        color: $color-primary;
        margin-bottom: 40px;
    }

    .el-table {
        width: 60%;
        font-size: large;
    }
}
</style>