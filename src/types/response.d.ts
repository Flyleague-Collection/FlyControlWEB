type LoginResponse = {
    user: UserModel;
    flush_token: string;
    token: string;
}

type RegisterResponse = LoginResponse

type GetUserHistoryResponse = {
    total_pilot_time: number;
    total_atc_time: number;
    controllers: HistoryModel[];
    pilots: HistoryModel[];
}

type GetActivitiesPageResponse = {
    items: ActivityModel[];
    page: number;
    page_size: number;
    total: number;
}
