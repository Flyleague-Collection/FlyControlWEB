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

type OnlineControllerModel = {
    atc_info: string[];
    callsign: string;
    cid: number;
    facility: number;
    frequency: number;
    latitude: number;
    logon_time: string;
    offline_time: string;
    is_break: boolean;
    longitude: number;
    rating: number;
    real_name: string;
}

type OnlinePilotModel = {
    altitude: number;
    callsign: string;
    cid: number;
    flight_plan: FlightPlanModel;
    ground_speed: number;
    heading: number;
    latitude: number;
    logon_time: string;
    longitude: number;
    real_name: string;
    transponder: string;
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