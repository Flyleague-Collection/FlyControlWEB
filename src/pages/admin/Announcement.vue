<script setup lang="ts">
import DOMPurify from 'dompurify';
import {FormInstance, FormRules} from "element-plus";
import {Delete, EditPen, Plus} from "@element-plus/icons-vue";
import {cloneDeep} from "lodash";
import {marked} from "marked";
import {nextTick, ref, Ref} from "vue";

import ApiAnnouncement from "@/api/announcement.js";
import type {PageListCardInstance, PageListResponse} from "@/components/card/PageListCard.js";
import PageListCard from "@/components/card/PageListCard.vue";
import type {ConfirmDialogInstance} from "@/components/dialog/ConfirmDialog.js";
import ConfirmDialog from "@/components/dialog/ConfirmDialog.vue";
import type {FormDrawerInstance} from "@/components/drawer/FormDrawer.js";
import FormDrawer from "@/components/drawer/FormDrawer.vue";
import {usePasteImage} from "@/composables/usePasteImage.js";
import {getAnnouncementTypeColor, getAnnouncementTypeLabel, Global} from "@/global.js";
import {useUserStore} from "@/store/user.js";
import {showError, showSuccess, showWarning} from "@/utils/message.js";
import {PermissionNode} from "@/utils/permission.js";
import {formatCid, handleImageUrl} from "@/utils/utils.js";
import {useReactiveWidth} from "@/composables/useReactiveWidth.js";

const getAnnouncements = async (page: number, pageSize: number): Promise<PageListResponse<AnnouncementModel>> => {
    const result: PageListResponse<AnnouncementModel> = {data: [], total: 0}
    const data = await ApiAnnouncement.getDetailAnnouncements(page, pageSize);
    if (data != null) {
        result.data = data.items;
        result.total = data.total;
    }
    return result;
}

const userStore = useUserStore();
const announcementsRef: Ref<PageListCardInstance> = ref();
const announcementId = ref(0);

const defaultAnnouncementFormData = {
    type: 0,
    title: '',
    content: '',
    important: false,
    force_show: false
}
const publishAnnouncementDrawerRef: Ref<FormDrawerInstance> = ref();
const publishAnnouncementFormRef: Ref<FormInstance> = ref();
const announcementFormData = ref<AnnouncementForm>(cloneDeep(defaultAnnouncementFormData));
const announcementFormRule: Ref<FormRules<AnnouncementForm>> = ref({
    type: [
        {required: true, message: "此条目不能为空", trigger: "blur"}
    ],
    title: [
        {required: true, message: "此条目不能为空", trigger: "blur"}
    ],
    content: [
        {required: true, message: "此条目不能为空", trigger: "blur"}
    ]
});
const publishAnnouncementInputRef: Ref<HTMLTextAreaElement> = ref();
const editAnnouncementInputRef: Ref<HTMLTextAreaElement> = ref();
const currentAnnouncementInputRef: Ref<HTMLTextAreaElement> = ref();

const {isUploading} = usePasteImage((imageUrl: string) => {
    const textarea = currentAnnouncementInputRef.value;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = announcementFormData.value.content;

    const imageMarkdown = `\n![images](${handleImageUrl(imageUrl)})\n`;
    announcementFormData.value.content = text.substring(0, start) + imageMarkdown + text.substring(end);

    nextTick(() => {
        const newCursorPos = start + imageMarkdown.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
        textarea.focus()
    })
})

const getPublishAnnouncementRef = () => {
    publishAnnouncementInputRef.value = document.getElementById("publishAnnouncementInputRef");
    currentAnnouncementInputRef.value = publishAnnouncementInputRef.value;
}

const showPublishAnnouncementDrawer = () => {
    if (!userStore.permission.hasPermissionNode(PermissionNode.AnnouncementPublish)) {
        showError("你无权这么做");
        return;
    }
    currentAnnouncementInputRef.value = publishAnnouncementInputRef.value;
    publishAnnouncementDrawerRef.value?.show();
}

const publishAnnouncementLoading = ref(false);

const publishAnnouncement = async () => {
    publishAnnouncementLoading.value = true;
    try {
        await publishAnnouncementFormRef.value?.validate();
    } catch {
        publishAnnouncementLoading.value = false;
        return;
    }
    if (await ApiAnnouncement.createAnnouncement(announcementFormData.value)) {
        showSuccess("发布公告成功");
        announcementsRef.value?.flushData();
        publishAnnouncementDrawerRef.value?.hide();
        announcementFormData.value = cloneDeep(defaultAnnouncementFormData);
    }
    publishAnnouncementLoading.value = false;
}

const editAnnouncementDrawerRef: Ref<FormDrawerInstance> = ref();
const editAnnouncementFormRef: Ref<FormInstance> = ref();
const oldData = ref<AnnouncementModel>(cloneDeep(defaultAnnouncementFormData));

const getEditAnnouncementRef = () => {
    editAnnouncementInputRef.value = document.getElementById("editAnnouncementInputRef");
    currentAnnouncementInputRef.value = editAnnouncementInputRef.value;
}

