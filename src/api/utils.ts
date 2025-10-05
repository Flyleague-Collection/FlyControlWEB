import request from "@/api/request.js";
import AxiosXHR = Axios.AxiosXHR;

export namespace Api {
    export const getPageData = async <T>(url: string, page: number, pageSize: number): Promise<Nullable<PageDataResponse<T>>> => {
        const response = await request.get(`${url}?page_number=${page}&page_size=${pageSize}`) as AxiosXHR<Nullable<PageDataResponse<T>>>
        return response.data
    }

    export const sendEmailCode = async (email: string, cid: number): Promise<Nullable<boolean>> => {
        const response = await request.post("/codes", {email: email, cid: cid}) as AxiosXHR<Nullable<{
            email: string
        }>>;
        return response.status == 200 && response.data != null && response.data.email == email;
    }

    export const getMetar = async (icao: string): Promise<Nullable<string[]>> => {
        const response = await request.get(`/metar?icao=${icao}`) as AxiosXHR<Nullable<string[]>>;
        return response.data;
    }

    export const getAuditLogs = async <T>(page: number, pageSize: number): Promise<Nullable<PageDataResponse<AuditLogModel>>> => {
        return getPageData<AuditLogModel>("/audits", page, pageSize);
    }
}

export default Api;
