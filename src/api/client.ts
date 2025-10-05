import request from "@/api/request.js";
import AxiosXHR = Axios.AxiosXHR;

export namespace ApiClient {
    export const getOnlineClient = async (): Promise<Nullable<OnlineClientModel>> => {
        const response = await request.get(`/clients`) as AxiosXHR<Nullable<OnlineClientModel>>;
        return response.data;
    }

    export const getClientFlightPath = async (callsign: string): Promise<Nullable<FlightPathPoint[]>> => {
        const response = await request.get(`/clients/paths/${callsign}`) as AxiosXHR<Nullable<FlightPathPoint[]>>;
        return response.data;
    }

    export const sendMessageToClient = async (callsign: string, message: string): Promise<boolean> => {
        const response = await request.post(`/clients/messages/${callsign}`, {message}) as AxiosXHR<boolean>;
        return response.status == 200 && response.data;
    }

    export const broadcastMessageToClient = async (target: string, message: string): Promise<boolean> => {
        const response = await request.post(`/clients/messages`, {
            target: target,
            message: message
        }) as AxiosXHR<boolean>;
        return response.status == 200 && response.data;
    }

    export const kickClientFromServer = async (callsign: string, reason: string): Promise<Nullable<FlightPathPoint[]>> => {
        const response = await request.delete(`/clients/${callsign}`, {data: {reason: reason}}) as AxiosXHR<boolean>;
        return response.status == 200 && response.data;
    }
}

export default ApiClient;