import { OrderingIoService } from './../../ordering.io/ordering.io.service';
import { OrderDto, OrderStatusDto } from '../dto/order.dto';
import { BaseOrderProvider } from './base-provider'
import { OrderingOrderStatus } from 'src/ordering.io/ordering.io.type';
import { SessionService } from 'src/auth/session.service';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UtilsService } from 'src/utils/utils.service';

export class OrderingOrderProvider extends BaseOrderProvider {

    constructor(
        private readonly orderingIoService: OrderingIoService,
        readonly sessionService: SessionService,
        readonly utilService: UtilsService
    ) {
        super(sessionService, utilService);
    }

    async getOrders(statuses: OrderStatusDto[], sessionPublicId: string) {

        const findSessionArgs = Prisma.validator<Prisma.SessionFindFirstArgsBase>()({
            select: {
                id: true,
                refreshToken: true,
                user: {
                    select: {
                        id: true,
                        orderingUserId: true
                    }
                },
                businesses: {
                    select: {
                        id: true,
                        publicId: true,
                        orderingBusinessId: true
                    }
                }
            }
        })

        const session = await this.sessionService.getSessionByPublcId<Prisma.SessionGetPayload<typeof findSessionArgs>>(sessionPublicId, findSessionArgs);

        if (!session || !session.businesses || !session.user.orderingUserId) {
            throw new NotFoundException('Session not found');
        }

        const accessToken = await this.utilService.getOrderingAccessToken(session.user.orderingUserId);
        const businessIds = session.businesses.map(business => business.orderingBusinessId);

        let queryStatuses = [];

        statuses.forEach(status => {
            switch (status) {
                case OrderStatusDto.PREORDER:
                    queryStatuses = queryStatuses.concat([
                        OrderingOrderStatus.PREORDER
                    ])
                    break;
                case OrderStatusDto.PENDING:
                    queryStatuses = queryStatuses.concat([
                        OrderingOrderStatus.PENDING
                    ])
                    break;
                case OrderStatusDto.IN_PROGRESS:
                    queryStatuses = queryStatuses.concat([
                        OrderingOrderStatus.ACCEPTED_BY_BUSINESS,
                        OrderingOrderStatus.ACCEPTED_BY_DRIVER,
                    ])
                    break;
                case OrderStatusDto.READY:
                    queryStatuses = queryStatuses.concat([
                        OrderingOrderStatus.PREPARATION_COMPLETED
                    ])
                    break;
                default:
                    break;
            }
        })

        const orderingOrders = await this.orderingIoService.getOrders(
            accessToken,
            businessIds,
            queryStatuses
        )

        // Convert
    }
}
