<script setup lang="ts">
import {ArrowLeft, Check, Close, DocumentAdd, Plus, RefreshLeft} from "@element-plus/icons-vue";
import config from "@/config/index.js";
import {useRouter} from "vue-router";
import {ModelRef, onActivated, onBeforeUpdate, onMounted, onUpdated, reactive, Ref, ref} from "vue";
import ConfirmDialog from "@/components/dialog/ConfirmDialog.vue";
import {useActivityStore} from "@/store/activity.js";
import {
    FormInstance,
    type FormRules,
    genFileId,
    UploadFile,
    UploadInstance,
    UploadRawFile,
    UploadUserFile
} from "element-plus";
import {showError, showSuccess} from "@/utils/message.js";
import {sizeToString} from "@/utils/utils.js";
import {useServerConfigStore} from "@/store/server_config.js";
import {ConfirmDialogInstance} from "@/components/dialog/ConfirmDialog.js";

const router = useRouter();
const serverConfig = useServerConfigStore();
const activityStore = useActivityStore();
// 弹出框标识
const resetConfirmDialog = ref(false)
const cancelConfirmDialog = ref(false)
const uploading = ref(false)
// @ts-ignore
const model: ModelRef<ActivityModel> = defineModel()
const props = defineProps({
    hasResetButton: {
        type: Boolean,
        required: false,
        default: false
    },
    cacheKey: {
        type: String,
        required: false,
        default: 'drafts'
    }
})
const emits = defineEmits<{
    (e: "ConfirmEvent", data: ActivityModel): Promise<void>
    (e: "ResetEvent"): void
    (e: "CancelEvent"): void
}>()
const activityFormRef = ref<FormInstance>()
const facilityFormRefs: Ref<FormInstance[]> = ref([]);
const uploadRef = ref<UploadInstance>()
const selectedImage = ref<UploadUserFile | null>(null)
const fileList = ref<UploadUserFile[]>([])
// 表单校验规则
const rules = reactive<FormRules>({
    title: [
        {required: true, message: "活动标题不能为空", trigger: "blur"}
    ],
    active_time: [
        {required: true, message: "活动时间不能为空", trigger: "blur"}
    ],
    departure_airport: [
        {required: true, message: "出发机场不能为空", trigger: "blur"},
        {
            validator: (rule, value, callback) => {
                if (value == model.value.arrival_airport) {
                    callback(new Error("出发机场与到达机场不能为同一机场"))
                    return
                }
                callback()
            },
            trigger: "blur"
        }
    ],
    arrival_airport: [
        {required: true, message: "到达机场不能为空", trigger: "blur"},
        {
            validator: (rule, value, callback) => {
                if (value == model.value.departure_airport) {
                    callback(new Error("出发机场与到达机场不能为同一机场"))
                    return
                }
                callback()
            },
            trigger: "blur"
        }
    ],
    route: [
        {required: true, message: "航路不能为空", trigger: "blur"}
    ],
    distance: [
        {required: true, message: "飞行距离不能为空", trigger: "blur"},
        {
            validator: (rule, value, callback) => {
                if (value == 0) {
                    callback(new Error("飞行距离不能为0"))
                    return
                }
                callback()
            },
            trigger: "blur"
        }
    ],
    status: [
        {required: true, message: "活动状态不能为空", trigger: "blur"}
    ]
})
const facilityRules = reactive<FormRules>({
    callsign: [{required: true, message: "席位呼号不能为空", trigger: "blur"}],
    frequency: [
        {required: true, message: "席位频率不能为空", trigger: "blur"},
        {
            validator: (rule, value, callback) => {
                const data = Number(value)
                if (isNaN(data)) {
                    callback(new Error("频率必须是一个数字"))
                    return
                }
                if (118.0 > data || data > 136.975) {
                    callback(new Error("非法频率, 合法频率范围为118.000-136.975"))
                    return
                }
                callback()
            }
        }
    ],
    min_rating: [{required: true, message: "最小要求权限不能为空", trigger: "blur"}]
})

onBeforeUpdate(() => {
    if (fileList.value.length > 0) {
        return
    }
    if (model.value.image_url != undefined && model.value.image_url != "") {
        if (model.value.image_url.startsWith("http")) {
            fileList.value[0] = {
                name: "",
                url: model.value.image_url
            }
        } else {
            fileList.value[0] = {
                name: "",
                url: `${config.backend_url}/${model.value.image_url}`
            }
        }
    }
})

