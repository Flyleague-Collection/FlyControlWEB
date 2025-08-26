<script setup lang="ts">
import Sidebar from "@/components/Sidebar.vue";
</script>

<template>
    <el-container class="outside-layout">
        <el-aside class="sidebar">
            <Sidebar/>
        </el-aside>
        <el-main class="main">
            <router-view></router-view>
        </el-main>
    </el-container>
</template>

<style scoped>
.main {
    margin: 0 10px;
}

.sidebar {
    display: flex;
    flex-direction: column;
    width: auto;
    border-right: 1px solid var(--el-menu-border-color);
}

.outside-layout {
    height: 100%;
    width: 100%;
}
</style>
