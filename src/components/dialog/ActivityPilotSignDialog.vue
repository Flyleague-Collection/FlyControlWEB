<script setup lang="ts">
import type {FormInstance, FormRules} from "element-plus";
import {reactive, ref} from "vue";

const model = defineModel()

const emit = defineEmits<{
    (e: "dialogCancelEvent"): void,
    (e: "dialogConfirmEvent", data: object): void,
}>();

const formRef = ref<FormInstance>()
const formData = reactive<ActivityPilotSignForm>({
    callsign: "",
    aircraft_type: ""
})

const rules = reactive<FormRules<ActivityPilotSignForm>>({
    callsign: [{
        required: true,
        message: "请输入执飞呼号",
        trigger: "blur"
    }],
    aircraft: [{
        required: true,
        message: "请输入执飞机型",
        trigger: "blur"
    }]
})

const closeCallback = () => {
    model.value = false
}

const cancelCallback = () => {
    closeCallback()
    emit('dialogCancelEvent')
}

const handleCommit = async () => {
    await formRef.value?.validate()
    closeCallback()
    emit('dialogConfirmEvent', formData)
}
</script>

<template>
    <el-dialog class="border-radius-20" v-model="model" :before-close="closeCallback" width="250px">
        <template #header>
            <div>飞行员报名</div>
        </template>
        <el-form
            :model="formData"
            :rules="rules"
            label-width="80px"
            ref="formRef"
            @keyup.enter="handleCommit">
            <el-form-item class="flex flex-direction-column" prop="callsign" label-width="100px" label-position="left">
                <template #label> 执飞呼号:</template>
                <el-input v-model="formData.callsign" placeholder="请输入活动执飞呼号"/>
            </el-form-item>
            <el-form-item class="flex flex-direction-column" prop="aircraft" label-width="100px" label-position="left">
                <template #label>执飞机型:</template>
                <el-input v-model="formData.aircraft_type" placeholder="请输入活动执飞机型"/>
            </el-form-item>
        </el-form>
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