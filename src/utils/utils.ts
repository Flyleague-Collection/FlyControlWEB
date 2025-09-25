import config from "@/config/index.js";
import {padStart} from "lodash-es";

export const KB = 1024
export const MB = 1024 * KB
export const GB = 1024 * MB

export const sizeToString = (size: number): string => {
    if (size < KB) {
        return `${size}B`;
    }
    if (size < MB) {
        return `${(size / KB).toFixed(2)}KB`;
    }
    if (size < GB) {
        return `${(size / MB).toFixed(2)}MB`;
    }
    return `${(size / GB).toFixed(2)}GB`;
}

export const handleImageUrl = (url: string): string => {
    if (url == "") {
        return "";
    }
    if (!url.startsWith("http")) {
        return `${config.backend_url}/${url}`;
    }
    return url;
}

export const formatCid = (cid?: number): string => {
    return padStart(cid ? cid.toString() : cid, 4, '0')
}