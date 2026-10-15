// Модуль с метаданными сайта
// Читает NEXT_PUBLIC_SITE_URL с fallback на localhost

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const siteName = 'Coffe Kvarta';

export { siteUrl, siteName };
