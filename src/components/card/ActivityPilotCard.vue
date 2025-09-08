<script setup lang="ts">

import config from "@/config/index.js";

defineProps<{ pilot: ActivityPilotModel }>()

</script>

<template>
    <el-card>
        <div class="flex align-items-center justify-content-center-below-425px">
            <el-avatar size="large">
                {{ pilot.cid }}
            </el-avatar>
            <div class="flex flex-direction-column margin-left-10">
                <span class="callsign">{{ pilot.callsign }}</span>
                <span>CID: {{ pilot.cid }}</span>
                <div class="flex" :class="config.pilot_status[pilot.status].class">
                    <el-tag class="border-none" round effect="dark">{{
                            pilot.aircraft_type
                        }}
                    </el-tag>
                    <el-tag class="pilot-status margin-left-10 border-none" round effect="dark">
                        {{ config.pilot_status[pilot.status].label }}
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