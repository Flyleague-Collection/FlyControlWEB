<script setup lang="ts">
import {computed, ref} from "vue";

defineProps<{
    data: Job[]
}>()

const expendDescription = ref(true);

window.matchMedia("(min-width: 1400px)").onchange = (e) => {
    expendDescription.value = e.matches;
}

const expendEmail = ref(true);

window.matchMedia("(min-width: 1200px)").onchange = (e) => {
    expendEmail.value = e.matches;
}

const expendQQ = ref(true);

window.matchMedia("(min-width: 1000px)").onchange = (e) => {
    expendQQ.value = e.matches;
}

const expend = computed(() => {
    return expendDescription.value && expendEmail.value && expendQQ.value;
})
</script>

<template>
    <el-table :data="data">
        <el-table-column type="expand" v-if="!expend">
            <template #default="scope">
                <el-descriptions border :column="1" v-if="!expend">
                    <el-descriptions-item label="昵称">
                        {{ scope.row.nickname }}
                    </el-descriptions-item>
                    <el-descriptions-item label="职务">
                        {{ scope.row.office }}
                    </el-descriptions-item>
                    <el-descriptions-item label="QQ">
                        {{ scope.row.qq }}
                    </el-descriptions-item>
                    <el-descriptions-item label="邮箱">
                        {{ scope.row.email }}
                    </el-descriptions-item>
                    <el-descriptions-item label="签名">
                        {{ scope.row.description }}
                    </el-descriptions-item>
                </el-descriptions>
            </template>
        </el-table-column>
        <el-table-column label="昵称" min-width="200" width="280">
            <template #default="scope">
                <div class="flex align-items-center">
                    <img :src="`https://q1.qlogo.cn/g?b=qq&nk=${scope.row.qq}&s=100`" alt="头像">
                    <span class="margin-left-10">{{ scope.row.nickname }}</span>
                </div>
            </template>
        </el-table-column>
        <el-table-column label="职务" prop="office" width="200"/>
        <el-table-column label="QQ" prop="qq" width="140" v-if="expendQQ"/>
        <el-table-column label="邮箱" prop="email" v-if="expendEmail"/>
        <el-table-column label="签名" prop="description" v-if="expendDescription"/>
    </el-table>
</template>

<style scoped>
img {
    height: 40px;
    width: 40px;
    border-radius: 50%;
}

.el-table {
    font-size: large;
    width: 100%;
    margin-bottom: 30px;
}
</style>