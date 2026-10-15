import { Lora, Golos_Text } from 'next/font/google';

// Шрифт для заголовков: Lora с засечками
export const lora = Lora({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-lora',
});

// Шрифт для текста: Golos Text без засечек
export const golosText = Golos_Text({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-golos-text',
});
