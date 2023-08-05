import { Expose, Type } from 'class-transformer';

export interface Address {
    lat: number;
    lng: number;
}

class Session {
    @Expose()
    access_token: string;

    @Expose()
    token_type: string;

    @Expose()
    expires_in: number;
}

export class OrderingIoUser {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    lastname: string;

    @Expose()
    email: string;
    // login_type: number;
    // social_id: string | null;
    // photo: string | null;
    // birthdate: string | null;
    // phone: string;
    // cellphone: string;
    // city_id: number;
    // dropdown_option_id: number;
    // address: string;
    // address_notes: string;
    // zipcode: string;
    // location: Address;

    @Expose()
    level: number;

    @Expose()
    language_id: number;
    //push_notifications: boolean;
    //busy: boolean;
    //available: boolean;
    //enabled: boolean;
    // created_at: string;
    // updated_at: string;
    // deleted_at: string | null;

    @Expose()
    @Type(() => Session)
    session: Session;
    //dropdown_option: any | null;
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