const confirmBtnClick = async () => {
    try {
        await activityFormRef.value?.validate()
        if (facilityFormRefs.value.length === 0) {
            showError("席位数量不能为0")
            return
        }
        for (const formRef of facilityFormRefs.value) {
            await formRef.validate()
        }
    } catch {
        return
    }
    uploading.value = true
    if (selectedImage.value != null) {
        const filePath = await activityStore.uploadActivityImage(selectedImage.value.raw as File)
        if (filePath == null) {
            uploading.value = false
            return
        }
        model.value.image_url = filePath;
    }
    await emits("ConfirmEvent", model.value)
    localStorage.removeItem(props.cacheKey)
    uploading.value = false
}

const resetBtnClick = () => {
    uploading.value = false
    selectedImage.value = null
    uploadRef.value?.clearFiles()
    facilityFormRefs.value = []
    emits("ResetEvent")
}

const cancelBtnClick = () => {
    emits("CancelEvent")
}

const setFormRef = (el, index) => {
    if (el) {
        facilityFormRefs.value[index] = el;
    }
};

const addFacility = () => {
    model.value.facilities?.push({} as ActivityFacilityModel);
}

const deleteFacility = (id: number) => {
    model.value.facilities?.splice(id, 1)
    facilityFormRefs.value.splice(id, 1);
}

const handleChanged = (uploadFile: UploadFile, _) => {
    selectedImage.value = null;
    // 5MB
    if (uploadFile.size > serverConfig.config.image_limit.max_allow_size) {
        showError(`不能上传大于${sizeToString(serverConfig.config.image_limit.max_allow_size)}的文件`);
        uploadRef.value!.clearFiles()
        return;
    }
    const ext = `.${uploadFile.name.split('.').pop()?.toLowerCase()}`;
    if (serverConfig.config.image_limit.allowed_ext.findIndex(x => x === ext) === -1) {
        showError(`不支持的图片类型`);
        uploadRef.value!.clearFiles()
        return;
    }
    selectedImage.value = uploadFile;
}

const handleExceed = (files: File[], _) => {
    uploadRef.value!.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    uploadRef.value!.handleStart(file)
}

const saveDraft = () => {
    localStorage.setItem(props.cacheKey, JSON.stringify(model.value))
    showSuccess("草稿保存成功")
}

const drafts = ref('')
const confirmLoadDraftRef: Ref<ConfirmDialogInstance> = ref()

const loadDraft = () => {
    model.value = JSON.parse(drafts.value)
    showSuccess("加载成功")
    drafts.value = ''
    localStorage.removeItem(props.cacheKey)
}

const handleFacilitySelect = (index: number, value: Facility) => {
    const target = model.value.facilities[index];
    target.callsign = value.callsign;
    target.frequency = value.frequency;
    target.min_rating = value.min_ratings;
    target.tier2_tower = value.tier2;
    facilityFormRefs.value[index].clearValidate();
}

onMounted(() => {
    drafts.value = localStorage.getItem(props.cacheKey)
    if (drafts.value) {
        confirmLoadDraftRef.value?.show();
    }
})
</script>

