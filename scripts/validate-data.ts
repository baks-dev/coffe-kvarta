import productsData from '@/data/products.json' with { type: 'json' };
import { ProductSchema } from '@/lib/product-schema';

try {
  const products = ProductSchema.array().parse(productsData);
  console.log(`✓ Валидация прошла успешно. Загружено продуктов: ${products.length}`);
  process.exit(0);
} catch (error) {
  console.error('✗ Ошибка валидации данных:', error);
  process.exit(1);
}
