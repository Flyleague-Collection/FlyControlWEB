<script setup lang="ts">
import {onMounted, ref, Ref} from "vue";
import {Close} from "@element-plus/icons-vue";
import {FormItemInstance} from "element-plus";
import moment from "moment";

const timePoints: Ref<{ time: string }[]> = ref([])

const addTimePoint = () => {
    timePoints.value.push({time: null});
};

const removeTimePoint = (id: number) => {
    timePoints.value.splice(id, 1);
}

const getTimePoints = (): string[] => {
    const result = []
    timePoints.value.forEach(item => {
        result.push(item.time)
    })
    return result;
}

const formItemRef: Ref<FormItemInstance> = ref()

const validateTimePoint = (): boolean => {
    formItemRef.value.clearValidate()
    timePoints.value.forEach((item) => {
        if (item.time == null) {
            formItemRef.value.validateState = 'error'
            formItemRef.value.validateMessage = "时间点不能为空"
            return false
        }
    })
    return true
}

const disableBefore = (date: Date): boolean => {
    return moment().subtract({days: 1}).isAfter(moment(date))
}

onMounted(() => {
    addTimePoint();
})

defineExpose({validateTimePoint, getTimePoints})
</script>

<template>
    <el-form-item label="可用面试时间" ref="formItemRef" required>
        <el-space wrap fill>
            <el-space v-for="(item, index) in timePoints" :key="index">
                <el-date-picker v-model="item.time" type="datetime" :disabled-date="disableBefore" :default-value="moment()"/>
                <el-button type="text" :icon="Close" :disabled="timePoints.length == 1"
                           @click="removeTimePoint(index)"/>
            </el-space>
            <el-button @click="addTimePoint()">添加时间</el-button>
        </el-space>
    </el-form-item>
</template>

<style scoped>

</style>