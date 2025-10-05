



type EmailCodeForm = {
    email: string;
    cid: number;
}



type ChangePasswordForm = {
    origin_password: string,
    new_password: string,
    confirm_password: string,
}

type UpdateUserInfoForm = {
    username: string,
    email: string,
    email_code?: number,
    avatar_url?: string,
    qq?: number
}