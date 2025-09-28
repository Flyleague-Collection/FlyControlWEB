type AnnouncementForm = {
    type: number;
    title: string;
    content: string;
    important: boolean;
    force_show: boolean;
}

type AnnouncementModel = {
    id: number;
    publisher_id: number;
    user: UserModel;
    title: string;
    content: string;
    type: number;
    force_show: boolean;
    important: boolean;
    created_at: Date;
    updated_at: Date;
}

type UserAnnouncementModel = {
    id: number;
    title: string;
    content: string;
    type: number;
    force_show: boolean;
    important: boolean;
    created_at: Date;
    updated_at: Date;
}