<template>
    <el-card class="container no-transform" footer-class="flex justify-content-flex-end">
        <template #header>
            <el-button :icon="ArrowLeft" text @click="router.push(`/admin/activities`)"/>
            <span>{{ model.title }}</span>
        </template>
        <el-card>
            <template #header>
                <span>基本信息</span>
            </template>
            <el-form :model="model" label-position="right" label-width="auto" ref="activityFormRef" :rules="rules">
                <el-form-item label="活动名" prop="title">
                    <el-input v-model="model.title"/>
                </el-form-item>
                <el-form-item label="活动时间" prop="active_time">
                    <el-date-picker type="datetime" v-model="model.active_time"
                                    value-format="YYYY-MM-DDTHH:mm:ssZ"></el-date-picker>
                </el-form-item>
                <el-form-item label="活动封面">
                    <el-upload class="activity-img-uploader"
                               ref="uploadRef"
                               :auto-upload="false"
                               :file-list="fileList"
                               :limit="1"
                               :on-exceed="handleExceed"
                               :on-change="handleChanged"
                               accept="image/*"
                               list-type="picture-card">
                        <el-icon>
                            <Plus/>
                        </el-icon>
                    </el-upload>
                </el-form-item>
                <el-form-item label="出发机场" prop="departure_airport">
                    <el-autocomplete v-model="model.departure_airport" :fetch-suggestions="activityStore.querySearch"
                                     clearable/>
                </el-form-item>
                <el-form-item label="到达机场" prop="arrival_airport">
                    <el-autocomplete v-model="model.arrival_airport" :fetch-suggestions="activityStore.querySearch"
                                     clearable/>
                </el-form-item>
                <el-form-item label="航路" prop="route">
                    <el-input v-model="model.route"></el-input>
                </el-form-item>
                <el-form-item label="航路距离" prop="distance">
                    <el-input v-model.number="model.distance"></el-input>
                </el-form-item>
                <el-form-item label="NOTAMS">
                    <el-input v-model="model.NOTAMS"></el-input>
                </el-form-item>
                <el-form-item label="活动状态" prop="status">
                    <el-select v-model="model.status" :options="config.activity_status"></el-select>
                </el-form-item>
            </el-form>
        </el-card>
        <el-card>
            <template #header>
                <span>席位信息</span>
            </template>
            <el-row :gutter="10">
                <el-col v-for="(item, index) in model.facilities" :key="index"
                        :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
                    <el-card header-class="flex align-items-center justify-content-between">
                        <template #header>
                            <span>{{ item.callsign }}</span>
                            <el-tooltip content="删除席位" placement="top">
                                <el-button :icon="Close" text @click="deleteFacility(index)"/>
                            </el-tooltip>
                        </template>
                        <el-form :model="item" :rules="facilityRules" :ref="el => setFormRef(el, index)">
                            <el-form-item prop="callsign">
                                <template #label>呼号</template>
                                <el-autocomplete v-model="item.callsign"
                                                 :fetch-suggestions="activityStore.queryFacilities"
                                                 @select="facility => handleFacilitySelect(index, facility)"/>
                            </el-form-item>
                            <el-form-item prop="frequency">
                                <template #label>频率</template>
                                <el-input v-model="item.frequency"/>
                            </el-form-item>
                            <el-form-item prop="min_rating">
                                <template #label>最小权限</template>
                                <el-select v-model="item.min_rating" :options="config.ratings.slice(3)"/>
                            </el-form-item>
                            <el-form-item label="程序塔台">
                                <el-switch v-model="item.tier2_tower"></el-switch>
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
            <el-button :icon="Check" type="success" @click="confirmBtnClick" :loading="uploading">保存</el-button>
            <el-button :icon="DocumentAdd" type="primary" @click="saveDraft()" :loading="uploading">保存草稿</el-button>
            <el-button :icon="RefreshLeft" type="warning" @click="resetConfirmDialog = true" :loading="uploading"
                       v-if="hasResetButton">
                重置
            </el-button>
            <el-button :icon="Close" type="danger" @click="cancelConfirmDialog = true" :loading="uploading">取消
            </el-button>
        </template>
    </el-card>
    <ConfirmDialog ref="confirmLoadDraftRef"
                   body-content="发现存储的草稿, 要加载草稿吗？"
                   header-content="发现草稿"
                   @confirm-event="loadDraft()"
                   @cancel-event="localStorage.removeItem(cacheKey)"/>
    <ConfirmDialog v-model="resetConfirmDialog" header-content="重置已输入的内容"
                   body-content="所有未保存的内容将会丢失, 确认继续吗？"
                   v-if="hasResetButton"
                   @confirm-event="resetBtnClick"/>
    <ConfirmDialog v-model="cancelConfirmDialog" header-content="返回上一页"
                   body-content="所有未保存的内容将会丢失, 确认继续吗？"
                   @confirm-event="cancelBtnClick"/>
</template>

<style scoped>
.container:deep(.el-card) {
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

.activity-img-uploader {
    width: $image-upload-width;
    height: $image-upload-height;
}

.add-button:hover,
.activity-img:hover,
.activity-img-uploader:hover {
    border-color: var(--el-color-primary);
}
</style>