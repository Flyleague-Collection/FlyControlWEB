type PageDataResponse<T> = {
    items: T[];
    total: number;
    page: number;
    page_size: number;
}

type Nullable<T> = T | null

