<script setup lang="ts">
import {Check, Close} from "@element-plus/icons-vue";

const model = defineModel({type: Boolean, default: false});

const emit = defineEmits<{
    (e: "drawerCancelEvent"): void,
    (e: "drawerConfirmEvent"): void,
    (e: "drawerOpenEvent"): void,
}>();

defineProps({
    title: {
        type: String,
        required: true
    },
    direction: {
        type: String,
        required: false,
        default: 'rtl'
    },
    width: {
        type: Number,
        required: false,
        default: 600
    },
    loading: {
        type: Boolean,
        required: false,
        default: false
    }
});

const cancelCallback = () => {
    hide();
    emit("drawerCancelEvent");
}

const handleCommit = async () => {
    emit("drawerConfirmEvent");
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
    <el-drawer v-model="model"
               :before-close="cancelCallback"
               :size=width
               :direction="direction"
               :draggable="true"
               @open="emit('drawerOpenEvent')"
               resizable>
        <template #header>
            <div>{{ title }}</div>
        </template>
        <slot></slot>
        <template #footer>
            <el-space>
                <el-button type="success" :icon="Check" @click="handleCommit" :loading="loading" :disabled="loading">
                    确认
                </el-button>
                <el-button type="danger" :icon="Close" @click="cancelCallback" :loading="loading" :disabled="loading">
                    取消
                </el-button>
            </el-space>
        </template>
    </el-drawer>
</template>

<style scoped>

</style>