<script setup lang="ts">
import {useUserStore} from "@/store/user.js";
import {useRouter} from "vue-router";

const userStore = useUserStore();
const router = useRouter();
</script>

<template>
    <el-container>
        <el-header>
        </el-header>
        <el-main>
            <div class="flex flex-direction-column align-items-center">
                <span>如你所见, 这里应该是一个主页</span>
                <el-button v-if="userStore.isLogin" type="success" @click="router.push('/home')">进入飞控</el-button>
                <el-button v-else type="primary" @click="router.push('/login')">登录</el-button>
            </div>
        </el-main>
        <el-footer>
        </el-footer>
    </el-container>
</template>

<style scoped>

</style>