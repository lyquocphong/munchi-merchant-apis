import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosHeaders } from 'axios';
import { ProductDto } from 'src/order/dto/product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsService } from 'src/utils/utils.service';
import { OrderingDeliveryType, OrderingOrderStatus } from '../ordering/ordering.type';
import { Provider, ProviderEnum, WOLT_ACTIONS } from '../provider.type';
import { WoltItem, WoltOrder, WoltOrderNotification } from './wolt.type';
import { OrderResponse } from 'src/order/dto/order.dto';

@Injectable()
export class WoltService implements Provider {
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

  public async getAllOrder(): Promise<void> {}

  public async getOrderById<OrderResponse>(woltOrdeId: string): Promise<OrderResponse> {
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

  public async updateOrder<OrderResponse>(
    woltOrdeId: string,
    action: WOLT_ACTIONS,
  ): Promise<OrderResponse> {
    try {
      const response = await axios.request({
        method: 'PUT',
        baseURL: `${this.woltApiUrl}/orders/${woltOrdeId}/${action}`,
        headers: this.header as any,
      });

      return response.data;
    } catch (error) {
      this.utilsService.logError(error);
    }
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
        id: option.id,
        name: option.name,
        image: null,
        price: null,
        suboptions: [
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

  public async mapToOrderResponse(woltOrder: WoltOrder) {
    let deliverytype: number;
    const businessData = await this.prismaService.businessExtraSetting.findUnique({
      where: {
        value: woltOrder.venue.id,
      },
      select: {
        business: true,
      },
    });

    woltOrder.delivery.type === 'eatin'
      ? (deliverytype = OrderingDeliveryType.EatIn)
      : woltOrder.delivery.type === 'homedelivery'
      ? (deliverytype = OrderingDeliveryType.Delivery)
      : (deliverytype = OrderingDeliveryType.PickUp);

    const products = this.mapWoltItemToProductDto(woltOrder.items);

    const orderStatusMapping = {
      received: OrderingOrderStatus.AcceptedByBusiness,
      fetched: OrderingOrderStatus.PickupCompletedByCustomer,
      acknowledged: OrderingOrderStatus.AcceptedByBusiness,
      production: OrderingOrderStatus.AcceptedByBusiness,
      ready: OrderingOrderStatus.PreparationCompleted,
      delivered: OrderingOrderStatus.DeliveryCompletedByDriver,
      rejected: OrderingOrderStatus.RejectedByBusiness,
      refunded: 25,
    };

    return {
      id: woltOrder.id,
      business: {
        logo: businessData.business.logo,
        name: businessData.business.name,
        publicId: businessData.business.publicId,
        address: businessData.business.address,
        email: businessData.business.email,
      },
      deliveryType: deliverytype,
      comment: woltOrder.consumer_comment,
      summary: {
        deliveryPrice: woltOrder.delivery.fee.amount,
        subTotal: woltOrder.price.amount,
      },
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
    };
  }

  async getOrderDataAndSaveToDb(woltWebhookdata: WoltOrderNotification): Promise<OrderResponse> {
    // Get order detail from wolt host provider
    //It will throw and error and return in case the order is not found
    const woltOrder = await this.getOrderById<WoltOrder>(woltWebhookdata.order.id);

    //Save order to databse

    const mappedWoltOrder = await this.mapToOrderResponse(woltOrder);
    console.log(
      '🚀 ~ file: wolt.service.ts:173 ~ WoltService ~ getOrderDataAndSaveToDb ~ mappedWoltOrder:',
      mappedWoltOrder,
    );
    // await this.saveWoltOrdertoDb(woltOrder)
    // console.log(this.woltApiKey, this.woltApiUrl);
    return mappedWoltOrder;
  }

  async saveWoltOrdertoDb(woltOrder) {}
}
