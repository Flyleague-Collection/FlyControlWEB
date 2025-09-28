import request from "@/api/request.js";
import AxiosXHR = Axios.AxiosXHR;
import {getPageData} from "@/api/utils.js";

export namespace Announcement {
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

    export const getDetailAnnouncements = async (page: number, pageSize: number): Promise<PageDataResponse<AnnouncementModel>> => {
        return getPageData<AnnouncementModel>(`/announcements/detail`, page, pageSize)
    }

    export const getAnnouncements = async (page: number, pageSize: number): Promise<PageDataResponse<UserAnnouncementModel>> => {
        return getPageData<UserAnnouncementModel>(`/announcements`, page, pageSize)
    }
}

export default Announcement;