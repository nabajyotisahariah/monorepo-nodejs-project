import assert from "node:assert/strict";
import test from "node:test";
import { getAllProducts, getProductById } from "../src/services/productService.js";

test("returns the complete product list", () => {
  const products = getAllProducts();

  assert.ok(products.length > 0);
  assert.deepEqual(products[0], {
    id: 101,
    name: "Laptop",
    price: 75000,
  });
});

test("finds a product by ID", () => {
  assert.deepEqual(getProductById(103), {
    id: 103,
    name: "Mouse",
    price: 1200,
  });
});

test("returns undefined for an unknown product ID", () => {
  assert.equal(getProductById(999), undefined);
});
