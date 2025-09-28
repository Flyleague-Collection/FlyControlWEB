import request from "@/api/request.js";
import AxiosXHR = Axios.AxiosXHR;

export const getPageData = async <T>(url: string, page: number, pageSize: number): Promise<PageDataResponse<T>> => {
    const response = await request.get(`${url}?page_number=${page}&page_size=${pageSize}`) as AxiosXHR<PageDataResponse<T>>
    return response.data
}