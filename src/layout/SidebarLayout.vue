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
.el-container {
    transition: background-color 0.5s ease-in-out;
    background: rgba(255, 255, 255, 0.8) url("/images/background.png") no-repeat center center;
    background-size: cover;
    background-blend-mode: overlay;
}

.dark .el-container {
    background: rgba(0, 0, 0, 0.8) url("/images/background.png") no-repeat center center;
    background-size: cover;
    background-blend-mode: overlay;
}

.main {
    margin: 0 10px;
}

.sidebar {
    display: flex;
    flex-direction: column;
    width: auto;
    border-right: 1px solid var(--el-menu-border-color);
    backdrop-filter: blur(10px);
    background-image: linear-gradient(45deg, rgba(66, 60, 90, 0.15), rgba(66, 60, 90, 0.15));
}

.outside-layout {
    height: 100%;
    width: 100%;
}
</style>
