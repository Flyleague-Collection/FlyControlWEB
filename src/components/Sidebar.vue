<script setup lang="ts">
import config from "@/config/index.js";
import {
    Calendar,
    DocumentChecked,
    HomeFilled,
    MapLocation,
    Operation,
    Setting,
    UserFilled
} from "@element-plus/icons-vue";
import PersonCard from "@/components/card/PersonCard.vue";
import {ref} from "vue";
import {useUserStore} from "@/store/user.js";

const menuExpend = ref(false);

const userStore = useUserStore();

const mql = window.matchMedia("(max-width: 1000px)");

mql.onchange = (e) => {
    if (e.matches && menuExpend.value) {
        menuExpend.value = false;
    }
}
</script>

<template>
    <el-menu default-active="2"
             class="menu"
             :collapse="!menuExpend"
             :close-on-click-outside="true"
             :unique-opened="true"
             :router="true">
        <el-menu-item
            style="color: var(--el-menu-text-color); user-select: none; padding-left: 6px"
            @click="menuExpend=!menuExpend">
            <div class="flex align-items-center">
                <img class="margin-left-5 margin-right-5" :src="config.icon_path" alt="Icon"/>
                <div class="title padding-left-5 padding-right-5" v-if="menuExpend">
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
        <el-menu-item index="/ticket">
            <el-icon>
                <DocumentChecked/>
            </el-icon>
            <span>投诉与反馈中心</span>
        </el-menu-item>
        <el-sub-menu index="/controllers">
            <template #title>
                <el-icon>
                    <Operation/>
                </el-icon>
                <span>管制员中心</span>
            </template>
            <el-menu-item index="/controllers/application">管制员申请</el-menu-item>
            <el-menu-item index="/controllers/activity" v-if="userStore.userData.rating > 1">活动登记</el-menu-item>
            <el-menu-item index="/controllers/booking" v-if="userStore.userData.rating > 1">考核预约</el-menu-item>
            <el-menu-item index="/controllers/profile" v-if="userStore.userData.rating > 1">管制员档案</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="/admin" v-if="userStore.userData.permission & 1 == 1">
            <template #title>
                <el-icon>
                    <Setting/>
                </el-icon>
                <span>管理员中心</span>
            </template>
            <el-menu-item index="/admin/users">用户管理</el-menu-item>
            <el-menu-item index="/admin/controllers">管制员管理</el-menu-item>
            <el-menu-item index="/admin/activities">活动管理</el-menu-item>
            <el-menu-item index="/admin/tickets">工单管理</el-menu-item>
            <el-menu-item index="/admin/permissions">权限管理</el-menu-item>
            <el-menu-item index="/admin/audit">审计日志</el-menu-item>
        </el-sub-menu>
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
</template>

<style scoped>
.person {
    margin: 10px;
}

.el-menu {
    border-right: none;
}

.menu {
    flex-grow: 1;
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