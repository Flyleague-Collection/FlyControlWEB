type ActivityModel = {
    id: number;
    publisher: number;
    title: string;
    image_url: string;
    active_time: string;
    departure_airport: string;
    arrival_airport: string;
    route: string;
    distance: number;
    status: number;
    NOTAMS: string;
    start_time?: string;
    pilots?: ActivityPilotModel[];
    facilities?: ActivityFacilityModel[];
}

type ActivityControllerModel = {
    id: number;
    activity_id: number;
    facility_id: number;
    cid: number;
}

type ActivityFacilityModel = {
    id: number;
    activity_id: number;
    min_rating: number;
    callsign: string;
    frequency: string;
    controller?: ActivityControllerModel;
}

type ActivityPilotModel = {
    id: number;
    activity_id: number;
    cid: number;
    callsign: string;
    aircraft_type: string;
    status: number;
}

type Callback = () => void;

type TimerOption = {
    duration: number;
    onTick?: (remainingSeconds: number) => void;
    onComplete?: Callback;
    autoStart?: boolean;
}

type ServerConfig = {
    limits: Limits;
    facilities: FacilityModel[];
    ratings: RatingModel[];
}

type Limits = {
    cid_max: number;
    cid_min: number;
    email_length_max: number;
    email_length_min: number;
    password_length_max: number;
    password_length_min: number;
    simulator_server: boolean;
    username_length_max: number;
    username_length_min: number;
}

type FacilityModel = {
    id: number;
    long_name: string;
    short_name: string;
}


type RatingModel = {
    id: number;
    long_name: string;
    short_name: string;
}
