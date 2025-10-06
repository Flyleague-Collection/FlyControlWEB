<script setup lang="ts">
import {formatCid, handleImageUrl} from "@/utils/utils.js";
import {ActivityPilotStatus} from "@/global.js";

defineProps<{ data: ActivityPilotModel }>()
</script>

<template>
    <el-card>
        <el-space>
            <el-avatar size="large" v-if="data.user.avatar_url == ''">{{ formatCid(data.user.cid) }}</el-avatar>
            <el-avatar size="large" v-else :src="handleImageUrl(data.user.avatar_url)"/>
            <div class="flex flex-direction-column">
                <span class="callsign">{{ data.callsign }}</span>
                <span>CID: {{ formatCid(data.user.cid) }}</span>
                <el-space>
                    <el-tag type="primary" effect="dark" round>
                        {{ data.aircraft_type }}
                    </el-tag>
                    <el-tag type="primary" effect="dark" round
                            v-if="data.status == ActivityPilotStatus.Sign">
                        已报名
                    </el-tag>
                    <el-tag type="success" effect="dark" round
                            v-else-if="data.status == ActivityPilotStatus.Delivery">
                        已放行
                    </el-tag>
                    <el-tag color="#b2c75e" effect="dark" class="border-none" round
                            v-else-if="data.status == ActivityPilotStatus.Takeoff">
                        已起飞
                    </el-tag>
                    <el-tag color="#c78636" effect="dark" class="border-none" round v-else>
                        已落地
                    </el-tag>
                </el-space>
            </div>
        </el-space>
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