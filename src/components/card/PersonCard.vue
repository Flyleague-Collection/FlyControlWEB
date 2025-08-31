<script setup lang="ts">
import config from "@/config/index.js";
import {useUserStore} from "@/store/user.js";
import {useServerConfigStore} from "@/store/server_config.js";

defineProps({
    expend: {
        type: Boolean,
        default: true,
        required: true
    }
})

const userStore = useUserStore();
const serverConfigStore = useServerConfigStore();

const userData = userStore.userData;
</script>

<template>
    <div class="person-card">
        <el-avatar v-if="userData.avatar_url != ''" :src="userData.avatar_url"></el-avatar>
        <el-avatar v-else>{{ userData.cid }}</el-avatar>
        <Transition>
            <div class="user-info" v-if="expend">
                <span class="username">{{ userData.username }}</span>
                <el-tag class="level text-color-white border-none" size="large" round
                        :color="config.rating_color[userData.rating]">
                    {{ serverConfigStore.ratings[userData.rating + 1].short_name }}
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