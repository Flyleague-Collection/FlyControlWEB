<script setup lang="ts">
const model = defineModel()

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
    }
})

const cancelCallback = () => {
    model.value = false
    emit('dialogCancelEvent')
}

const handleCommit = async () => {
    emit('dialogConfirmEvent')
}
</script>

<template>
    <el-dialog class="border-radius-20" v-model="model" :before-close="cancelCallback" :width=width>
        <template #header>
            <div>{{ title }}</div>
        </template>
        <slot></slot>
        <template #footer>
            <div class="flex justify-content-flex-end">
                <el-button @click="cancelCallback">取消</el-button>
                <el-button type="primary" @click="handleCommit">确认</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped>

</style>