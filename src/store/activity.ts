import moment from "moment";
import {defineStore} from "pinia";
import {ref} from "vue";

import config, {airports} from "@/config/index.js";
import {useUserStore} from "@/store/user.js";
import {showError} from "@/utils/message.js";
import request from "@/utils/request.js";

export const useActivityStore = defineStore("activity", () => {
    const userStore = useUserStore();
    const airportsName = ref<{ value: string }[]>(airports)

    const querySearch = (queryString: string, cb: any) => {
        if (queryString == "") {
            cb(airportsName.value)
        }
        const results = airportsName.value.filter((e: {
            value: string
        }) => e.value.indexOf(queryString.toUpperCase()) === 0)
        cb(results)
    }

    const translateActivityData = (activities: ActivityModel[]) => {
        const activitiesRecord: { [key: string]: ActivityModel } = {};
        activities.forEach((activity: ActivityModel) => {
            const activityDate = moment(activity.active_time)
            activity.start_time = activityDate.format('HH:mm:ss')
            if (!activity.image_url.startsWith("http") && activity.image_url != "") {
                activity.image_url = `${config.backend_url}/${activity.image_url}`
            }
            activitiesRecord[activityDate.format("YYYY-MM-DD")] = activity
        })
        return activitiesRecord;
    }

    const getActivities = async (time: string): Promise<ActivityModel[] | null> => {
        const response = await request.get(`/activities?time=${time}`);
        if (response.status === 200) {
            return response.data.items
        }
        return null
    }

    const getActivitiesPage = async (page: number, pageSize: number): Promise<GetActivitiesPageResponse | null> => {
        const response = await request.get(`/activities/list?page_number=${page}&page_size=${pageSize}`);
        if (response.status === 200) {
            return response.data as GetActivitiesPageResponse;
        }
        return null;
    }

    const getActivityById = async (activityId: number): Promise<ActivityModel | null> => {
        const response = await request.get(`/activities/${activityId}`)
        if (response.status === 200) {
            if (!response.data.image_url.startsWith("http") && response.data.image_url != "") {
                response.data.image_url = `${config.backend_url}/${response.data.image_url}`
            }
            return response.data;
        }
        return null;
    }

    const createActivity = async (data: ActivityModel): Promise<boolean> => {
        const response = await request.post(`/activities`, data)
        return response.status == 200
    }

    const deleteActivity = async (activityId: number): Promise<boolean> => {
        const response = await request.delete(`/activities/${activityId}`)
        return response.status == 200
    }

    const saveActivity = async (data: ActivityModel): Promise<boolean> => {
        const response = await request.put(`/activities/${data.id}`, data)
        return response.status == 200
    }

    const uploadActivityImage = async (file: File): Promise<string | null> => {
        const formData = new FormData()
        formData.append('file', file)
        const response = await request.post<{ file_size: number; access_path: string; }>('/files/images', formData)
        if (response.status == 200) {
            return response.data.access_path;
        }
        return null;
    }

    const pilotSign = async (activityId: number, data: ActivityPilotSignForm): Promise<boolean> => {
        if (!userStore.isLogin) {
            showError("你还没有登录, 请登录后再试")
            return false
        }
        const response = await request.post(`/activities/${activityId}/pilots`, data)
        return response.status == 200 && response.data
    }

    const pilotUnsign = async (activityId: number): Promise<boolean> => {
        if (!userStore.isLogin) {
            showError("你还没有登录, 请登录后再试")
            return false
        }
        const response = await request.delete(`/activities/${activityId}/pilots`)
        return response.status == 200 && response.data
    }

    const controllerSign = async (activityId: number, facilityId: number): Promise<boolean> => {
        if (!userStore.isLogin) {
            showError("你还没有登录, 请登录后再试")
            return false
        }
        const response = await request.post(`/activities/${activityId}/controllers/${facilityId}`)
        return response.status == 200 && response.data
    }

    const controllerUnsign = async (activityId: number, facilityId: number): Promise<boolean> => {
        if (!userStore.isLogin) {
            showError("你还没有登录, 请登录后再试")
            return false
        }
        const response = await request.delete(`/activities/${activityId}/controllers/${facilityId}`)
        return response.status == 200 && response.data
    }

    return {
        querySearch,
        translateActivityData,
        getActivities,
        getActivitiesPage,
        getActivityById,
        createActivity,
        deleteActivity,
        uploadActivityImage,
        saveActivity,
        pilotSign,
        pilotUnsign,
        controllerSign,
        controllerUnsign
    }
})