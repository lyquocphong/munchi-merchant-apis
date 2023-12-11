import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosHeaders } from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsService } from 'src/utils/utils.service';
import { Provider, WOLT_ACTIONS } from '../provider.type';

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
    this.woltApiUrl = this.configService.get('WOLT_API_URL');
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

  public async mapToOrderResponse<OrderResponse, U>(order: U): Promise<OrderResponse> {
    return;
  }
}
