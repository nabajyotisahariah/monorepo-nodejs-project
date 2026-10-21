import type { Product } from "@packages/common";

const products: Product[] = [
  { id: 101, name: "Laptop", price: 75000 },
  { id: 102, name: "Keyboard", price: 3000 },
  { id: 103, name: "Mouse", price: 1200 },
  { id: 104, name: "Monitor", price: 18000 },
  { id: 105, name: "Headphones", price: 4500 },
  { id: 106, name: "Webcam", price: 3500 },
  { id: 107, name: "USB-C Hub", price: 2200 },
  { id: 108, name: "External SSD", price: 6500 },
  { id: 109, name: "Mechanical Keyboard", price: 5200 },
  { id: 110, name: "Wireless Mouse", price: 1800 },
  { id: 111, name: "Laptop Stand", price: 2500 },
  { id: 112, name: "Microphone", price: 7000 },
  { id: 113, name: "Bluetooth Speaker", price: 3200 },
  { id: 114, name: "Tablet", price: 28000 },
  { id: 115, name: "Smartphone", price: 42000 },
  { id: 116, name: "Router", price: 4800 },
  { id: 117, name: "Power Bank", price: 2100 },
  { id: 118, name: "HDMI Cable", price: 600 },
  { id: 119, name: "Desk Lamp", price: 1500 },
  { id: 120, name: "Graphics Tablet", price: 9500 }
];

export function getAllProducts(): Product[] {
  return products;
}

export function getProductById(id: number): Product | undefined {
  return products.find((product) => product.id === id);
}
