import productsData from '@/data/products.json' with { type: 'json' };
import { Product, ProductSchema } from '@/lib/product-schema';

const products = ProductSchema.array().parse(productsData);

export function getProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
