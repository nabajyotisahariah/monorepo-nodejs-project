export interface Order {
  id: string;
  userId: number;
  productId: number;
  quantity: number;
  totalAmount: number;
  status: "CREATED";
}
