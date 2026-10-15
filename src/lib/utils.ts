import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Регистрация кастомных классов для tailwind-merge v3.
// См. https://github.com/dcastil/tailwind-merge/blob/v3.x/docs/EXTENDING.md
const twMergeExtended = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: ['display', 'h2', 'h3', 'body', 'small', 'eyebrow'],
        },
      ],
      rounded: [
        {
          rounded: ['card', 'pill'],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMergeExtended(clsx(inputs));
}
