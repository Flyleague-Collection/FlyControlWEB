import request from "@/api/request.js";
import Api from "@/api/utils.js";
import AxiosXHR = Axios.AxiosXHR;

export namespace ApiAnnouncement {
    import getPageData = Api.getPageData;

    export const deleteAnnouncement = async (announcementId: number): Promise<boolean> => {
        const response = await request.delete(`/announcements/${announcementId}`) as AxiosXHR<boolean>;
        return response.status == 200 && response.data
    }

    export const updateAnnouncement = async (announcementId: number, updateData: Record<string, string | boolean>): Promise<boolean> => {
        const response = await request.put(`/announcements/${announcementId}`, updateData) as AxiosXHR<boolean>
        return response.status == 200 && response.data
    }

    export const createAnnouncement = async (announcement: AnnouncementForm): Promise<boolean> => {
        const response = await request.post(`/announcements`, announcement) as AxiosXHR<boolean>
        return response.status == 200 && response.data
    }

    export const getDetailAnnouncements = async (page: number, pageSize: number): Promise<Nullable<PageDataResponse<AnnouncementModel>>> => {
        return getPageData<AnnouncementModel>(`/announcements/detail`, page, pageSize)
    }

    export const getAnnouncements = async (page: number, pageSize: number): Promise<Nullable<PageDataResponse<UserAnnouncementModel>>> => {
        return getPageData<UserAnnouncementModel>(`/announcements`, page, pageSize)
    }
}

export default ApiAnnouncement;