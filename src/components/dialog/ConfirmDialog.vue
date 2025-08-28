<script setup lang="ts">
import {Check, Close} from "@element-plus/icons-vue";

const model = defineModel()
const emits = defineEmits<{
    (e: 'ConfirmEvent'): void,
    (e: 'CancelEvent'): void
}>()

defineProps<{
    headerContent: string;
    bodyContent: string;
}>()

const confirmAction = () => {
    model.value = false
    emits("ConfirmEvent")
}

const cancelAction = () => {
    model.value = false
    emits('CancelEvent')
}

</script>

<template>
    <el-dialog v-model="model" footer-class="flex justify-item-flex-end" width="250" @keyup.enter.stop="confirmAction"
               :close-on-press-escape="false" :close-on-click-modal="false" :show-close="false" :align-center="true">
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