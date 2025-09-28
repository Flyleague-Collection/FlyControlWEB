<script setup lang="ts">
import {ref} from "vue";
import {showSuccess, showWarning} from "@/utils/message.js";
import request from "@/api/request.js";

const icao = ref("")
const metarRawData = ref("")

const queryMetar = async () => {
    metarRawData.value = ''
    const response = await request.get(`/metar?icao=${icao.value}`)
    if (response.status === 200) {
        showSuccess("Metar查询成功")
        metarRawData.value = response.data
        return
    }
    showWarning("未查询到指定机场报文")
}
</script>

<template>
    <div class="container">
        <span class="title">Metar查询</span>
        <p>
            部分Metar数据来自 <a href="https://aviationweather.gov/data/metar/" target="_blank">https://aviationweather.gov/data/metar/</a>
        </p>
        <div class="content">
            <div class="flex">
                <el-input v-model="icao" placeholder="请输入机场ICAO码">
                    <template #append>
                        <el-button @click="queryMetar()">查询</el-button>
                    </template>
                </el-input>
            </div>
            <el-tag v-if="metarRawData != ''" size="large" type="success" effect="dark">{{ metarRawData }}</el-tag>
        </div>
    </div>
</template>

<style scoped lang="scss">
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 80%;
    flex-grow: 1;

    p {
        font-size: 1.05rem;
        line-height: 1.75;
    }

    .title {
        font-size: 2.5rem;
        font-weight: 600;
        color: $color-primary;
        margin-bottom: 40px;
    }

    .content {
        display: flex;
        flex-direction: column;
        width: 40%;

        > * {
            margin: 5px 0;
        }
    }
}
</style>