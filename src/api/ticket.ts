import request from "@/api/request.js";
import Api from "@/api/utils.js";
import AxiosXHR = Axios.AxiosXHR;

export namespace ApiTicket {
    import getPageData = Api.getPageData;

    export const getSelfTickets = async (page: number, pageSize: number): Promise<Nullable<PageDataResponse<TicketModel>>> => {
        return getPageData<TicketModel>("/tickets/self", page, pageSize);
    }

    export const getTickets = async (page: number, pageSize: number): Promise<Nullable<PageDataResponse<TicketModel>>> => {
        return getPageData<TicketModel>("/tickets", page, pageSize);
    }

    export const createTicket = async (ticketType: number, title: string, content: string): Promise<boolean> => {
        const response = await request.post(`/tickets`, {
            type: ticketType,
            title: title,
            content: content
        }) as AxiosXHR<boolean>;
        return response.data;
    }

    export const replyTicket = async (ticketId: number, reply: string): Promise<boolean> => {
        const response = await request.put(`/tickets/${ticketId}`, {reply: reply}) as AxiosXHR<boolean>;
        return response.status == 200 && response.data;
    }

    export const deleteTicket = async (ticketId: number): Promise<boolean> => {
        const response = await request.delete(`/tickets/${ticketId}`) as AxiosXHR<boolean>;
        return response.status == 200 && response.data;
    }
}

export default ApiTicket;