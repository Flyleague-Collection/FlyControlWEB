<script setup lang="ts">
import {Delete, Plus, ZoomIn} from "@element-plus/icons-vue";
import {ref} from "vue";
import {genFileId, UploadFile, UploadInstance, UploadRawFile, UploadUserFile} from "element-plus";
import {showError} from "@/utils/message.js";
import {sizeToString} from "@/utils/utils.js";
import {useServerConfigStore} from "@/store/server_config.js";
import {uploadImage} from "@/utils/request.js";

const fileUrl = defineModel({type: String})

const serverConfigStore = useServerConfigStore();

const fileList = ref<UploadUserFile[]>([])
const uploadRef = ref<UploadInstance>()
const selectedImage = ref<UploadUserFile | null>(null)

const handleChanged = (uploadFile: UploadFile, _) => {
    selectedImage.value = null;
    // 5MB
    if (uploadFile.size > serverConfigStore.config.image_limit.max_allow_size) {
        showError(`不能上传大于${sizeToString(serverConfigStore.config.image_limit.max_allow_size)}的文件`);
        uploadRef.value!.clearFiles()
        return;
    }
    const ext = `.${uploadFile.name.split('.').pop()?.toLowerCase()}`;
    if (serverConfigStore.config.image_limit.allowed_ext.findIndex(x => x === ext) === -1) {
        showError(`不支持的图片类型`);
        uploadRef.value!.clearFiles()
        return;
    }
    selectedImage.value = uploadFile;
    fileUrl.value = uploadFile.url;
}

const handleExceed = (files: File[], _) => {
    uploadRef.value!.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    uploadRef.value!.handleStart(file)
}

const upload = async (): string | null => {
    if (selectedImage.value == null) {
        showError("未选择图片")
        return null
    }
    const filePath = await uploadImage(selectedImage.value.raw as File)
    if (filePath == null) {
        showError("图片上传失败")
        return null
    }
    fileUrl.value = filePath
    return filePath;
}

defineExpose({upload})

const showPreview = ref(false)

const clearFiles = () => {
    selectedImage.value = null;
    uploadRef.value!.clearFiles()
}

const previewList = ref([])

const handlePictureCardPreview = (file: File) => {
    previewList.value = []
    previewList.value.push(file.url)
    showPreview.value = true
}
</script>

<template>
    <el-upload class="image-uploader"
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

        <template #file="{ file }">
            <div>
                <img class="el-upload-list__item-thumbnail" :src="file.url" alt=""/>
                <span class="el-upload-list__item-actions">
                  <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
                    <el-icon><ZoomIn/></el-icon>
                  </span>
                  <span class="el-upload-list__item-delete" @click="clearFiles()">
                    <el-icon><Delete/></el-icon>
                  </span>
                </span>
            </div>
        </template>
    </el-upload>
    <el-image-viewer
        v-if="showPreview"
        z-index="1"
        :url-list="previewList"
        @close="showPreview = false"
    />
</template>

<style scoped>
.image-uploader {
    width: 114px;
    height: 114px;
    cursor: pointer;
    transition: var(--el-transition-duration-fast);
}
</style>