export interface SiteImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

/** Ключ — product.id; отсутствие ключа означает «у товара нет фото». */
const products: Partial<Record<string, SiteImage>> = {
  ethiopia: {
    src: '/images/product-ethiopia.webp',
    width: 800,
    height: 800,
    alt: 'Зёрна кофе Эфиопия Иргачеффе',
  },
  colombia: {
    src: '/images/product-colombia.webp',
    width: 800,
    height: 800,
    alt: 'Зёрна кофе Колумбия Уила',
  },
  brazil: {
    src: '/images/product-brazil.webp',
    width: 800,
    height: 800,
    alt: 'Зёрна кофе Бразилия Серрадо',
  },
};

export const images: {
  hero: SiteImage;
  about: SiteImage;
  products: Partial<Record<string, SiteImage>>;
} = {
  hero: {
    src: '/images/hero.webp',
    width: 2000,
    height: 1325,
    alt: 'Зёрна кофе крупным планом',
  },
  about: {
    src: '/images/about.webp',
    width: 1000,
    height: 1500,
    alt: 'Кофейные зёрна в барабане ростера',
  },
  products,
};
