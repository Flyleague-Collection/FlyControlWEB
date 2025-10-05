import request from "@/api/request.js";
import AxiosXHR = Axios.AxiosXHR;

export namespace ApiFile {
    export const uploadImage = async (file: File): Promise<string | null> => {
        const formData = new FormData()
        formData.append('file', file)
        const response = await request.post('/files/images', formData) as AxiosXHR<{
            file_size: number;
            access_path: string;
        }>
        if (response.status == 200) {
            return response.data.access_path;
        }
        return null;
    }

    export const isImageFile = (file: File): boolean => {
        return file.type.startsWith('image/')
    }
}

export default ApiFile;