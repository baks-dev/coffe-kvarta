import productsData from '@/data/products.json' with { type: 'json' };
import { Product, ProductSchema } from '@/lib/product-schema';

const products = ProductSchema.array().parse(productsData);

export type CoffeeProduct = Extract<Product, { type: 'coffee' }>;
export type DripPackProduct = Extract<Product, { type: 'drip-pack' }>;
export type SubscriptionProduct = Extract<Product, { type: 'subscription' }>;
export type ShowcaseProduct = CoffeeProduct | DripPackProduct;

export function getProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

/** Товары типов coffee и drip-pack в порядке products.json. */
export function getShowcaseProducts(): ShowcaseProduct[] {
  return products.filter(
    (p): p is ShowcaseProduct => p.type === 'coffee' || p.type === 'drip-pack',
  );
}

/** Товар id 'subscription'. Бросает Error, если его нет или тип не subscription. */
export function getSubscriptionProduct(): SubscriptionProduct {
  const product = products.find((p) => p.id === 'subscription');
  if (product?.type !== 'subscription') {
    throw new Error('В src/data/products.json нет товара subscription');
  }
  return product;
}
