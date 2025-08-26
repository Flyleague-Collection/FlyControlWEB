<script setup lang="ts">
import config from "@/config/index.js";
import {useServerConfigStore} from "@/store/server_config.js";
import {useAuthStore} from "@/store/auth.js";

defineProps<{ facility: ActivityFacilityModel, alreadySigned: boolean }>();

const serverConfigStore = useServerConfigStore();
const ratings = serverConfigStore.ratings;
const authStore = useAuthStore();
</script>

<template>
    <el-card>
        <div class="flex align-items-center justify-content-center-below-425px">
            <el-avatar size="large" v-if="facility.controller">
                {{ facility.controller?.cid }}
            </el-avatar>
            <el-avatar size="large" v-else>?</el-avatar>
            <div class="flex flex-direction-column margin-left-10">
                <div class="flex align-items-center">
                    <span class="callsign">{{ facility.callsign }}</span>
                    <el-tag class="text-color-white border-none margin-left-10 display-over-425px" round
                            :color="config.rating_color[facility.min_rating + 1]">
                        {{ ratings[facility.min_rating + 1].short_name }}
                    </el-tag>
                </div>
                <span v-if="facility.controller">CID: {{ facility.controller?.cid }}</span>
                <span v-else>CID: 未报名</span>
                <div class="flex flex-direction-column-below-425px">
                    <el-tag class="border-none margin-bottom-5px-below-425px" round effect="dark">{{
                            facility.frequency
                        }}
                    </el-tag>
                    <el-tag v-if="facility.controller"
                            class="border-none margin-left-10 margin-0-below-425px margin-bottom-5px-below-425px" round
                            effect="dark" type="success">已报名
                    </el-tag>
                    <el-tag v-else
                            class="border-none margin-left-10 margin-0-below-425px margin-bottom-5px-below-425px" round
                            effect="dark"
                            type="warning">未报名
                    </el-tag>
                    <el-button class="margin-left-10 margin-0-below-425px margin-bottom-5px-below-425px" round
                               type="danger" size="small"
                               v-if="facility.controller"
                               :disabled="facility.controller.cid != authStore.cid">
                        取消报名
                    </el-button>
                    <el-button class="margin-left-10 margin-0-below-425px margin-bottom-5px-below-425px" round
                               type="primary" size="small"
                               v-else
                               :disabled="alreadySigned || facility.min_rating > authStore.rating">
                        立刻报名
                    </el-button>
                </div>
            </div>
        </div>
    </el-card>
</template>

<style scoped>
.callsign {
    font-size: 1.5rem;
    font-weight: 500;
}

@media (max-width: 500px) {
    .el-avatar {
        display: none;
    }
}
</style>