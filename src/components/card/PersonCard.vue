<script setup lang="ts">
import config from "@/config/index.js";
import {useUserStore} from "@/store/user.js";
import {useServerConfigStore} from "@/store/server_config.js";
import {padStart} from "lodash-es";

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
    <el-space class="person-card">
        <el-avatar v-if="userData.avatar_url != ''" :src="userData.avatar_url"></el-avatar>
        <el-avatar v-else>{{ padStart(userData.cid, 4, '0') }}</el-avatar>
        <Transition>
            <el-space direction="vertical" v-if="expend">
                <span class="username">{{ userData.username }}</span>
                <el-space>
                    <el-tag class="border-none" effect="dark"
                            :color="config.ratings[userData.rating + 1].color">
                        {{ serverConfigStore.ratings[userData.rating + 1].short_name }}
                    </el-tag>
                    <el-tag v-if="userData.tier2" type="success" effect="dark">Tier2</el-tag>
                    <el-tag v-else type="danger" effect="dark">Tier2</el-tag>
                </el-space>
            </el-space>
        </Transition>
    </el-space>
</template>

<style scoped>
.username {
    font-size: 1.1rem;
    font-weight: bold;
}

.person-card {
    display: flex;
    overflow: hidden;
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