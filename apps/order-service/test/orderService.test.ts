import assert from "node:assert/strict";
import test from "node:test";
import type { Product, User } from "@packages/model";
import {
  createOrder,
  getAllOrders,
} from "../src/services/orderService.js";

const user: User = { id: 1, name: "John", address: "123 Main St" };
const product: Product = { id: 101, name: "Laptop", price: 75000 };

test("creates an order using the user and product service responses", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input) => {
    const body = String(input).endsWith("/user/1") ? user : product;
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    const result = await createOrder(
      user.id,
      product.id,
      2,
      "http://users.test",
      "http://products.test",
    );

    assert.equal(result.status, "created");
    if (result.status !== "created") {
      assert.fail("Expected order creation to succeed");
    }

    assert.deepEqual(result.createdOrder.order, {
      id: "1",
      user,
      product,
      quantity: 2,
      totalAmount: 150000,
      status: "CREATED",
    });
    assert.deepEqual(getAllOrders(), [result.createdOrder]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects a duplicate order without requesting service data", async () => {
  const originalFetch = globalThis.fetch;
  let fetchCalled = false;

  globalThis.fetch = async () => {
    fetchCalled = true;
    throw new Error("fetch should not run for a duplicate order");
  };

  try {
    const result = await createOrder(
      user.id,
      product.id,
      1,
      "http://users.test",
      "http://products.test",
    );

    assert.equal(result.status, "duplicate");
    assert.equal(fetchCalled, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("returns not_found when either service cannot resolve its resource", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input) =>
    new Response(
      JSON.stringify(String(input).endsWith("/user/2") ? user : product),
      {
        status: String(input).endsWith("/user/2") ? 404 : 200,
        headers: { "Content-Type": "application/json" },
      },
    );

  try {
    const result = await createOrder(
      2,
      product.id,
      1,
      "http://users.test",
      "http://products.test",
    );

    assert.deepEqual(result, { status: "not_found" });
    assert.equal(getAllOrders().length, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("does not create an order when the product service cannot resolve its resource", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input) =>
    new Response(
      JSON.stringify(String(input).endsWith("/user/3") ? user : product),
      {
        status: String(input).endsWith("/product/102") ? 404 : 200,
        headers: { "Content-Type": "application/json" },
      },
    );

  try {
    const result = await createOrder(
      3,
      102,
      1,
      "http://users.test",
      "http://products.test",
    );

    assert.deepEqual(result, { status: "not_found" });
    assert.equal(getAllOrders().length, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
