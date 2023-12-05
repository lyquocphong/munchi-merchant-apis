export interface Provider {
  getAllOrder(): Promise<void>;

  getOrderById(orderId: string): Promise<void>;

  updateOrder(orderId: string): Promise<void>;

  deleteOrder(orderId: string): Promise<void>;
}
