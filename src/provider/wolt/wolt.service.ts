import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import axios, { AxiosHeaders } from 'axios';
import { AvailableOrderStatus, OrderResponse, OrderStatusEnum } from 'src/order/dto/order.dto';
import { ProductDto } from 'src/order/dto/product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderData } from 'src/type';
import { UtilsService } from 'src/utils/utils.service';
import { OrderingDeliveryType } from '../ordering/ordering.type';
import { ProviderService } from '../provider.service';
import { ProviderEnum, ProviderOrder } from '../provider.type';
import {
  WoltItem,
  WoltOrder,
  WoltOrderNotification,
  WoltOrderType,
  WoltOrderPrismaSelectArgs,
  AvailableWoltOrderStatus,
} from './wolt.type';

@Injectable()
export class WoltService implements ProviderService {
  private woltApiUrl: string;
  private woltApiKey: string;
  private header: AxiosHeaders;

  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
    private utilsService: UtilsService,
  ) {
    this.woltApiUrl = this.configService.get('WOLT_API_DEV_URL');
    this.woltApiKey = this.configService.get('WOLT_API_KEY');
    this.header = {
      'WOLT-API-KEY': this.woltApiKey,
    } as any;
  }
  async getOrderByStatus(
    accessToken: string,
    status: AvailableOrderStatus,
    businessIds: string[],
  ): Promise<any[]> {
    const orders = await this.prismaService.order.findMany({
      where: {
        status: status,
        orderingBusinessId: {
          in: businessIds,
        },
      },
      orderBy: {
        id: 'desc',
      },
      include: WoltOrderPrismaSelectArgs,
    });
    return orders;
  }

  public async getAllOrder() {
    return await this.prismaService.order.findMany({
      orderBy: {
        id: 'desc',
      },
      include: {
        business: true,
        offers: true,
        preorder: true,
        products: {
          include: {
            option: {
              include: {
                subOption: true,
              },
            },
          },
        },
      },
    });
  }

  public async getOrderById(woltOrdeId: string): Promise<WoltOrder> {
    try {
      const response = await axios.request({
        method: 'GET',
        baseURL: `${this.woltApiUrl}/orders/${woltOrdeId}`,
        headers: this.header as any,
      });

      return response.data;
    } catch (error) {
      this.utilsService.logError(error);
    }
  }

  async sendWoltUpdateRequest(
    woltOrderId: string,
    endpoint: string,
    updateData?: Omit<OrderData, 'provider'>,
  ) {
    try {
      const response = await axios.request({
        method: 'PUT',
        baseURL: `${this.woltApiUrl}/orders/${woltOrderId}/${endpoint}`,
        headers: this.header as any,
        data:
          endpoint === 'reject'
            ? {
                reason: 'Your order has been rejected, please contact the restaurant for more info',
              }
            : null,
      });

      return response.data;
    } catch (error) {
      console.log('🚀 ~ WoltService ~ error:', error);
      this.utilsService.logError(error);
    }
  }

  public async updateOrder(
    accessToken: string,
    woltOrderId: string,
    updateData: Omit<OrderData, 'provider'>,
  ): Promise<any> {
    const { orderStatus, preparedIn } = updateData;
    //Get wolt order by id
    const order = await this.getOrderByIdFromDb(woltOrderId);
    const woltOrder = await this.getOrderById(order.orderId);
    const updateEndPoint = this.generateWoltUpdateEndPoint(updateData.orderStatus, woltOrder);
    console.log('🚀 ~ WoltService ~ updateEndPoint:', updateEndPoint, woltOrder.order_status);
    const updatedOrder = await this.prismaService.order.update({
      where: {
        orderId: woltOrder.id,
      },
      data: {
        preparedIn: preparedIn ? preparedIn.toString() : null,
        status: orderStatus,
      },
      include: WoltOrderPrismaSelectArgs,
    });
    console.log("🚀 ~ WoltService ~ updatedOrder:", updatedOrder)

    if (updateEndPoint !== woltOrder.order_status) {
      console.log('this is not equal');
      await this.sendWoltUpdateRequest(woltOrder.id, updateEndPoint);
      return updatedOrder;
    }
    return updatedOrder;
  }

  public async updateSelfDeliveryOrder<OrderResponse>(woltOrdeId: string): Promise<OrderResponse> {
    try {
      const response = await axios.request({
        method: 'PUT',
        baseURL: `${this.woltApiUrl}/orders/${woltOrdeId}/self-delivery/accept`,
        headers: this.header as any,
      });

      return response.data;
    } catch (error) {
      this.utilsService.logError(error);
    }
  }

  public async deleteOrder<OrderResponse>(woltOrdeId: string): Promise<OrderResponse> {
    return;
  }

  public mapWoltItemToProductDto(woltItems: WoltItem[]): ProductDto[] {
    return woltItems.map((product) => ({
      id: product.id,
      name: product.name,
      quantity: product.count,
      comment: null,
      price: (product.total_price.amount / 100).toFixed(1), // Convert from cents to euros and round to 1 decimal place
      options: product.options.map((option) => ({
        id: this.utilsService.generatePublicId(),
        name: option.name,
        image: null,
        price: null,
        subOptions: [
          {
            id: option.id,
            image: null,
            position: 0,
            name: option.value,
            price: (option.price.amount / 100).toFixed(1),
            quantity: option.count,
          },
        ],
      })),
    }));
  }

  public async mapOrderToOrderResponse(woltOrder: ProviderOrder): Promise<OrderResponse> {
    let deliverytype: number;

    //Find business by venue id
    const businessData = await this.validateBusinessByVenueId(woltOrder.venue.id);

    woltOrder.delivery.type === 'eatin'
      ? (deliverytype = OrderingDeliveryType.EatIn)
      : woltOrder.delivery.type === 'homedelivery'
      ? (deliverytype = OrderingDeliveryType.Delivery)
      : (deliverytype = OrderingDeliveryType.PickUp);

    const products = this.mapWoltItemToProductDto(woltOrder.items);

    const orderStatusMapping = {
      received: OrderStatusEnum.PENDING,
      fetched: OrderStatusEnum.PENDING,
      acknowledged: OrderStatusEnum.PENDING,
      production: OrderStatusEnum.IN_PROGRESS,
      ready: OrderStatusEnum.COMPLETED,
      delivered: OrderStatusEnum.DELIVERED,
      rejected: OrderStatusEnum.REJECTED,
    };

    return {
      id: woltOrder.id.toString(),
      business: {
        orderingBusinessId: businessData.business.orderingBusinessId.toString(),
        logo: businessData.business.logo,
        name: businessData.business.name,
        publicId: businessData.business.publicId,
        address: businessData.business.address,
        email: businessData.business.email,
      },
      payMethodId: null,
      customer: {
        name: woltOrder.consumer_name,
        phone: woltOrder.consumer_phone_number,
      },
      lastModified: woltOrder.modified_at,
      type: woltOrder.type,
      deliveryType: deliverytype,
      comment: woltOrder.consumer_comment,
      summary: {
        total: woltOrder.price.amount,
      },
      pickupEta: woltOrder.pickup_eta,
      deliveryEta: woltOrder.delivery.time,
      prepareIn: null,
      provider: ProviderEnum.Wolt,
      status: orderStatusMapping[woltOrder.order_status],
      createdAt: woltOrder.created_at,
      preorder: woltOrder.pre_order
        ? {
            status: woltOrder.pre_order.pre_order_status,
            preorderTime: woltOrder.pre_order.preorder_time,
          }
        : null,
      products: products,
      offers: [],
    };
  }

  async getOrderDataAndSaveToDb(woltWebhookdata: WoltOrderNotification): Promise<OrderResponse> {
    // Get order detail from wolt host provider
    //It will throw and error and return in case the order is not found
    const woltOrder = await this.getOrderById(woltWebhookdata.order.id);

    //Save order to databse

    const mappedWoltOrder = await this.mapOrderToOrderResponse(woltOrder);
    await this.validateWoltOrder(mappedWoltOrder.id);

    await this.saveWoltOrdertoDb(mappedWoltOrder);

    return mappedWoltOrder;
  }

  private async validateBusinessByVenueId(woltVenueId: string) {
    const business = await this.prismaService.businessExtraSetting.findUnique({
      where: {
        value: woltVenueId,
      },
      select: {
        business: true,
      },
    });

    if (!business) {
      throw new NotFoundException('No business is associated with this ID');
    }

    return business;
  }

  public async getOrderByIdFromDb(woltOrderId: string) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id: parseInt(woltOrderId),
      },
      include: WoltOrderPrismaSelectArgs,
    });

    if (!order) {
      return null;
    }

    await this.syncWoltOrder(order.orderId);

    return order;
  }

  async syncWoltOrder(woltOrderId: string) {
    //Get order from wolt
    const woltOrder = await this.getOrderById(woltOrderId);

    // Mapp to general order response
    const mappedWoltOrder = await this.mapOrderToOrderResponse(woltOrder);

    //Init prisma validator
    const orderUpdateInputAgrs = Prisma.validator<Prisma.OrderUpdateInput>()({
      orderId: mappedWoltOrder.id,
      provider: mappedWoltOrder.provider,
      status: mappedWoltOrder.status,
      deliveryType: mappedWoltOrder.deliveryType,
      preparedIn: mappedWoltOrder.prepareIn,
      createdAt: mappedWoltOrder.createdAt,
      comment: mappedWoltOrder.comment,
      type: mappedWoltOrder.type,
      preorder: mappedWoltOrder.preorder
        ? {
            update: {
              status: mappedWoltOrder.preorder.status,
              preorderTime: mappedWoltOrder.preorder.preorderTime,
            },
          }
        : undefined,

      lastModified: mappedWoltOrder.lastModified,
      deliveryEta: mappedWoltOrder.deliveryEta,
      pickupEta: mappedWoltOrder.pickupEta,
      payMethodId: mappedWoltOrder.payMethodId,
    });

    //Update order in database
    await this.prismaService.order.update({
      where: {
        orderId: woltOrderId,
      },
      data: orderUpdateInputAgrs,
    });
  }

  private async validateWoltOrder(woltOrderId: string) {
    const order = await this.prismaService.order.findUnique({
      where: {
        orderId: woltOrderId,
      },
    });
    if (order) {
      throw new ForbiddenException('Order existed');
    }
  }

  async saveWoltOrdertoDb(mappedWoltOrder: OrderResponse) {
    const orderData: Prisma.OrderCreateArgs = {
      data: {
        orderId: mappedWoltOrder.id,
        provider: mappedWoltOrder.provider,
        business: {
          connect: {
            orderingBusinessId: mappedWoltOrder.business.orderingBusinessId,
          },
        },
        customer: {
          create: {
            name: mappedWoltOrder.customer.name,
            phone: mappedWoltOrder.customer.phone,
          },
        },
        summary: {
          create: {
            total: mappedWoltOrder.summary.total,
          },
        },
        deliveryEta: mappedWoltOrder.deliveryEta,
        pickupEta: mappedWoltOrder.pickupEta,
        preparedIn: mappedWoltOrder.prepareIn,
        lastModified: mappedWoltOrder.lastModified,
        type: mappedWoltOrder.type,
        payMethodId: mappedWoltOrder.payMethodId,
        status: mappedWoltOrder.status,
        deliveryType: mappedWoltOrder.deliveryType,
        createdAt: mappedWoltOrder.createdAt,
        comment: mappedWoltOrder.comment || undefined,
        preorder: mappedWoltOrder.preorder
          ? {
              create: {
                preorderTime: mappedWoltOrder.preorder.preorderTime,
                status: mappedWoltOrder.preorder.status,
              },
            }
          : undefined,
      },
      include: {
        products: true,
      },
    };

    // Save order to database
    const order = await this.prismaService.order.create(orderData);

    // Save products to database
    await Promise.all(
      mappedWoltOrder.products.map(async (product) => {
        const data: Prisma.ProductCreateInput = {
          productId: product.id,
          name: product.name,
          comment: product.comment || undefined,
          price: product.price,
          quantity: product.quantity,
          order: {
            connect: {
              orderId: order.orderId,
            },
          },
        };
        const productSaved = await this.prismaService.product.create({
          data,
        });
        // Save product options to database
        await Promise.all(
          product.options.map(async (option) => {
            const subOptions: Prisma.SubOptionCreateManyOptionInput[] = option.subOptions.map(
              (subOption) => ({
                subOptionId: subOption.id,
                name: subOption.name,
                price: subOption.price,
                quantity: subOption.quantity,
                image: subOption.image,
                position: subOption.position,
              }),
            );
            const optionData: Prisma.OptionUncheckedCreateInput = {
              optionId: option.id,
              name: option.name,
              productId: productSaved.id,
              image: option.image,
              price: option.price,
              subOption: {
                createMany: {
                  data: subOptions,
                  skipDuplicates: true,
                },
              },
            };

            await this.prismaService.option.create({
              data: optionData,
            });
          }),
        );
      }),
    );

    return 'Save data successfully';
  }

  generateWoltUpdateEndPoint(orderStatus: AvailableOrderStatus, woltOrder: WoltOrder) {
    if (orderStatus === OrderStatusEnum.IN_PROGRESS && woltOrder.type === WoltOrderType.PreOrder) {
      return 'confirm-preorder';
    } else if (orderStatus === OrderStatusEnum.IN_PROGRESS) {
      return 'accept';
    } else if (orderStatus === OrderStatusEnum.COMPLETED && woltOrder.order_number !== 'ready') {
      return 'ready';
    } else if (orderStatus === OrderStatusEnum.DELIVERED) {
      return 'delivered';
    } else if (orderStatus === OrderStatusEnum.REJECTED) {
      return 'reject';
    } else {
      return '';
    }
  }
}
