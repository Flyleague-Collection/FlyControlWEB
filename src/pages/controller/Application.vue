<script setup lang="ts">
import {useUserStore} from "@/store/user.js";
import {onMounted} from "vue";
import {useRouter} from "vue-router";
import {Ratings} from "@/global.js";
import {showWarning} from "@/utils/message.js";

const userStore = useUserStore();
const router = useRouter();

onMounted(() => {
    if (userStore.userData.rating >= Ratings.Observer) {
        showWarning("你已经是管制员了")
        router.push("/controllers/profile")
    }
})
</script>

<template>
    <div>
        <p>正在施工中~</p>
        <p>Will coming soon~</p>
    </div>
</template>

<style scoped>

</style>