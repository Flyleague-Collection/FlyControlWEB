<script setup lang="ts">
import config from "@/config/index.js";
import {HomeFilled, Calendar, MapLocation, UserFilled, Setting, Operation} from "@element-plus/icons-vue";
import {ref} from "vue";
import PersonCard from "@/components/PersonCard.vue";

const menuExpend = ref(true);

const mql = window.matchMedia("(max-width: 1000px)");

mql.onchange = (e) => {
    if (e.matches && menuExpend.value) {
        menuExpend.value = false;
    }
}
</script>

<template>
    <div class="common-layout">
        <el-container class="outside-layout">
            <el-aside class="sidebar">
                <el-menu default-active="2"
                         class="menu"
                         :collapse="!menuExpend"
                         :close-on-click-outside="true"
                         :unique-opened="true"
                         :router="true">
                    <el-menu-item
                        style="color: var(--el-menu-text-color); user-select: none; padding-left: 6px"
                        @click="menuExpend=!menuExpend">
                        <div class="header">
                            <img :src="config.icon_path" alt="Icon"/>
                            <div class="title" v-if="menuExpend">
                                {{ config.title }}
                            </div>
                        </div>
                    </el-menu-item>
                    <el-menu-item index="/home">
                        <el-icon>
                            <HomeFilled/>
                        </el-icon>
                        <span>首页</span>
                    </el-menu-item>
                    <el-menu-item index="/activities">
                        <el-icon>
                            <Calendar/>
                        </el-icon>
                        <span>连飞活动</span>
                    </el-menu-item>
                    <el-menu-item index="/online-map">
                        <el-icon>
                            <MapLocation/>
                        </el-icon>
                        <span>在线地图</span>
                    </el-menu-item>
                    <el-menu-item index="/controller">
                        <el-icon>
                            <Operation/>
                        </el-icon>
                        <span>管制员中心</span>
                    </el-menu-item>
                    <el-menu-item index="/admin">
                        <el-icon>
                            <Setting/>
                        </el-icon>
                        <span>管理员中心</span>
                    </el-menu-item>
                    <el-menu-item index="/profile">
                        <el-icon>
                            <UserFilled/>
                        </el-icon>
                        <span>个人中心</span>
                    </el-menu-item>
                </el-menu>
                <div class="person">
                    <PersonCard :expend="menuExpend"/>
                </div>
            </el-aside>
            <el-main class="main">
                <router-view></router-view>
            </el-main>
        </el-container>
    </div>
</template>

<style scoped>
.main {
    margin: 0 10px;
}

.person {
    margin: 10px;
}

.sidebar {
    display: flex;
    flex-direction: column;
    width: auto;
    border-right: 1px solid var(--el-menu-border-color);
}

.el-menu {
    border-right: none;
}

.menu {
    flex-grow: 1;
}

.common-layout {
    height: 100%;
    width: 100%;
}

.outside-layout {
    height: 100%;
    width: 100%;
}

.header {
    display: flex;
    align-items: center;
}

.header > * {
    padding: 0 5px;
}

.title {
    font-size: 1.3rem;
    font-weight: 200;
}

img {
    width: 40px;
    height: 40px;
}
</style>
