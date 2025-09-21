<script setup lang="ts">
import {ref} from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const currentLocale = ref(zhCn)
</script>

<template>
    <div class="container">
        <el-config-provider :locale="currentLocale">
            <router-view></router-view>
        </el-config-provider>
    </div>
</template>

<style scoped>
.container {
    height: 100%;
    width: 100%;
    overflow: hidden;
}
</style>
