import request from "@/api/request.js";
import AxiosXHR = Axios.AxiosXHR;
import Api from "@/api/utils.js";

export namespace ApiFlightPlan {
    import getPageData = Api.getPageData;
    export const getSelfFlightPlan = async (): Promise<Nullable<FlightPlanModel>> => {
        const response = await request.get(`/plans/self`) as AxiosXHR<Nullable<FlightPlanModel>>;
        return response.data;
    }

    export const getFlightPlans = async (page: number, pageSize: number): Promise<Nullable<PageDataResponse<FlightPlanModel>>> => {
        return getPageData<FlightPlanModel>("/plans", page, pageSize);
    }

    export const deleteSelfFlightPlan = async (): Promise<boolean> => {
        const response = await request.delete(`/plans/self`) as AxiosXHR<boolean>;
        return response.status == 200 && response.data;
    }

    export const submitFlightPlan = async (data: FlightPlanModel): Promise<boolean> => {
        const response = await request.post(`/plans`, data) as AxiosXHR<boolean>;
        return response.status == 200 && response.data;
    }

    export const deleteFlightPlan = async (cid: number): Promise<boolean> => {
        const response = await request.delete(`/plans/${cid}`) as AxiosXHR<boolean>;
        return response.status == 200 && response.data;
    }


    export const lockFlightPlan = async (cid: number): Promise<boolean> => {
        const response = await request.put(`/plans/${cid}/lock`) as AxiosXHR<boolean>;
        return response.status == 200 && response.data;
    }

    export const unlockFlightPlan = async (cid: number): Promise<boolean> => {
        const response = await request.delete(`/plans/${cid}/lock`) as AxiosXHR<boolean>;
        return response.status == 200 && response.data;
    }
}

export default ApiFlightPlan;