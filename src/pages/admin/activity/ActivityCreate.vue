<script setup lang="ts">
import {ref, Ref} from "vue";
import {useRouter} from "vue-router";

import ApiActivity from "@/api/activity.js";
import ActivityEditCard from "@/components/card/ActivityEditCard.vue";
import {showSuccess} from "@/utils/message.js";

const router = useRouter();

const activity: Ref<ActivityModel> = ref({
    id: 0,
    publisher: 0,
    title: "",
    image_url: "",
    active_time: "",
    departure_airport: "",
    arrival_airport: "",
    route: "",
    distance: 0,
    status: 1,
    NOTAMS: "",
    pilots: [],
    controllers: [],
    facilities: []
});

const createNewActivity = async () => {
    if (await ApiActivity.createActivity(activity.value)) {
        showSuccess("活动添加成功");
    }
    cancelBtn();
}

const reset = () => {
    activity.value = {
        id: 0,
        publisher: 0,
        title: "",
        image_url: "",
        active_time: "",
        departure_airport: "",
        arrival_airport: "",
        route: "",
        distance: 0,
        status: 1,
        NOTAMS: "",
        pilots: [],
        controllers: [],
        facilities: []
    }
}

const cancelBtn = () => {
    router.push('/admin/activities')
}
</script>

<template>
    <ActivityEditCard v-model="activity" :has-reset-button="true" @confirm-event="createNewActivity"
                      @reset-event="reset" @cancel-event="cancelBtn" cache-key="activity-create-draft"/>
</template>

<style lang="scss" scoped>
</style>