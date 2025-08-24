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
    controllers?: ActivityControllerModel[];
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