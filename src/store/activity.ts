import {defineStore} from "pinia";
import {ref, Ref} from "vue";
import moment from "moment";

export const useActivityStore = defineStore("activity", () => {
    const activities: Ref<ActivityModel[]> = ref([
        {
            "id": 1,
            "publisher": 2352,
            "title": "测试活动",
            "image_url": "https://oss.half-nothing.cn/half64x64.png",
            "active_time": "2025-08-20T11:30:00Z",
            "departure_airport": "ZSSS",
            "arrival_airport": "ZBAD",
            "route": "POMOK G330 PIMOL A593 DALIM W157 AVBOX",
            "distance": 540,
            "status": 1,
            "NOTAMS": ""
        },
        {
            "id": 2,
            "publisher": 2352,
            "title": "测试活动",
            "image_url": "https://oss.half-nothing.cn/2.jpg",
            "active_time": "2025-09-01T11:30:00Z",
            "departure_airport": "ZSSS",
            "arrival_airport": "ZBAD",
            "route": "POMOK G330 PIMOL A593 DALIM W157 AVBOX",
            "distance": 540,
            "status": 1,
            "NOTAMS": ""
        },
        {
            "id": 3,
            "publisher": 2352,
            "title": "测试活动",
            "image_url": "https://oss.half-nothing.cn/half64x64.png",
            "active_time": "2025-07-29T11:30:00Z",
            "departure_airport": "ZSSS",
            "arrival_airport": "ZBAD",
            "route": "POMOK G330 PIMOL A593 DALIM W157 AVBOX",
            "distance": 540,
            "status": 1,
            "NOTAMS": ""
        },
        {
            "id": 4,
            "publisher": 2352,
            "title": "测试活动",
            "image_url": "https://oss.half-nothing.cn/1.jpg",
            "active_time": "2025-08-31T11:30:00Z",
            "departure_airport": "ZSSS",
            "arrival_airport": "ZBAD",
            "route": "POMOK G330 PIMOL A593 DALIM W157 AVBOX",
            "distance": 540,
            "status": 1,
            "NOTAMS": ""
        }
    ])

    const activitiesRecord: Ref<{ [key: string]: ActivityModel }> = ref({})

    const translateActivityData = (activities: ActivityModel[]) => {
        activitiesRecord.value = {}
        activities.forEach((activity) => {
            const activityDate = moment(activity.active_time)
            activity.start_time = activityDate.format('HH:mm:ss')
            activitiesRecord.value[activityDate.format("YYYY-MM-DD")] = activity
        })
    }

    translateActivityData(activities.value)

    const getActivityById = (activityId: number) => {
        for (const activity of activities.value) {
            if (activity.id == activityId) {
                return activity
            }
        }
    }

    return {activities, activitiesRecord, translateActivityData, getActivityById}
})