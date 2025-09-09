<script setup lang="ts" generic="T">
import {onMounted, Ref, ref} from "vue";
import {TableColumnCtx} from "element-plus";
import type {PageListResponse} from "@/components/card/PageListCard.js";

const props = defineProps<{
    fetchData: (page: number, pageSize: number) => Promise<PageListResponse<T>>
    doubleClickRow?: (row: T, column: TableColumnCtx<T>, cell: HTMLTableCellElement, event: Event) => void;
    cardTitle: string;
}>()

const storedData: Ref<T[]> = ref([])

const pageSize = ref(20);
const page = ref(1);
const total = ref(0);

const flushData = async () => {
    const response = await props.fetchData(page.value, pageSize.value)
    storedData.value = response.data
    total.value = response.total
}

const pageChange = async (value: number) => {
    page.value = value;
    await flushData()
}

const pageSizeChange = async (value: number) => {
    pageSize.value = value;
    await flushData()
}

defineExpose({flushData})

onMounted(async () => {
    await flushData()
})
</script>

<template>
    <el-card footer-class="flex justify-content-center">
        <template #header>
            <div class="flex align-items-center">
                {{ cardTitle }}
            </div>
        </template>
        <el-table :data="storedData" @row-dblclick="doubleClickRow">
            <slot/>
        </el-table>
        <template #footer>
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

</style>