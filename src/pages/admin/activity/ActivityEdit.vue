<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref, Ref} from "vue";

import ApiActivity from "@/api/activity.js";
import ActivityEditCard from "@/components/card/ActivityEditCard.vue";
import {showSuccess} from "@/utils/message.js";

const router = useRouter();
const route = useRoute();
const activity: Ref<ActivityModel> = ref({});

onMounted(async () => {
    const data = await ApiActivity.getActivityById(Number(route.params.id));
    if (data == null) {
        return;
    }
    activity.value = data;
})

const cancelBtn = () => {
    router.push('/admin/activities')
}

const updateActivity = async (_) => {
    if (await ApiActivity.saveActivity(activity.value)) {
        showSuccess("保存活动成功")
    }
}
</script>

<template>
    <ActivityEditCard v-model="activity" @confirm-event="updateActivity" @cancel-event="cancelBtn"
                      cache-key="activity-edit-draft"/>
</template>

<style lang="scss" scoped>
</style>