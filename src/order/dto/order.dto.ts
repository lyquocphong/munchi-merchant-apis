import { Exclude, Expose, Type } from 'class-transformer';
import { CustomerDto } from './customer.dto';
import { ProductDto } from './product.dto';
import { SummaryDto } from './summary.dto';
import { HistoryDto } from './history.dto';
import { IsArray, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class OrderDto {
  @Expose()
  id: number;

  @Expose({ name: 'paymethod_id' })
  paymethodId: number;

  @Expose({ name: 'business_id' })
  businessId: number;

  @Expose({ name: 'customer_id' })
  customerId: number;

  @Expose()
  status: number;

  @Expose({ name: 'delivery_type' })
  deliveryType: number;

  @Expose({ name: 'delivery_datetime' })
  deliveryTime: number;

  @Expose({ name: 'prepared_in' })
  preparedIn: number;

  @Expose({ name: 'created_at' })
  createdAt: string;

  @Expose({ name: 'spot_number' })
  table: number;

  @Expose()
  @Type(() => SummaryDto)
  summary: SummaryDto[];

  @Expose()
  @Type(() => ProductDto)
  products: ProductDto[];

  @Expose()
  @Type(() => CustomerDto)
  customer: CustomerDto[];

  @Expose()
  @Type(() => HistoryDto)
  history: HistoryDto[];

  constructor(partial: Partial<OrderDto>) {
    Object.assign(this, partial);
  }
}

export enum OrderStatusDto {
  PREORDER = 'preorder',
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  READY = 'ready'
}

export enum OrderProviderDto {
  ORDERING_CO = 'orderingco',
  WOLT = 'wolt'
}

export class GetOrderQueryDto {
  @Expose()
  @IsEnum(OrderStatusDto, { each: true })
  @IsArray()
  @ApiProperty({
    description: 'Order status want to get',
    enum: OrderStatusDto,
    isArray: true
  })
  statuses: OrderStatusDto;
  
  @Expose()
  @IsEnum(OrderProviderDto, { each: true })
  @IsArray()
  @ApiProperty({
    description: 'providers want to get order from',
    enum: OrderProviderDto,
    isArray: true
  })
  providers?: OrderProviderDto[]
}