const showEditAnnouncementDrawer = (id: number) => {
    if (!userStore.permission.hasPermissionNode(PermissionNode.AnnouncementEdit)) {
        showError("你无权这么做");
        return;
    }
    currentAnnouncementInputRef.value = editAnnouncementInputRef.value;
    oldData.value = announcementsRef.value?.getDataByIndex(id) as AnnouncementModel;
    announcementFormData.value = cloneDeep(oldData.value);
    editAnnouncementDrawerRef.value?.show();
}

const editAnnouncementLoading = ref(false);

const editAnnouncement = async () => {
    editAnnouncementLoading.value = true;
    try {
        await editAnnouncementFormRef.value?.validate();
    } catch {
        editAnnouncementLoading.value = false;
        return;
    }
    const updateData = {};
    if (announcementFormData.value.type != oldData.value?.type) {
        updateData["type"] = announcementFormData.value.type;
    }

    if (announcementFormData.value.title != oldData.value?.title) {
        updateData["title"] = announcementFormData.value.title;
    }

    if (announcementFormData.value.content != oldData.value?.content) {
        updateData["content"] = announcementFormData.value.content;
    }

    if (announcementFormData.value.force_show != oldData.value?.force_show) {
        updateData["force_show"] = announcementFormData.value.force_show;
    }

    if (announcementFormData.value.important != oldData.value?.important) {
        updateData["important"] = announcementFormData.value.important;
    }

    if (Object.keys(updateData).length == 0) {
        showWarning("没有要修改的地方");
        editAnnouncementLoading.value = false;
        return;
    }

    updateData["type"] = announcementFormData.value.type;
    updateData["force_show"] = announcementFormData.value.force_show;
    updateData["important"] = announcementFormData.value.important;

    if (await ApiAnnouncement.updateAnnouncement(oldData.value?.id, updateData)) {
        showSuccess("修改公告成功");
        announcementsRef.value?.flushData();
        editAnnouncementDrawerRef.value?.hide();
        announcementFormData.value = cloneDeep(defaultAnnouncementFormData);
    }
    editAnnouncementLoading.value = false;
}

const confirmDeleteAnnouncementDialogRef: Ref<ConfirmDialogInstance> = ref();

const confirmDeleteAnnouncement = (id: number) => {
    if (!userStore.permission.hasPermissionNode(PermissionNode.AnnouncementDelete)) {
        showError("你无权这么做");
        return;
    }
    announcementId.value = id;
    confirmDeleteAnnouncementDialogRef.value?.show();
}

const deleteAnnouncementLoading = ref(false);

const deleteAnnouncement = async () => {
    deleteAnnouncementLoading.value = true;
    if (announcementId.value == 0) {
        showError("无效的目标ID");
        deleteAnnouncementLoading.value = false;
        return;
    }
    if (await ApiAnnouncement.deleteAnnouncement(announcementId.value)) {
        showSuccess("删除计划成功");
        announcementsRef.value?.flushData();
    }
    deleteAnnouncementLoading.value = false;
}

const {less1000px, less800px, less600px, less500px} = useReactiveWidth();
</script>

