import { SessionService } from "src/auth/session.service";
import { OrderStatusDto } from "../dto/order.dto";
import { UtilsService } from "src/utils/utils.service";

export abstract class BaseOrderProvider {
    constructor(
        readonly sessionService: SessionService,
        readonly utilService: UtilsService
    ) {}

    name: string;
    public getOrders(statuses: OrderStatusDto[], sessionPublicId: string): void;
}