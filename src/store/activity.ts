import {defineStore} from "pinia";
import moment from "moment";
import {useAuthStore} from "@/store/auth.js";
import {showError} from "@/utils/message.js";
import request from "@/utils/request.js";

export const useActivityStore = defineStore("activity", () => {
    const authStore = useAuthStore();

    const translateActivityData = (activities: ActivityModel[]) => {
        const activitiesRecord: { [key: string]: ActivityModel } = {};
        activities.forEach((activity) => {
            const activityDate = moment(activity.active_time)
            activity.start_time = activityDate.format('HH:mm:ss')
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
            return response.data;
        }
        return null;
    }

    const createNewActivity = async (data: ActivityModel): Promise<boolean> => {
        const response = await request.post(`/activities`, data)
        return response.status == 200
    }

    const pilotSign = async (activityId: number, data: ActivityPilotSignForm): Promise<boolean> => {
        if (!authStore.isLogin) {
            showError("你还没有登录, 请登录后再试")
            return false
        }
        const response = await request.post(`/activities/${activityId}/pilots`, data)
        return response.status == 200 && response.data.data
    }

    const pilotUnsign = async (activityId: number): Promise<boolean> => {
        if (!authStore.isLogin) {
            showError("你还没有登录, 请登录后再试")
            return false
        }
        const response = await request.delete(`/activities/${activityId}/pilots`)
        return response.status == 200 && response.data.data
    }

    return {
        translateActivityData,
        getActivities,
        getActivitiesPage,
        getActivityById,
        createNewActivity,
        pilotSign,
        pilotUnsign
    }
})