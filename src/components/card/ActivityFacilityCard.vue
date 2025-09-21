<script setup lang="ts">
import config from "@/config/index.js";
import {useServerConfigStore} from "@/store/server_config.js";
import {useUserStore} from "@/store/user.js";
import {handleImageUrl} from "@/utils/utils.js";
import {padStart} from "lodash-es";

defineProps<{ data: ActivityFacilityModel, alreadySigned: boolean, signTimeOut: boolean }>();
const emits = defineEmits<{
    (e: "ControllerSignEvent", facilityId: number): void
    (e: "ControllerUnsignEvent", facilityId: number): void
}>()

const serverConfigStore = useServerConfigStore();
const ratings = serverConfigStore.ratings;
const userStore = useUserStore();
</script>

<template>
    <el-card>
        <div class="flex align-items-center justify-content-center-below-425px">
            <el-avatar size="large" v-if="data.controller == null">?</el-avatar>
            <el-avatar size="large" v-else-if="data.controller?.user.avatar_url == ''">
                {{ padStart(data.controller?.user.cid, 4, '0') }}
            </el-avatar>
            <el-avatar size="large" v-else :src="handleImageUrl(data.controller?.user.avatar_url)"/>
            <div class="flex flex-direction-column margin-left-10">
                <div class="flex align-items-center">
                    <span class="callsign">{{ data.callsign }}</span>
                    <el-tag class="text-color-white border-none margin-left-10 display-over-425px" round
                            :color="ratings[data.min_rating + 1].color">
                        {{ ratings[data.min_rating + 1].short_name }}
                    </el-tag>
                    <el-tag v-if="data.tier2_tower" class="border-none margin-left-10 display-over-425px" effect="dark"
                            round type="primary">
                        程序塔
                    </el-tag>
                </div>
                <span v-if="data.controller">CID: {{ padStart(data.controller?.user.cid, 4, '0') }}</span>
                <span v-else>CID: 未报名</span>
                <div class="flex flex-direction-column-below-425px">
                    <el-tag class="border-none margin-bottom-5-below-425px" round effect="dark">
                        {{ data.frequency }}
                    </el-tag>
                    <el-tag v-if="data.controller"
                            class="border-none margin-left-10 margin-0-below-425px margin-bottom-5-below-425px"
                            round
                            effect="dark" type="success">
                        已报名
                    </el-tag>
                    <el-tag v-else
                            class="border-none margin-left-10 margin-0-below-425px margin-bottom-5-below-425px"
                            round
                            effect="dark"
                            type="warning">
                        未报名
                    </el-tag>
                    <el-button class="margin-left-10 margin-0-below-425px margin-bottom-5-below-425px"
                               round
                               type="danger" size="small"
                               v-if="data.controller"
                               :disabled="data.controller.uid != userStore.userData.id || signTimeOut"
                               @click="emits('ControllerUnsignEvent', data.id)">
                        取消报名
                    </el-button>
                    <el-button class="margin-left-10 margin-0-below-425px margin-bottom-5-below-425px"
                               round
                               type="primary" size="small"
                               v-else
                               :disabled="signTimeOut || alreadySigned || data.min_rating > userStore.userData.rating || (data.tier2_tower && !userStore.userData.tier2)"
                               @click="emits('ControllerSignEvent', data.id)">
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