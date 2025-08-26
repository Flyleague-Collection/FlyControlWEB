<script setup lang="ts">
import {UserFilled} from "@element-plus/icons-vue";
import config from "@/config/index.js";
import {useAuthStore} from "@/store/auth.js";
import {useServerConfigStore} from "@/store/server_config.js";

defineProps({
    expend: {
        type: Boolean,
        default: true,
        required: true
    }
})

const authStore = useAuthStore();
const serverConfigStore = useServerConfigStore();
</script>

<template>
    <div class="person-card">
        <el-avatar v-if="authStore.avatarUrl != ''" :src="authStore.avatarUrl"></el-avatar>
        <el-avatar v-else>{{ authStore.cid }}</el-avatar>
        <Transition>
            <div class="user-info" v-if="expend">
                <span class="username">{{ authStore.username }}</span>
                <el-tag class="level text-color-white border-none" size="large" round
                        :color="config.rating_color[authStore.rating]">
                    {{ serverConfigStore.ratings[authStore.rating + 1].short_name }}
                </el-tag>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.username {
    font-size: 20px;
    font-weight: bold;
}

.level {
    font-size: 15px;
    padding: 0 10px;
}

.person-card {
    display: flex;
    overflow: hidden;
    height: 50px;
}

.person-card > * {
    margin: 5px 0;
}

.user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-left: 10px;
}

.v-enter-active,
.v-leave-active {
    transition: width 0.3s ease-out;
    opacity: 0;
}

.v-enter-to,
.v-leave-from {
    width: 200px;
    opacity: 0;
}

.v-enter-from,
.v-leave-to {
    width: 0;
    opacity: 0;
}
</style>