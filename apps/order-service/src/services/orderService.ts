import type { OrderWithDetails, Product, User } from "@packages/common";

export interface CreatedOrder {
  order: OrderWithDetails;
}

export type CreateOrderResult =
  | { status: "created"; createdOrder: CreatedOrder }
  | { status: "duplicate"; existingOrder: CreatedOrder }
  | { status: "not_found" };

const orders: CreatedOrder[] = [];

export function getAllOrders(): CreatedOrder[] {
  return orders;
}

export async function createOrder(
  userId: number,
  productId: number,
  quantity: number,
  userServiceUrl: string,
  productServiceUrl: string
): Promise<CreateOrderResult> {
  const existingOrder = orders.find(
    ({ order }) => order.user.id === userId && order.product.id === productId
  );

  if (existingOrder) {
    return { status: "duplicate", existingOrder };
  }

  const userResponse = await fetch(`${userServiceUrl}/user/${userId}`);
  const productResponse = await fetch(`${productServiceUrl}/product/${productId}`);

  if (!userResponse.ok || !productResponse.ok) {
    return { status: "not_found" };
  }

  const user = (await userResponse.json()) as User;
  const product = (await productResponse.json()) as Product;
  const order: OrderWithDetails = {
    id: String(orders.length + 1),
    user,
    product,
    quantity,
    totalAmount: product.price * quantity,
    status: "CREATED"
  };

  const createdOrder = { order };
  orders.push(createdOrder);

  return { status: "created", createdOrder };
}
