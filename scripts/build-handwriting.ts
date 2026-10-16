// Одноразовая генерация SVG-контуров рукописных надписей из шрифта Caveat.
// Запуск: pnpm build:handwriting <путь к Caveat[wght].ttf>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import opentype from 'opentype.js';
import { content } from '@/data/content';

const FONT_SIZE = 48;
const LINE_STEP = 52;
const SECOND_LINE_SHIFT = 24;
const MARGIN = 4;

const fontArg = process.argv[2];
if (!fontArg) {
  console.error('Укажите путь к Caveat.ttf: pnpm build:handwriting <path>');
  process.exit(1);
}

const fontPath = resolve(fontArg);
let font: opentype.Font;
try {
  const buf = readFileSync(fontPath);
  font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
} catch (error) {
  console.error(`Не удалось прочитать шрифт ${fontPath}:`, error);
  process.exit(1);
}

interface Lines {
  lines: readonly string[];
}

/** Строит один путь из строк: вторая строка сдвинута вправо, поля — MARGIN по каждой стороне. */
function buildHandwriting({ lines }: Lines): { d: string; width: number; height: number } {
  const placed = lines.map((text, index) => ({
    text,
    x: index === 1 ? SECOND_LINE_SHIFT : 0,
    y: index * LINE_STEP,
  }));

  // Первый проход — габариты всех строк в исходных координатах.
  const boxes = placed.map(({ text, x, y }) =>
    font.getPath(text, x, y, FONT_SIZE).getBoundingBox(),
  );
  const minX = Math.min(...boxes.map((b) => b.x1));
  const minY = Math.min(...boxes.map((b) => b.y1));
  const maxX = Math.max(...boxes.map((b) => b.x2));
  const maxY = Math.max(...boxes.map((b) => b.y2));

  const width = Math.ceil(maxX - minX) + MARGIN * 2;
  const height = Math.ceil(maxY - minY) + MARGIN * 2;

  // Второй проход — строки сдвинуты так, чтобы габарит лёг внутрь viewBox с полями.
  const combined = new opentype.Path();
  for (const { text, x, y } of placed) {
    const path = font.getPath(text, x - minX + MARGIN, y - minY + MARGIN, FONT_SIZE);
    combined.extend(path);
  }

  return { d: combined.toPathData(1), width, height };
}

const outDir = resolve(process.cwd(), 'public/handwriting');
mkdirSync(outDir, { recursive: true });

const targets = [
  { id: 'fresh-weekly', lines: content.hero.handwriting },
  { id: 'with-love', lines: content.about.handwriting },
] as const;

const registry: { id: string; width: number; height: number }[] = [];

for (const target of targets) {
  const { d, width, height } = buildHandwriting(target);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><path d="${d}"/></svg>\n`;
  writeFileSync(resolve(outDir, `${target.id}.svg`), svg, 'utf8');
  registry.push({ id: target.id, width, height });
  console.log(`✓ public/handwriting/${target.id}.svg (${width}×${height})`);
}

const registryPath = resolve(process.cwd(), 'src/data/handwriting.ts');
mkdirSync(dirname(registryPath), { recursive: true });
const entries = registry
  .map(
    ({ id, width, height }) =>
      `  '${id}': { src: '/handwriting/${id}.svg', width: ${width}, height: ${height} },`,
  )
  .join('\n');
writeFileSync(
  registryPath,
  [
    '// Сгенерировано scripts/build-handwriting.ts — не редактировать вручную.',
    'export const handwriting = {',
    entries,
    '} as const;',
    'export type HandwritingId = keyof typeof handwriting;',
    '',
  ].join('\n'),
  'utf8',
);
console.log(`✓ src/data/handwriting.ts`);
