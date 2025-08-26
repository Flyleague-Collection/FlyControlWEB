<script setup lang="ts">
import type {FormInstance, FormRules} from "element-plus";
import {computed, reactive, ref, watch} from "vue";

const props = defineProps({
    showDialog: {
        type: Boolean,
        default: false,
        required: true
    }
})

const emit = defineEmits(["dialogCancelEvent", "dialogConfirmEvent", "dialogCloseEvent"]);

type ActivityPilotSignForm = {
    callsign: string;
    aircraft: string;
}

const formRef = ref<FormInstance>()
const formData = reactive<ActivityPilotSignForm>({
    callsign: "",
    aircraft: ""
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

const showDialog = ref(false)

watch(() => props.showDialog, () => {
    showDialog.value = props.showDialog
})

const closeCallback = () => {
    showDialog.value = false
    emit("dialogCloseEvent")
}

const cancelCallback = () => {
    emit('dialogCancelEvent')
    closeCallback()
}

const handleCommit = async () => {
    await formRef.value?.validate()
    emit('dialogConfirmEvent', formData)
    closeCallback()
}
</script>

<template>
    <el-dialog class="border-radius-20px" v-model="showDialog" :before-close="closeCallback" width="250px">
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
                <el-input v-model="formData.aircraft" placeholder="请输入活动执飞机型"/>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="flex justify-item-flex-end">
                <el-button @click="cancelCallback">取消</el-button>
                <el-button type="primary" @click="handleCommit">确认</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped>

</style>