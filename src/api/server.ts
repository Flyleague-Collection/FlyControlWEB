import request from "@/api/request.js";
import AxiosXHR = Axios.AxiosXHR;

export namespace ApiServer {
    export const getServerInfo = async (): Promise<Nullable<ServerInfoModel>> => {
        const response = await request.get(`/server/info`) as AxiosXHR<Nullable<ServerInfoModel>>;
        return response.data;
    }

    export const getServerRating = async (): Promise<Nullable<ServerRatingsModel>> => {
        const response = await request.get(`/server/rating`) as AxiosXHR<Nullable<ServerRatingsModel>>
        return response.data;
    }

    export const getServerConfig = async (): Promise<Nullable<ServerConfigModel>> => {
        const response = await request.get(`/server/config`) as AxiosXHR<Nullable<ServerConfigModel>>;
        return response.data;
    }
}

export default ApiServer;