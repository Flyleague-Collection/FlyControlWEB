type LoginForm = {
    username: string,
    password: string,
}

type RegisterForm = {
    cid: number;
    email: string;
    email_code: string;
    password: string;
    confirmPassword: string;
    username: string;
}

type EmailCodeForm = {
    email: string;
    cid: number;
}

type ActivityPilotSignForm = {
    callsign: string;
    aircraft_type: string;
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
    qq?: number
}