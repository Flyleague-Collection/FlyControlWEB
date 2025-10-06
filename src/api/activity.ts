import request from "@/api/request.js";
import Api from "@/api/utils.js";
import {handleImageUrl} from "@/utils/utils.js";
import AxiosXHR = Axios.AxiosXHR;

export namespace ApiActivity {
    import getPageData = Api.getPageData;

    const preprocessData = (data: Nullable<ActivityModel>) => {
        if (data) {
            data.image_url = handleImageUrl(data.image_url);
        }
    }

    export const getActivities = async (time: string): Promise<Nullable<ActivityModel[]>> => {
        const response = await request.get(`/activities?time=${time}`) as AxiosXHR<Nullable<ActivityModel[]>>;
        response.data?.map((item: ActivityModel) => preprocessData(item));
        return response.data;
    }

    export const getActivitiesPage = async (page: number, pageSize: number): Promise<Nullable<PageDataResponse<ActivityModel>>> => {
        const data = await getPageData<ActivityModel>("/activities/pages", page, pageSize);
        data?.items.map((item: ActivityModel) => preprocessData(item));
        return data;
    }

    export const getActivityById = async (activityId: number): Promise<Nullable<ActivityModel>> => {
        const response = await request.get(`/activities/${activityId}`) as AxiosXHR<Nullable<ActivityModel>>;
        preprocessData(response.data);
        return response.data;
    }

    export const createActivity = async (data: ActivityModel): Promise<boolean> => {
        const response = await request.post(`/activities`, data) as AxiosXHR<Nullable<Boolean>>;
        return response.status == 200 && response.data;
    }

    export const deleteActivity = async (activityId: number): Promise<boolean> => {
        const response = await request.delete(`/activities/${activityId}`) as AxiosXHR<Nullable<Boolean>>;
        return response.status == 200 && response.data;
    }

    export const saveActivity = async (data: ActivityModel): Promise<boolean> => {
        const response = await request.put(`/activities/${data.id}`, data) as AxiosXHR<Nullable<Boolean>>;
        return response.status == 200 && response.data;
    }

    export const pilotSign = async (activityId: number, callsign: string, aircraft_type: string): Promise<boolean> => {
        const response = await request.post(`/activities/${activityId}/pilots`, {
            callsign: callsign,
            aircraft_type: aircraft_type
        }) as AxiosXHR<Nullable<Boolean>>;
        return response.status == 200 && response.data;
    }

    export const pilotUnsign = async (activityId: number): Promise<boolean> => {
        const response = await request.delete(`/activities/${activityId}/pilots`) as AxiosXHR<Nullable<Boolean>>;
        return response.status == 200 && response.data;
    }

    export const controllerSign = async (activityId: number, facilityId: number): Promise<boolean> => {
        const response = await request.post(`/activities/${activityId}/controllers/${facilityId}`) as AxiosXHR<Nullable<Boolean>>;
        return response.status == 200 && response.data;
    }

    export const controllerUnsign = async (activityId: number, facilityId: number): Promise<boolean> => {
        const response = await request.delete(`/activities/${activityId}/controllers/${facilityId}`) as AxiosXHR<Nullable<Boolean>>;
        return response.status == 200 && response.data;
    }

    export const updateActivityStatus = async (activityId: number, status: number): Promise<boolean> => {
        const response = await request.put(`/activities/${activityId}/status`, {status: status}) as AxiosXHR<Nullable<Boolean>>;
        return response.status == 200 && response.data;
    }

    export const updatePilotStatus = async (activityId: number, pilotId: number, status: number): Promise<boolean> => {
        const response = await request.put(`/activities/${activityId}/pilots/${pilotId}/status`, {status: status}) as AxiosXHR<Nullable<Boolean>>;
        return response.status == 200 && response.data;
    }
}

export default ApiActivity;