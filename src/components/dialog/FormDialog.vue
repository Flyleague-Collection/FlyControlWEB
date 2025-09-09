<script setup lang="ts">
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
    }
})

const cancelCallback = () => {
    hide()
    emit('dialogCancelEvent')
}

const handleCommit = async () => {
    emit('dialogConfirmEvent')
}

const show = () => {
    model.value = true
}

const hide = () => {
    model.value = false
}

defineExpose({show, hide})
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
            <div class="flex justify-content-flex-end">
                <el-button type="primary" @click="handleCommit">确认</el-button>
                <el-button @click="cancelCallback">取消</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped>

</style>