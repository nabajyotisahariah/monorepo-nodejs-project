import type { Order, Product, User } from "@packages/common";

export interface CreatedOrder {
  order: Order;
  user: User;
  product: Product;
}

const orders: Order[] = [];

export function getAllOrders(): Order[] {
  return orders;
}

export async function createOrder(
  userId: number,
  productId: number,
  quantity: number,
  userServiceUrl: string,
  productServiceUrl: string
): Promise<CreatedOrder | undefined> {
  const userResponse = await fetch(`${userServiceUrl}/users/${userId}`);
  const productResponse = await fetch(`${productServiceUrl}/products/${productId}`);

  if (!userResponse.ok || !productResponse.ok) {
    return undefined;
  }

  const user = (await userResponse.json()) as User;
  const product = (await productResponse.json()) as Product;
  const order: Order = {
    id: String(orders.length + 1),
    userId,
    productId,
    quantity,
    totalAmount: product.price * quantity,
    status: "CREATED"
  };

  orders.push(order);

  return { order, user, product };
}
