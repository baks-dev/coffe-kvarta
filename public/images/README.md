# Изображения

Стоковые фото с Unsplash (не фото самой «Кварты»), [Unsplash License](https://unsplash.com/license): бесплатно, в т. ч. для коммерческого использования, атрибуция не обязательна.

| Файл                    | Размер    | Источник                                                                                    | Alt                               |
| ----------------------- | --------- | ------------------------------------------------------------------------------------------- | --------------------------------- |
| `hero.webp`             | 2000×1325 | [Immo Wegmann](https://unsplash.com/photos/REqK8jIAtv8)                                     | Зёрна кофе крупным планом         |
| `about.webp`            | 1000×1500 | [Coffee beans are roasting inside a large machine](https://unsplash.com/photos/lcBt6ImTmXU) | Кофейные зёрна в барабане ростера |
| `product-ethiopia.webp` | 800×800   | [Bernd Dittrich](https://unsplash.com/photos/U2AgTbVPwlE)                                   | Зёрна кофе Эфиопия Иргачеффе      |
| `product-colombia.webp` | 800×800   | [Indra Projects](https://unsplash.com/photos/H80RH1Hhvu8)                                   | Зёрна кофе Колумбия Уила          |
| `product-brazil.webp`   | 800×800   | [Matthew Feeney](https://unsplash.com/photos/TaFr0XnSFFs)                                   | Зёрна кофе Бразилия Серрадо       |

## Формат

- WebP q90, без предсжатия; next/image сам создаёт srcset и конвертирует.
- Фото товаров обрезаны до квадрата 800×800.

## Рукописные надписи

Файлы `public/handwriting/*.svg` — контуры шрифта [Caveat](https://github.com/google/fonts/tree/main/ofl/caveat) (SIL Open Font License 1.1). Шрифт в репозиторий не коммитится, на сайт не подключается: из него сгенерированы только векторные пути.

| Файл                           | Текст                            |
| ------------------------------ | -------------------------------- |
| `handwriting/fresh-weekly.svg` | «Свежая обжарка / каждую неделю» |
| `handwriting/with-love.svg`    | «С любовью / к хорошему кофе»    |

Перегенерация (из корня репозитория):

```bash
T=$(mktemp -d) && curl -sL -o "$T/caveat.ttf" "https://github.com/google/fonts/raw/main/ofl/caveat/Caveat%5Bwght%5D.ttf" && pnpm build:handwriting "$T/caveat.ttf" && pnpm prettier --write src/data/handwriting.ts
```

Строки берутся из `content.hero.handwriting` и `content.about.handwriting`; при их изменении команду нужно запустить снова.
