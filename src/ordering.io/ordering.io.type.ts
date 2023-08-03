export interface Address {
    lat: number;
    lng: number;
}

export interface Session {
    access_token: string;
    token_type: string;
    expires_in: number;
}

export interface OrderingIoUser {
    id: number;
    name: string;
    lastname: string;
    email: string;
    login_type: number;
    social_id: string | null;
    photo: string | null;
    birthdate: string | null;
    phone: string;
    cellphone: string;
    city_id: number;
    dropdown_option_id: number;
    address: string;
    address_notes: string;
    zipcode: string;
    location: Address;
    level: number;
    language_id: number;
    push_notifications: boolean;
    busy: boolean;
    available: boolean;
    enabled: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    session: Session;
    dropdown_option: any | null;
}

type Lapse = {
    open: {
        hour: number;
        minute: number;
    };
    close: {
        hour: number;
        minute: number;
    };
};

export type Schedule = {
    enabled: boolean;
    lapses: Lapse[];
};