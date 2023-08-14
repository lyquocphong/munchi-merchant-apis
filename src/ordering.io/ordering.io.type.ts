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

export enum OrderingOrderStatus {
    PENDING = 0,
    COMPLETED = 1,
    REJECTED = 2,
    PREPARATION_COMPLETED = 4,
    REJECTED_BY_BUSINESS = 5,
    ACCEPTED_BY_BUSINESS = 7,
    ACCEPTED_BY_DRIVER = 8,
    PICK_UP_COMPLETED_BY_DRIVER = 9,
    PICK_UP_FAILED_BY_DRIVER = 10,
    DELIVERY_COMPLETED_BY_DRIVER = 11,
    DELIVERY_FAILED_BY_DRIVER = 12,
    PREORDER = 13,
    ORDER_NOT_READY = 14,
    PICK_UP_COMPLETED_BY_CUSTOMER = 15,
}

export enum OrderingOrderType {
    DELIVERY = 1,
    PICK_UP = 2,
    EATIN = 3,
    CURBSIDE = 4,
    DRIVER_THRU = 5,
}