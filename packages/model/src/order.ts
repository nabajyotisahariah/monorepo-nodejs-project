import type { Product } from "./product.js";
import type { User } from "./user.js";

export interface Order {
  id: string;
  userId: number;
  productId: number;
  quantity: number;
  totalAmount: number;
  status: "CREATED";
}

export type OrderWithDetails = Omit<Order, "userId" | "productId"> & {
  user: User;
  product: Product;
};
