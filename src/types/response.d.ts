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

type GetUsersPageResponse = {
    items: UserModel[];
    page: number;
    page_size: number;
    total: number;
}

type GetAuditLogsPageResponse = {
    items: AuditLogModel[];
    page: number;
    page_size: number;
    total: number;
}

type GetServerInfoResponse = {
    total_user: number;
    total_controller: number;
    total_activity: number;
}

type ServerRatingModel = {
    cid: number;
    avatar_url: string;
    time: number;
}

type GetServerRatingResponse = {
    pilots: ServerRatingModel[];
    controllers: ServerRatingModel[];
}

type GetOnlineClientResponse = {
    general: {
        connected_clients: number;
        generate_time: string;
        online_controller: number;
        online_pilot: number;
        version: number;
    };
    controllers: OnlineControllerModel[];
    pilots: OnlinePilotModel[];
}

type PageDataResponse<T> = {
    items: T[];
    total: number;
    page: number;
    page_size: number;
}