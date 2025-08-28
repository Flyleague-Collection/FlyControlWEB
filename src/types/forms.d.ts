type LoginForm = {
    username: string,
    password: string,
}

type RegisterForm = {
    cid: number;
    email: string;
    email_code: number;
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
