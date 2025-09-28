type PageDataResponse<T> = {
    items: T[];
    total: number;
    page: number;
    page_size: number;
} | null

type Nullable<T> = T | null

type ApiResponse<T> = {
    code: string;
    message: string;
    data: Nullable<T>;
}

