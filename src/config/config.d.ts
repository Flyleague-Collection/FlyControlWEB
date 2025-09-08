type Config = {
    icon_path: string;
    title: string;
    backend_url: string;
    mapbox_token: string;
    flight_path_color: string;
    atc_border: string,
    atc_fill: string,
    rating_color: string[];
    activity_status: {
        label: string;
        class: string;
        value: number;
    }[];
    pilot_status: {
        label: string;
        class: string;
        value: number;
    }[];
    ratings: {
        label: string;
        value: number;
    }[];
}

type Airports = { value: string }[]