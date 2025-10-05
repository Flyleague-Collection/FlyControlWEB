type ControllerModel = UserModel;

type ControllerRating = {
    avatar_url: string;
    cid: number;
    is_guest: boolean;
    rating: number;
    solo_until: Date;
    under_monitor: boolean;
    under_solo: boolean;
}

type ControllerRecordModel = {
    id: number;
    type: number;
    uid: number;
    operator_cid: number;
    content: string;
    time: Date;
}

type ControllerApplicationModel = {
    id: number;
    controller_record: string;
    evidence: string;
    is_guest: boolean;
    message: string;
    platform: string;
    status: number;
    user: UserModel;
    user_id: number;
    why_want_to_be_controller: string;
    created_at: string;
}

type ApplicationData = {
    why_want_to_be_controller: string;
    controller_record: string;
    is_guest: boolean;
    platform: string;
    evidence: string;
}

type PilotSignData = {
    callsign: string;
    aircraft_type: string;
}