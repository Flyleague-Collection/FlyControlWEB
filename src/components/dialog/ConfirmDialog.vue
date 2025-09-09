<script setup lang="ts">
import {Check, Close} from "@element-plus/icons-vue";

const model = defineModel({type: Boolean, default: false});

const emits = defineEmits<{
    (e: 'ConfirmEvent'): void,
    (e: 'CancelEvent'): void
}>();

defineProps({
    headerContent: {
        type: String,
        required: true
    },
    bodyContent: {
        type: String,
        required: true
    },
    width: {
        type: Number,
        required: false,
        default: 250
    }
});

const confirmAction = () => {
    hide();
    emits("ConfirmEvent");
}

const cancelAction = () => {
    hide();
    emits('CancelEvent');
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
    <el-dialog v-model="model"
               footer-class="flex justify-content-flex-end"
               :width="width"
               :close-on-press-escape="false"
               :close-on-click-modal="false"
               :show-close="false"
               :align-center="true"
               @keyup.enter.stop="confirmAction">
        <template #header>{{ headerContent }}</template>
        <span>{{ bodyContent }}</span>
        <template #footer>
            <el-button :icon="Check" type="success" @click.stop="confirmAction">确认</el-button>
            <el-button :icon="Close" type="danger" @click.stop="cancelAction">取消</el-button>
        </template>
    </el-dialog>
</template>

<style scoped>

</style>