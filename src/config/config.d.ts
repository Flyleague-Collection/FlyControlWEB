type Config = {
    icon_path: string;
    title: string;
    backend_url: string;
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