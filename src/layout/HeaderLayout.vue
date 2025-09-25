<script setup lang="ts">
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
</script>

<template>
    <el-container class="w-full h-full flex align-items-center">
        <el-header class="w-full">
            <Header/>
        </el-header>
        <el-main class="main">
            <router-view></router-view>
        </el-main>
        <el-footer class="flex align-items-center">
            <Footer/>
        </el-footer>
    </el-container>
</template>

<style scoped>
.el-header {
    --el-header-padding: 0px;
}

.el-footer {
    --el-footer-height: auto;
    width: 100vw;
    border-top: 1px solid var(--el-border-color);
}

.main {
    flex-grow: 1;
    display: flex;
    width: 100%;
}
</style>