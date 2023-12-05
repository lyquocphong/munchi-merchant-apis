export interface Provider {
  getAllOrder(): Promise<void>;

  getOrderById<T>(orderId: string): Promise<T>;

  updateOrder<T>(orderId: string, action: WOLT_ACTIONS): Promise<T>;

  mapToOrderResponse<T, U>(order: U): Promise<T>;
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
