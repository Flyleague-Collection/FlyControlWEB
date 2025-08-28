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

