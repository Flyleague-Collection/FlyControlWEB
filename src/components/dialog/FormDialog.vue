<script setup lang="ts">
import {Check, Close} from "@element-plus/icons-vue";

const model = defineModel({type: Boolean, default: false});

const emit = defineEmits<{
    (e: "dialogCancelEvent"): void,
    (e: "dialogConfirmEvent"): void,
}>();

defineProps({
    title: {
        type: String,
        required: true
    },
    width: {
        type: Number,
        required: false,
        default: 250
    },
    loading: {
        type: Boolean,
        required: false,
        default: false
    }
});

const cancelCallback = () => {
    hide();
    emit("dialogCancelEvent");
}

const handleCommit = async () => {
    emit("dialogConfirmEvent");
}

const show = () => {
    model.value = true;
}

const hide = () => {
    model.value = false;
}

defineExpose({show, hide});
</script>

<template>
    <el-dialog class="border-radius-20"
               v-model="model"
               :before-close="cancelCallback"
               :width=width
               :align-center="true">
        <template #header>
            <div>{{ title }}</div>
        </template>
        <slot></slot>
        <template #footer>
            <el-space>
                <el-button type="success" :icon="Check" @click="handleCommit" :loading="loading" :disabled="loading">确认</el-button>
                <el-button type="danger" :icon="Close" @click="cancelCallback" :loading="loading" :disabled="loading">取消</el-button>
            </el-space>
        </template>
    </el-dialog>
</template>

<style scoped>

</style>