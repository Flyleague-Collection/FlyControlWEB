import request from "@/api/request.js";
import Api from "@/api/utils.js";
import {formatDate, handleImageUrl} from "@/utils/utils.js";
import AxiosXHR = Axios.AxiosXHR;

export namespace ApiUser {
    import getPageData = Api.getPageData;

    const preprocessUserData = (data: Nullable<UserModel>) => {
        if (data) {
            data.avatar_url = handleImageUrl(data.avatar_url);
        }
    }

    const preprocessHistoryData = (item: HistoryModel) => {
        item.start_time = formatDate(item.start_time);
        item.end_time = formatDate(item.end_time);
    }

    export const userLogin = async (username: string, password: string): Promise<Nullable<LoginData>> => {
        const response = await request.post("/users/sessions", {
            username: username,
            password: password
        }) as AxiosXHR<Nullable<LoginData>>;
        preprocessUserData(response.data?.user);
        return response.data;
    }

    export const userRegister = async (data: RegisterData): Promise<boolean> => {
        const response = await request.post("/users", data) as AxiosXHR<Nullable<boolean>>;
        return response.status == 200 && response.data;
    }

    export const getSelfProfileWithToken = async (token: string): Promise<Nullable<UserModel>> => {
        const response = await request.get("/users/profiles/self", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }) as AxiosXHR<Nullable<UserModel>>;
        preprocessUserData(response.data);
        return response.data;
    }

    export const getSelfProfile = async (): Promise<Nullable<UserModel>> => {
        const response = await request.get("/users/profiles/self") as AxiosXHR<Nullable<UserModel>>;
        preprocessUserData(response.data);
        return response.data;
    }

    export const flushAccessToken = async (flushToken: string, first: boolean): Promise<Nullable<FlushTokenData>> => {
        const response = await request.get(`/users/sessions?first=${first}`, {
            headers: {
                Authorization: `Bearer ${flushToken}`
            }
        }) as AxiosXHR<Nullable<FlushTokenData>>;
        preprocessUserData(response.data?.user);
        return response.data;
    }

    export const getUserByUid = async (uid: number): Promise<Nullable<UserModel>> => {
        const response = await request.get(`/users/profiles/${uid}`) as AxiosXHR<Nullable<UserModel>>;
        preprocessUserData(response.data);
        return response.data;
    }

    export const getUserPage = async (page: number, pageSize: number): Promise<Nullable<PageDataResponse<UserModel>>> => {
        const data = await getPageData<UserModel>("/users", page, pageSize);
        data?.items.map((item: UserModel) => preprocessUserData(item))
        return data
    }

    export const checkCID = async (cid: number): Promise<boolean> => {
        if (cid <= 0) {
            return true;
        }
        const response = await request.get(`/users/availability?cid=${cid}`) as AxiosXHR<Nullable<boolean>>;
        return response.data;
    }

    export const checkUsername = async (username: string): Promise<boolean> => {
        if (username == "") {
            return true;
        }
        const response = await request.get(`/users/availability?username=${username}`) as AxiosXHR<Nullable<boolean>>;
        return response.data;
    }

    export const checkEmail = async (email: string): Promise<boolean> => {
        if (email == "") {
            return true;
        }
        const response = await request.get(`/users/availability?email=${email}`) as AxiosXHR<Nullable<boolean>>;
        return response.data;
    }

    export const updateUserInformation = async (uid: number, data: UpdateUserProfileData): Promise<boolean> => {
        const response = await request.patch(`/users/profiles/${uid}`, data) as AxiosXHR<Nullable<boolean>>;
        return response.status == 200 && response.data;
    }

    export const updateSelfInformation = async (data: UpdateUserProfileData): Promise<boolean> => {
        const response = await request.patch(`/users/profiles/self`, data) as AxiosXHR<boolean>
        return response.status == 200 && response.data;
    }

    export const updateUserPassword = async (originPassword: string, newPassword: string): Promise<boolean> => {
        return updateSelfInformation({
            origin_password: originPassword,
            new_password: newPassword
        });
    }

    export const getUserHistories = async (): Promise<Nullable<UserHistoryData>> => {
        const response = await request.get(`/users/histories/self`) as AxiosXHR<Nullable<UserHistoryData>>;
        response.data?.pilots.forEach(preprocessHistoryData);
        response.data?.controllers.forEach(preprocessHistoryData);
        return response.data;
    }

    export const resetUserPassword = async (email: string, email_code: string, password: string): Promise<boolean> => {
        const response = await request.post(`/users/password`, {
            email: email,
            email_code: email_code,
            password: password
        }) as AxiosXHR<Nullable<boolean>>;
        return response.status == 200 && response.data;
    }

    export const updateUserPermission = async (id: number, permission: Record<string, boolean>): Promise<boolean> => {
        const response = await request.patch(`/users/profiles/${id}/permission`, {permissions: permission}) as AxiosXHR<boolean>;
        return response.status == 200 && response.data;
    }
}

export default ApiUser;