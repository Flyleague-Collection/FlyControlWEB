






type AuditLogModel = {
    id: number;
    time: string;
    event_type: string;
    subject: number;
    object: string;
    ip: string;
    user_agent: string;
    change_details?: {
        old_value: string;
        new_value: string;
    }
}

type ServerConfigModel = {
    limits: {
        cid_max: number;
        cid_min: number;
        email_length_max: number;
        email_length_min: number;
        password_length_max: number;
        password_length_min: number;
        simulator_server: boolean;
        username_length_max: number;
        username_length_min: number;
    };
    image_limit: {
        max_allow_size: number;
        allowed_ext: string[];
    };
    email_send_interval: number;
    facilities: {
        id: number;
        long_name: string;
        short_name: string;
    }[];
    ratings: {
        id: number;
        long_name: string;
        short_name: string;
    }[];
}





