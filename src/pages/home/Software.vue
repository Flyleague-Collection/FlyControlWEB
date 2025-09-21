<script setup lang="ts">

import {homeConfig} from "@/config/index.js";
</script>

<template>

    <div class="container">
        <span class="title">软件下载</span>
        <div class="content">
            <el-row :gutter="10">
                <el-col v-for="item in homeConfig.software" :xs="24" :sm="12">
                    <el-card>
                        <template #header>
                            <div class="flex justify-content-between">
                                <span>{{ item.name }}</span>
                                <el-tag round effect="dark" type="success">
                                    {{ item.version }}
                                </el-tag>
                            </div>
                        </template>
                        <span>{{ item.description }}</span>
                        <template #footer>
                            <div class="flex justify-content-between align-items-center">
                                <div class="flex align-items-center">
                                    <el-tag size="large" class="margin-right-5" round v-if="item.platform.windows">
                                        适用平台：Windows
                                    </el-tag>
                                    <el-tag size="large" class="margin-right-5" round v-if="item.platform.linux">
                                        适用平台：Linux
                                    </el-tag>
                                    <el-tag size="large" class="margin-right-5" round v-if="item.platform.macos">
                                        适用平台：MacOS
                                    </el-tag>
                                </div>
                                <div class="flex justify-content-flex-end">
                                    <el-button :disabled="item.file_url == ''" dark round type="success">
                                        {{ item.file_url == '' ? '暂无镜像下载地址' : '镜像下载' }}
                                    </el-button>
                                    <el-button :disabled="item.official_uri == ''" dark round type="primary">
                                        {{ item.official_uri == '' ? '暂无官方下载地址' : '官方下载' }}
                                    </el-button>
                                </div>
                            </div>
                        </template>
                    </el-card>

                </el-col>
            </el-row>
        </div>
    </div>
</template>

<style scoped lang="scss">
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    flex-grow: 1;
    width: 80%;

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
        width: 80%;

        > * {
            margin: 5px 0;
        }
    }
}
</style>