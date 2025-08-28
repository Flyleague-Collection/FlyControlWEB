<script setup lang="ts">
import {useActivityStore} from "@/store/activity.js";
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref, Ref} from "vue";
import {ArrowLeft, Check, Close, Delete, Plus, RefreshLeft} from "@element-plus/icons-vue";
import ConfirmDialog from "@/components/dialog/ConfirmDialog.vue";
import {airports} from "@/config/index.js";

const activityStore = useActivityStore();
const route = useRoute();
const router = useRouter();

const activity: Ref<ActivityModel> = ref({} as ActivityModel);

onMounted(() => {
    const data = activityStore.getActivityById(Number(route.params.id))
    if (data == null) {
        return;
    }
    activity.value = data;
})

const addFacility = () => {
    activity.value?.facilities?.push({} as ActivityFacilityModel);
}

const ratings = [
    {
        value: 2,
        label: "S1"
    },
    {
        value: 3,
        label: "S2"
    },
    {
        value: 4,
        label: "S3"
    },
    {
        value: 5,
        label: "C1"
    },
    {
        value: 6,
        label: "C2"
    },
    {
        value: 7,
        label: "C3"
    },
    {
        value: 8,
        label: "I1"
    },
    {
        value: 9,
        label: "I2"
    },
    {
        value: 10,
        label: "I3"
    },
    {
        value: 11,
        label: "SUP"
    },
    {
        value: 12,
        label: "ADM"
    }
]

const deleteFacility = (id: number) => {
    // @ts-ignore
    activity.value?.facilities?.splice(id, 1)
}

const resetConfirmDialog = ref(false)

const activity_status = [
    {
        "label": "报名中",
        "value": 1
    },
    {
        "label": "活动中",
        "value": 2
    },
    {
        "label": "已结束",
        "value": 3
    }
]

const restaurants = ref<{ value: string }[]>(airports)
const querySearch = (queryString: string, cb: any) => {
    if (queryString == "") {
        cb(restaurants.value)
    }
    const results = restaurants.value.filter((e: { value: string }) => e.value.indexOf(queryString.toUpperCase()) === 0)
    cb(results)
}

</script>

<template>
    <el-card footer-class="flex justify-item-flex-end">
        <template #header>
            <el-button :icon="ArrowLeft" text @click="router.back()"/>
            <span>{{ activity.title }}</span>
        </template>
        <el-card>
            <template #header>
                <span>基本信息</span>
            </template>
            <el-form :model="activity" label-position="right" label-width="auto">
                <el-form-item label="活动名">
                    <el-input v-model="activity.title"/>
                </el-form-item>
                <el-form-item label="活动时间">
                    <el-date-picker type="datetime" v-model="activity.start_time"></el-date-picker>
                </el-form-item>
                <el-form-item label="活动封面">
                    <div class="flex flex-direction-column">
                        <img class="activity-img" :src="activity.image_url" v-if="activity.image_url != ''" alt="">
                        <el-upload class="activity-img-uploader"
                                   drag
                                   :show-file-list="false"
                                   :auto-upload="false"
                                   accept="image/*"
                                   v-else>
                            <el-icon>
                                <Plus/>
                            </el-icon>
                        </el-upload>
                        <el-button v-if="activity.image_url != ''" alt="" :icon="Delete" type="danger" dark
                                   @click="activity.image_url = ''">
                            删除图片
                        </el-button>
                    </div>
                </el-form-item>
                <el-form-item label="出发机场">
                    <el-autocomplete v-model="activity.departure_airport" :fetch-suggestions="querySearch" clearable/>
                </el-form-item>
                <el-form-item label="到达机场">
                    <el-autocomplete v-model="activity.arrival_airport" :fetch-suggestions="querySearch" clearable/>
                </el-form-item>
                <el-form-item label="航路">
                    <el-input v-model="activity.route"></el-input>
                </el-form-item>
                <el-form-item label="航路距离">
                    <el-input v-model.number="activity.distance"></el-input>
                </el-form-item>
                <el-form-item label="NOTAMS">
                    <el-input v-model="activity.NOTAMS"></el-input>
                </el-form-item>
                <el-form-item label="活动状态">
                    <el-select v-model="activity.status" :options="activity_status"></el-select>
                </el-form-item>
            </el-form>
        </el-card>
        <el-card>
            <template #header>
                <span>席位信息</span>
            </template>
            <el-row :gutter="10">
                <el-col v-for="(item, index) in activity.facilities" :key="index"
                        :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
                    <el-card header-class="flex align-items-center justify-content-between">
                        <template #header>
                            <span>{{ item.callsign }}</span>
                            <el-tooltip content="删除席位" placement="top">
                                <el-button :icon="Close" text @click="deleteFacility(index)"/>
                            </el-tooltip>
                        </template>
                        <el-form :model="item">
                            <el-form-item prop="callsign">
                                <template #label>呼号</template>
                                <el-input v-model="item.callsign"/>
                            </el-form-item>
                            <el-form-item prop="frequency">
                                <template #label>频率</template>
                                <el-input v-model="item.frequency"/>
                            </el-form-item>
                            <el-form-item prop="min_rating">
                                <template #label>最小权限</template>
                                <el-select v-model="item.min_rating" :options="ratings"/>
                            </el-form-item>
                        </el-form>
                    </el-card>
                </el-col>
                <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4" class="margin-bottom-10">
                    <el-button :icon="Plus" class="add-button el-card" @click="addFacility"/>
                </el-col>
            </el-row>
        </el-card>
        <template #footer>
            <el-button :icon="Check" type="success">保存</el-button>
            <el-button :icon="RefreshLeft" type="warning" @click="resetConfirmDialog = true">重置</el-button>
            <el-button :icon="Close" type="danger">取消</el-button>
        </template>
    </el-card>
    <ConfirmDialog v-model="resetConfirmDialog" header-content="重置已输入的内容"
                   body-content="所有未保存的内容将会丢失, 确认继续吗？"/>
</template>

<style scoped>
.el-card {
    transform: none;
    margin-bottom: 10px;
}

.add-button {
    width: 100%;
    height: 100%;
    border-width: 1px;
    border-style: dashed;

}

.add-button:hover {
    border-color: var(--el-color-primary);
}

.activity-img {
    max-width: 500px;
}

.activity-img-uploader {
    width: 180px;
    height: 114px;
}

.add-button:hover,
.activity-img:hover,
.activity-img-uploader:hover {
    border-color: var(--el-color-primary);
}
</style>