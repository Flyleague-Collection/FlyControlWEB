<script setup lang="ts" generic="T">
import {onBeforeMount, onMounted, Ref, ref} from "vue";
import {TableColumnCtx} from "element-plus";
import type {PageListResponse} from "@/components/card/PageListCard.js";
import {List} from "@element-plus/icons-vue";

const props = defineProps<{
    fetchData?: (page: number, pageSize: number) => Promise<PageListResponse<T>>
    doubleClickRow?: (row: T, column: TableColumnCtx<T>, cell: HTMLTableCellElement, event: Event) => void;
    cardTitle?: string;
    noTransform?: boolean;
}>()

const storedData = defineModel({
    type: List,
    default() {
        return []
    }
})

const pageSize = ref(20);
const page = ref(1);
const total = ref(0);
const loading = ref(false);

const flushData = async () => {
    if (props.fetchData == undefined) {
        return;
    }
    loading.value = true
    const response = await props.fetchData(page.value, pageSize.value)
    storedData.value = response.data
    total.value = response.total
    loading.value = false
}

const pageChange = async (value: number) => {
    page.value = value;
    await flushData()
}

const pageSizeChange = async (value: number) => {
    pageSize.value = value;
    await flushData()
}

const getDataByIndex = (index: number): T => {
    return storedData.value[index];
}

onMounted(async () => {
    await flushData()
})

defineExpose({flushData, getDataByIndex})
</script>

<template>
    <el-card :class="{'no-transform': noTransform}" footer-class="flex justify-content-center">
        <template #header>
            <slot name="header">
                <div class="flex align-items-center">
                    {{ cardTitle }}
                </div>
            </slot>
        </template>
        <el-skeleton :rows="5" animated v-if="loading" :throttle="{ leading: 1000, trailing: 1000}"/>
        <slot name="main" :data="storedData" v-else-if="storedData.length != 0">
            <el-table :data="storedData" @row-dblclick="doubleClickRow">
                <slot/>
            </el-table>
        </slot>
        <el-empty v-else/>
        <template #footer v-if="total > pageSize">
            <el-pagination
                :page-size="pageSize"
                :current-page="page"
                :total="total"
                :page-sizes="[10, 20, 30, 40, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                @update:current-page="pageChange"
                @update:page-size="pageSizeChange"
            />
        </template>
    </el-card>
</template>

<style scoped>
.el-card {
    margin-bottom: 0;
}
</style>