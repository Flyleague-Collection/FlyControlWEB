type UserModel = {
    username: string;
    email: string;
    cid: number;
    permission: number;
    qq: number;
    avatar_url: string;
    rating: number;
    total_atc_time: number;
    total_pilot_time: number;
}

type HistoryModel = {
    callsign: string;
    start_time: string;
    end_time: string;
    online_time: number;
}

type OnlineControllerModel = {
    atc_info: string[];
    callsign: string;
    cid: number;
    facility: number;
    frequency: number;
    latitude: number;
    logon_time: string;
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
    paths: {
        latitude: number;
        longitude: number;
        altitude: number;
    }[];
    real_name: string;
    transponder: string;
}

type FlightPlanModel = {
    aircraft: string;
    alternate: string;
    altitude: string;
    arrival: string;
    callsign: string;
    cid: number;
    cruise_tas: number;
    departure: string;
    departure_time: number;
    flight_rules: string;
    fuel_time_hour: string;
    fuel_time_minute: string;
    remarks: string;
    route: string;
    route_time_hour: string;
    route_time_minute: string;
}
