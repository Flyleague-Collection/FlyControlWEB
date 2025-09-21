<script setup lang="ts">

import {homeConfig} from "@/config/index.js";
</script>

<template>
    <div class="footer">
        <span>Copyright © 2025 {{ homeConfig.content.copyright }}. All rights reserved.</span>
        <span>&nbsp;|&nbsp;</span>
        <span><a href="https://beian.miit.gov.cn/">{{ homeConfig.content.icp }}</a></span>
        <span>&nbsp;|&nbsp;</span>
        <span class="flex align-items-center">
            <img src="/images/icp.png" alt="ICP" style="height: 20px">
            <a :href="homeConfig">
                {{ homeConfig.content.icp_police }}
            </a>
        </span>
        <span>&nbsp;|&nbsp;</span>
        <span>仅供模拟飞行使用</span>
    </div>
</template>

<style scoped>
.footer {
    flex-grow: 1;
    display: flex;
    height: 20px;
    border: none;
    justify-content: center;
}
</style>