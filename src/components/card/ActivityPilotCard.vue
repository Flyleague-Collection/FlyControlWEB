<script setup lang="ts">
import config from "@/config/index.js";
import {handleImageUrl} from "@/utils/utils.js";
import {padStart} from "lodash-es";

defineProps<{ data: ActivityPilotModel }>()
</script>

<template>
    <el-card>
        <div class="flex align-items-center justify-content-center-below-425px">
            <el-avatar size="large" v-if="data.user.avatar_url == ''">{{ padStart(data.user.cid, 4, '0') }}</el-avatar>
            <el-avatar size="large" v-else :src="handleImageUrl(data.user.avatar_url)"/>
            <div class="flex flex-direction-column margin-left-10">
                <span class="callsign">{{ data.callsign }}</span>
                <span>CID: {{ padStart(data.user.cid, 4, '0') }}</span>
                <div class="flex" :class="config.pilot_status[data.status].class">
                    <el-tag class="border-none" round effect="dark">
                        {{ data.aircraft_type }}
                    </el-tag>
                    <el-tag class="pilot-status margin-left-10 border-none" round effect="dark">
                        {{ config.pilot_status[data.status].label }}
                    </el-tag>
                </div>
            </div>
        </div>
    </el-card>
</template>

<style scoped>
.pilot-status {
    background-color: var(--bg-color);
}

.callsign {
    font-size: 1.5rem;
    font-weight: 500;
}

@media (max-width: 375px) {
    .el-avatar {
        display: none;
    }
}
</style>