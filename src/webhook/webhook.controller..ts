import { HttpService } from '@nestjs/axios';
import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { OrderWebhookService } from './webhook.service';

@Controller('webhook')
export class OrderWebhookController {
  constructor(
    private OrderWebhookService: OrderWebhookService,
    private readonly httpService: HttpService,
  ) {}
  @Post('newOrder')
  newOrder(@Body() data: any) {
    console.log(data);
    const order = this.OrderWebhookService.newOrder(data);
    this.httpService
      .post('https://webhook.site/3311e65c-34ae-4ecb-a705-9f2c7fa5eec0', data)
      .subscribe({
        complete: () => {
          console.log('completed');
        },
        error: (err) => {
          // you can handle error requests here
          console.log(err);
        },
      });

    return order;
  }
  @Post('new')
  newOrderReciever(@Req() request: Request) {
    return this.OrderWebhookService.newOrderReciever(request);
  }
}
