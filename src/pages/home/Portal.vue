<script setup lang="ts">
import {useRouter} from "vue-router";

import {homeConfig} from "@/config/index.js";

const router = useRouter();
</script>

<template>
    <div class="container">
        <div class="title">
            <span class="title-text"> {{ homeConfig.title }} </span>
            <el-button type="primary" size="large" dark round @click="router.push('/home')">现在开始</el-button>
        </div>
        <div class="contact">
            <span>联系我们与反馈</span>
            <p>如果您有任何建议、意见或遇到问题，欢迎通过电子邮件联系我们</p>
            <p>我们非常重视您的反馈，将不断优化平台体验！</p>
            <p>欢迎使用邮件反应 </p>
            <a :href="'mailto:' + homeConfig.contact_email">
                <el-button type="primary" size="large" dark round>发送邮件反馈</el-button>
            </a>
        </div>
        <div class="partner">
            <span>合作伙伴专区</span>
            <div class="images">
                <a v-for="item in homeConfig.partner" :href="item.url" target="_blank" rel="noopener noreferrer">
                    <img :src="item.image" alt="images">
                </a>
            </div>
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

    .el-button:hover {
        transform: scale(1.1, 1.1);
        transition: transform 0.15s linear;
        font-family: 'Heiti', sans-serif;
    }

    .el-button {
        padding: 20px 30px;
        font-size: 1rem;
        font-weight: 600;
    }

    div {
        margin: 30px;
    }

    .title-text {
        background-image: linear-gradient(45deg, var(--primary-color), var(--accent-color), var(--primary-color));
        background-size: 200%;
        background-clip: text;
        color: transparent;
        animation: gradient-animation 5s ease infinite;
    }

    .title {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        span {
            font-size: 2.5rem;
            font-weight: 600;
            margin-bottom: 40px;
            font-family: 'Heiti', sans-serif;
        }

        img {
            height: 40px;
            width: auto;
        }
    }

    .contact span,
    .partner span {
        color: $color-primary;
        font-size: 1.5rem;
        font-weight: bold;
    }

    .contact {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        p {
            margin: 5px;
            font-size: 1.1rem;
        }

        a {
            font-size: 1.1rem;
        }
    }

    .partner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .images a {
            margin: 0 10px;
        }

        img {
            height: 150px;
            width: auto;
        }
    }
}

a {
    text-decoration: none;
    color: inherit;
}
</style>