<template>
    <PageListCard ref="announcementsRef" :fetch-data="getAnnouncements" no-transform>
        <template #header>
            <el-space wrap>
                <span>公告列表</span>
                <el-button type="success" :icon="Plus" @click="showPublishAnnouncementDrawer()"
                           :="!userStore.permission.hasPermissionNode(PermissionNode.AnnouncementPublish)">
                    发布公告
                </el-button>
            </el-space>
        </template>
        <el-table-column type="expand">
            <template #default="scope">
                <el-descriptions :column="1" border label-width="80">
                    <el-descriptions-item label="标题">
                        {{ scope.row.title }}
                    </el-descriptions-item>
                    <el-descriptions-item label="发布人" v-if="less600px">
                        {{ formatCid(scope.row.user.cid) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="公告类型" v-if="less800px">
                        <el-tag :color="getAnnouncementTypeColor(scope.row.type)" effect="dark">
                            {{ getAnnouncementTypeLabel(scope.row.type) }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="重要公告" v-if="less1000px">
                        <el-tag type="success" v-if="scope.row.important">是</el-tag>
                        <el-tag type="danger" v-else>否</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="弹窗显示" v-if="less1000px">
                        <el-tag type="success" v-if="scope.row.force_show">是</el-tag>
                        <el-tag type="danger" v-else>否</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="内容">
                        <div class="content" v-html="DOMPurify.sanitize(marked.parse(scope.row.content))"/>
                    </el-descriptions-item>
                    <el-descriptions-item label="操作" v-if="less500px">
                        <el-space wrap>
                            <el-button type="primary" :icon="EditPen"
                                       @click="showEditAnnouncementDrawer(scope.$index)" size="small"
                                       :disabled="!userStore.permission.hasPermissionNode(PermissionNode.AnnouncementEdit)">
                                编辑
                            </el-button>
                            <el-button type="danger" :icon="Delete"
                                       @click="confirmDeleteAnnouncement(scope.row.id)" size="small"
                                       :disabled="!userStore.permission.hasPermissionNode(PermissionNode.AnnouncementDelete)">
                                删除
                            </el-button>
                        </el-space>
                    </el-descriptions-item>
                </el-descriptions>
            </template>
        </el-table-column>
        <el-table-column label="公告ID" prop="id" v-if="!less800px"/>
        <el-table-column label="发布人" v-if="!less600px">
            <template #default="scope">
                {{ formatCid(scope.row.user.cid) }}
            </template>
        </el-table-column>
        <el-table-column label="公告类型" v-if="!less800px">
            <template #default="scope">
                <el-tag :color="getAnnouncementTypeColor(scope.row.type)" effect="dark">
                    {{ getAnnouncementTypeLabel(scope.row.type) }}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column label="公告标题">
            <template #default="scope">
                {{ scope.row.title }}
            </template>
        </el-table-column>
        <el-table-column label="重要公告" v-if="!less1000px">
            <template #default="scope">
                <el-tag type="success" v-if="scope.row.important">是</el-tag>
                <el-tag type="danger" v-else>否</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="弹窗显示" v-if="!less1000px">
            <template #default="scope">
                <el-tag type="success" v-if="scope.row.force_show">是</el-tag>
                <el-tag type="danger" v-else>否</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="操作" v-if="!less500px">
            <template #default="scope">
                <el-space wrap>
                    <el-button type="primary" :icon="EditPen" @click="showEditAnnouncementDrawer(scope.$index)"
                               :disabled="!userStore.permission.hasPermissionNode(PermissionNode.AnnouncementEdit)">
                        编辑
                    </el-button>
                    <el-button type="danger" :icon="Delete" @click="confirmDeleteAnnouncement(scope.row.id)"
                               :disabled="!userStore.permission.hasPermissionNode(PermissionNode.AnnouncementDelete)">
                        删除
                    </el-button>
                </el-space>
            </template>
        </el-table-column>
    </PageListCard>
    <FormDrawer ref="publishAnnouncementDrawerRef" title="发布公告" @drawer-confirm-event="publishAnnouncement()"
                @drawer-open-event="getPublishAnnouncementRef()" :loading="publishAnnouncementLoading"
                :width="less600px ? '100%' : 600">
        <el-form :model="announcementFormData" ref="publishAnnouncementFormRef"
                 :rules="announcementFormRule">
            <el-form-item label="公告类型" prop="type">
                <el-radio-group v-model="announcementFormData.type">
                    <el-radio-button v-for="item in Global.announcementType" :label="item.label" :value="item.value"/>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="公告标题" prop="title">
                <el-input v-model="announcementFormData.title"/>
            </el-form-item>
            <el-form-item label="公告内容" prop="content">
                <el-space wrap direction="vertical" fill class="w-full">
                    <el-alert type="primary" v-if="isUploading">正在上传图片, 请稍等</el-alert>
                    <el-input id="publishAnnouncementInputRef" v-model="announcementFormData.content" type="textarea"
                              :rows="20"
                              :disabled="isUploading"/>
                </el-space>
            </el-form-item>
            <el-form-item label="重要公告">
                <el-switch v-model="announcementFormData.important"/>
            </el-form-item>
            <el-form-item label="弹窗显示">
                <el-switch v-model="announcementFormData.force_show"/>
            </el-form-item>
        </el-form>
    </FormDrawer>
    <FormDrawer ref="editAnnouncementDrawerRef" title="编辑公告" @drawer-confirm-event="editAnnouncement()"
                @drawer-open-event="getEditAnnouncementRef()" :loading="editAnnouncementLoading"
                :width="less600px ? '100%' : 600">
        <el-form :model="announcementFormData" ref="editAnnouncementFormRef"
                 :rules="announcementFormRule">
            <el-form-item label="公告类型" prop="type">
                <el-radio-group v-model="announcementFormData.type">
                    <el-radio-button v-for="item in Global.announcementType" :label="item.label" :value="item.value"/>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="公告标题" prop="title">
                <el-input v-model="announcementFormData.title"/>
            </el-form-item>
            <el-form-item label="公告内容" prop="content">
                <el-space wrap direction="vertical" fill class="w-full">
                    <el-alert type="primary" v-if="isUploading">正在上传图片, 请稍等</el-alert>
                    <el-input id="editAnnouncementInputRef" v-model="announcementFormData.content" type="textarea"
                              :rows="20"
                              :disabled="isUploading"/>
                </el-space>
            </el-form-item>
            <el-form-item label="重要公告">
                <el-switch v-model="announcementFormData.important"/>
            </el-form-item>
            <el-form-item label="弹窗显示">
                <el-switch v-model="announcementFormData.force_show"/>
            </el-form-item>
        </el-form>
    </FormDrawer>
    <ConfirmDialog ref="confirmDeleteAnnouncementDialogRef"
                   body-content="确认删除此公告？"
                   header-content="删除公告"
                   :loading="deleteAnnouncementLoading"
                   @confirm-event="deleteAnnouncement()"/>
</template>

<style scoped>
.content:deep(img) {
    width: 100%;
    max-width: min(60%, 600px);
}
</style>