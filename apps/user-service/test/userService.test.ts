import assert from "node:assert/strict";
import test from "node:test";
import { getAllUsers, getUserById } from "../src/services/userService.js";

test("returns the complete user list", () => {
  const users = getAllUsers();

  assert.ok(users.length > 0);
  assert.deepEqual(users[0], {
    id: 1,
    name: "John",
    address: "123 Main St",
  });
});

test("finds a user by ID", () => {
  assert.deepEqual(getUserById(5), {
    id: 5,
    name: "Liam",
    address: "56 Maple Street",
  });
});

test("returns undefined for an unknown user ID", () => {
  assert.equal(getUserById(999), undefined);
});
