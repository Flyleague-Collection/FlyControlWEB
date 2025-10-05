import Api from "@/api/utils.js";
import request from "@/api/request.js";
import AxiosXHR = Axios.AxiosXHR;
import {ApplicationStatus} from "@/global.js";
import {handleImageUrl} from "@/utils/utils.js";

export namespace ApiController {
    import getPageData = Api.getPageData;

    export const getControllers = async (page: number, pageSize: number): Promise<Nullable<PageDataResponse<ControllerModel>>> => {
        return getPageData<ControllerModel>("/controllers", page, pageSize);
    }

    export const getControllerRatings = async (page: number, pageSize: number): Promise<Nullable<PageDataResponse<ControllerRating>>> => {
        return getPageData<ControllerRating>("/controllers/ratings", page, pageSize);
    }

    export const getSelfRecords = async (page: number, pageSize: number): Promise<Nullable<PageDataResponse<ControllerRecordModel>>> => {
        return getPageData<ControllerRecordModel>("/controllers/records/self", page, pageSize);
    }

    export const getSelfApplication = async (): Promise<Nullable<ControllerApplicationModel>> => {
        const response = await request.get(`/controllers/applications/self`) as AxiosXHR<Nullable<ControllerApplicationModel>>;
        return response.data;
    }

    export const submitApplication = async (application: ApplicationData): Promise<boolean> => {
        const response = await request.post(`/controllers/applications`, application) as AxiosXHR<Nullable<boolean>>;
        return response.status == 200 && response.data;
    }

    export const cancelApplication = async (): Promise<boolean> => {
        const response = await request.delete(`/controllers/applications/self`) as AxiosXHR<Nullable<boolean>>;
        return response.status == 200 && response.data;
    }

    export const updateControllerRating = async (id: number, ratings: Record<string, string | number | boolean>): Promise<boolean> => {
        const response = await request.put(`/controllers/${id}/rating`, ratings) as AxiosXHR<Nullable<boolean>>;
        return response.status == 200 && response.data;
    }

    export const getControllerRecords = async (id: number, page: number, pageSize: number): Promise<Nullable<PageDataResponse<ControllerRecordModel>>> => {
        return getPageData<ControllerRecordModel>(`/controllers/records/${id}`, page, pageSize);
    }

    export const createControllerRecord = async (id: number, type: number, content: string): Promise<boolean> => {
        const response = await request.post(`/controllers/records/${id}`, {
            type: type,
            content: content
        }) as AxiosXHR<Nullable<boolean>>;
        return response.status == 200 && response.data;
    }

    export const deleteControllerRecord = async (id: number, recordId: number): Promise<boolean> => {
        const response = await request.delete(`/controllers/records/${id}/${recordId}`) as AxiosXHR<Nullable<boolean>>;
        return response.status == 200 && response.data;
    }

    export const getControllerApplications = async (page: number, pageSize: number): Promise<Nullable<PageDataResponse<ControllerApplicationModel>>> => {
        const data = await getPageData<ControllerApplicationModel>("/controllers/applications", page, pageSize);
        data?.items.forEach(item => item.evidence = handleImageUrl(item.evidence));
        return data;
    }

    export const confirmControllerApplication = async (id: number, data: string[]): Promise<boolean> => {
        const response = await request.put(`/controllers/applications/${id}`, {
            status: ApplicationStatus.Processing,
            time: data
        }) as AxiosXHR<boolean>;
        return response.status == 200 && response.data;
    }

    export const passControllerApplication = async (id: number, message: string): Promise<boolean> => {
        const response = await request.put(`/controllers/applications/${id}`, {
            status: ApplicationStatus.Passed,
            message: message
        }) as AxiosXHR<boolean>;
        return response.status == 200 && response.data;
    }

    export const refuseControllerApplication = async (id: number, message: string): Promise<boolean> => {
        const response = await request.put(`/controllers/applications/${id}`, {
            status: ApplicationStatus.Rejected,
            message: message
        }) as AxiosXHR<boolean>;
        return response.status == 200 && response.data;
    }
}

export default ApiController;