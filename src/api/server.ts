import request from "@/api/request.js";
import AxiosXHR = Axios.AxiosXHR;

export namespace Server {
    export const getServerInfo = async (): Promise<Nullable<GetServerInfoResponse>> => {
        const response = await request.get(`/server/info`) as AxiosXHR<Nullable<GetServerInfoResponse>>;
        return response.data;
    }

    export const getServerOnline = async (): Promise<Nullable<GetOnlineClientResponse>> => {
        const response = await request.get(`/clients`) as AxiosXHR<Nullable<GetOnlineClientResponse>>;
        return response.data;
    }

    export const getServerRating = async (): Promise<Nullable<GetServerRatingResponse>> => {
        const response = await request.get(`/server/rating`) as AxiosXHR<Nullable<GetServerRatingResponse>>
        return response.data;
    }

}

export default Server;