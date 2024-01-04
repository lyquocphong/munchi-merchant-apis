import { OrderingOrder } from './ordering/ordering.type';
import { WoltOrder } from './wolt/wolt.type';

export interface Provider {
  getAllOrder(): Promise<void>;

  getOrderById<T>(orderId: string): Promise<T>;

  updateOrder<T>(orderId: string, action: WOLT_ACTIONS): Promise<T>;

  mapToOrderResponse(order: WoltOrder | OrderingOrder): Promise<any>;
}

/**
 * This wolt actions take from wolt develop document to make it dynamic
 *
 * Reference: https://developer.wolt.com/docs/api/order
 */
export type WOLT_ACTIONS =
  | 'accept'
  | 'reject'
  | 'ready'
  | 'delivered'
  | 'confirm-preorder'
  | 'replace-items';

export enum ProviderEnum {
  Wolt = 'Wolt',
  Munchi = 'Munchi',
}
