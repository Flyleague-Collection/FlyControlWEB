type Config = {
    icon_path: string;
    title: string;
    backend_url: string;
    rating_color: string[];
    activity_status: {
        text: string;
        class: string;
    }[]
    pilot_status: {
        text: string;
        class: string;
    }[]
}

type Airports = { value: string }[]