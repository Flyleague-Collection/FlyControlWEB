import moment from "moment";
import {defineStore} from "pinia";
import {ref} from "vue";

import {airports, facilities} from "@/config/index.js";

export const useActivityStore = defineStore("activity", () => {
    const airportsName = ref<Airports>(airports);
    const facilitiesName = ref<Facilities>(facilities);

    const querySearch = (queryString: string, cb: Callback1<Airport[]>) => {
        if (queryString == "") {
            cb(airportsName.value);
        }
        const results = airportsName.value.filter((e: Airport) => e.value.indexOf(queryString.toUpperCase()) === 0);
        cb(results);
    }

    const queryFacilities = (queryString: string, cb: Callback1<Facility[]>) => {
        if (queryString == "") {
            cb(facilitiesName.value);
        }
        const results = facilitiesName.value.filter((e: Facility) => e.value.indexOf(queryString.toUpperCase()) === 0);
        cb(results);
    }

    const translateActivityData = (activities: ActivityModel[]): Record<string, ActivityModel> => {
        const activitiesRecord: Record<string, ActivityModel> = {};
        activities.forEach((activity: ActivityModel) => {
            const activityDate = moment(activity.active_time);
            activity.start_time = activityDate.format('HH:mm:ss');
            activitiesRecord[activityDate.format("YYYY-MM-DD")] = activity;
        })
        return activitiesRecord;
    }

    return {
        querySearch,
        queryFacilities,
        translateActivityData
    }
})