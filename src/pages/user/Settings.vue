<script setup lang="ts">
import {useUserStore} from "@/store/user.js";
import config from "@/config/index.js";
import {useServerConfigStore} from "@/store/server_config.js";
import {computed, onMounted, Ref, ref} from "vue";
import {Plus} from "@element-plus/icons-vue";
import request from "@/utils/request.js";
import moment from "moment";

const userStore = useUserStore();
const serverConfigStore = useServerConfigStore();

const userData = userStore.userData;

const pilotTime = computed(() => {
    return userData.total_pilot_time / 3600.0;
})

const atcTime = computed(() => {
    return userData.total_atc_time / 3600.0;
})

const ratings = computed(() => {
    const rating = serverConfigStore.ratings[userData.rating + 1]
    return `${rating.short_name}/${rating.long_name}`
})

const historyData: Ref<GetUserHistoryResponse> = ref({
    total_pilot_time: 0,
    total_atc_time: 0,
    controllers: [],
    pilots: []
});

onMounted(async () => {
    const response = await request.get(`/history`)
    historyData.value = response.data as GetUserHistoryResponse
    for (const pilot of historyData.value.pilots) {
        pilot.start_time = moment(pilot.start_time).format('YYYY-MM-DD HH:mm:ss');
        pilot.end_time = moment(pilot.end_time).format('YYYY-MM-DD HH:mm:ss');
    }
    for (const controller of historyData.value.controllers) {
        controller.start_time = moment(controller.start_time).format('YYYY-MM-DD HH:mm:ss');
        controller.end_time = moment(controller.end_time).format('YYYY-MM-DD HH:mm:ss');
    }
})
</script>

<template>
    <div class="container">
        <el-row :gutter="10">
            <el-col :xs="24" :sm="12" :md="6" :lg="4" :xl="4">
                <el-row :gutter="10">
                    <el-col :span="24">
                        <el-card>
                            <div class="flex flex-direction-column align-items-center">
                                <el-avatar v-if="userData.avatar_url != ''" :src="userData.avatar_url"
                                           :size="100"></el-avatar>
                                <el-avatar v-else :size="100">{{ userData.cid }}</el-avatar>
                                <div class="flex flex-direction-column margin-left-10 align-items-center">
                                    <span class="font-size-15rem">{{ userData.username }}</span>
                                    <span class="font-size-12rem">CID: {{ userData.cid }}</span>
                                    <el-tag class="text-color-white border-none margin-bottom-5"
                                            :color="config.rating_color[userData.rating]">
                                        {{ ratings }}
                                    </el-tag>
                                    <el-tag> 飞控权限: {{ userData.permission }}</el-tag>
                                </div>
                            </div>
                            <template #footer>
                                <div class="flex justify-content-center flex-direction-column-below-350px">
                                    <el-button class="margin-0-below-350px margin-bottom-10-below-350px" type="primary"
                                               round>修改密码
                                    </el-button>
                                    <el-button class="margin-0-below-350px" type="danger" round
                                               @click="userStore.logout">退出登录
                                    </el-button>
                                </div>
                            </template>
                        </el-card>
                    </el-col>
                    <el-col :span="24">
                        <el-card>
                            <template #header>
                                <span>编辑个人信息</span>
                            </template>
                            <el-form>
                                <el-form-item prop="cid">
                                    <template #label>
                                        CID
                                    </template>
                                    <el-input :placeholder="String(userData.cid)" disabled/>
                                </el-form-item>
                                <el-form-item prop="username">
                                    <template #label>
                                        用户名
                                    </template>
                                    <el-input :placeholder="userData.username"/>
                                </el-form-item>
                                <el-form-item prop="email">
                                    <template #label>
                                        邮箱
                                    </template>
                                    <el-input :placeholder="userData.email"/>
                                </el-form-item>
                                <el-form-item prop="emailCode">
                                    <template #label>
                                        验证码
                                    </template>
                                    <div class="flex flex-direction-column-below-425px">
                                        <el-input class="margin-bottom-5-below-425px" placeholder="输入验证码"/>
                                        <el-button type="primary">发送验证码</el-button>
                                    </div>
                                </el-form-item>
                                <el-form-item>
                                    <template #label>
                                        QQ
                                    </template>
                                    <el-input :placeholder="String(userData.qq)"/>
                                </el-form-item>
                                <el-form-item>
                                    <template #label>
                                        上传头像
                                    </template>
                                    <el-upload class="avatar-uploader"
                                               drag
                                               :show-file-list="false"
                                               :auto-upload="false"
                                               accept="image/*">
                                        <el-icon>
                                            <Plus/>
                                        </el-icon>
                                    </el-upload>
                                </el-form-item>
                            </el-form>
                            <template #footer>
                                <div class="flex justify-content-flex-end">
                                    <el-button type="success" round>保存</el-button>
                                </div>
                            </template>
                        </el-card>
                    </el-col>
                </el-row>
            </el-col>
            <el-col :xs="24" :sm="12" :md="18" :lg="20" :xl="20">
                <el-card>
                    <el-row :gutter="16" class="align-items-center">
                        <el-col :xs="12" :sm="24" :md="12" :lg="12" :xl="12">
                            <el-statistic title="飞行时长" :value="pilotTime" :precision="2">
                                <template #suffix>h</template>
                            </el-statistic>
                        </el-col>
                        <el-col :xs="12" :sm="24" :md="12" :lg="12" :xl="12">
                            <el-statistic title="管制时长" :value="atcTime" :precision="2">
                                <template #suffix>h</template>
                            </el-statistic>
                        </el-col>
                    </el-row>
                </el-card>
                <el-card>
                    <template #header>
                        <span>连线记录(最近10次)</span>
                    </template>
                    <el-table v-if="historyData.pilots.length > 0" :data="historyData.pilots">
                        <el-table-column prop="callsign" label="呼号"></el-table-column>
                        <el-table-column prop="start_time" label="上线时间"></el-table-column>
                        <el-table-column prop="end_time" label="下线时间"></el-table-column>
                        <el-table-column prop="online_time" label="在线时间">
                            <template #default="scope">
                                {{ (scope.row.online_time / 3600.0).toFixed(2) }} h
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-empty v-else description="你好像还没有连线过"></el-empty>
                </el-card>
                <el-card>
                    <template #header>
                        <span>管制记录(最近10次)</span>
                    </template>
                    <el-table v-if="historyData.controllers.length > 0" :data="historyData.controllers" border>
                        <el-table-column prop="callsign" label="席位"></el-table-column>
                        <el-table-column prop="start_time" label="上线时间"></el-table-column>
                        <el-table-column prop="end_time" label="下线时间"></el-table-column>
                        <el-table-column prop="online_time" label="在线时间">
                            <template #default="scope">
                                {{ (scope.row.online_time / 3600.0).toFixed(2) }} h
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-empty v-else description="你好像还没有进行过管制"></el-empty>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<style scoped>
.avatar-uploader {
    width: 114px;
    height: 114px;
    cursor: pointer;
    transition: var(--el-transition-duration-fast);
}

.avatar-uploader:hover {
    border-color: var(--el-color-primary);
}
</style>