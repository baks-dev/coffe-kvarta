// Модуль с метаданными сайта
// siteUrl читает NEXT_PUBLIC_SITE_URL, siteName — это название сайта (строка)

import { siteData } from '@/data/site';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const siteName = siteData.name;

export { siteUrl, siteName };
