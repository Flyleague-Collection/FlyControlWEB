type ServerInfoModel = {
    total_user: number;
    total_controller: number;
    total_activity: number;
}

type ServerRatingModel = {
    cid: number;
    avatar_url: string;
    time: number;
}

type ServerRatingsModel = {
    pilots: ServerRatingModel[];
    controllers: ServerRatingModel[];
}

type FileLimit = {
    max_allow_size: number;
    allowed_ext: string[];
}

type FacilityName = {
    id: number;
    short_name: string;
    long_name: string;
}

type RatingName = FacilityName

type ServerConfigModel = {
    image_limit: FileLimit;
    file_limit: FileLimit;
    email_send_interval: number;
    facilities: FacilityName[];
    ratings: RatingName[]
}