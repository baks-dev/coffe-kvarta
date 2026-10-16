import { cn } from '@/lib/utils';
import { handwriting, type HandwritingId } from '@/data/handwriting';

interface HandwritingProps {
  id: HandwritingId;
  className?: string;
}

// Декоративная надпись: цвет берётся из currentColor, форму задаёт SVG как маска.
export function Handwriting({ id, className }: HandwritingProps) {
  const item = handwriting[id];

  return (
    <span
      aria-hidden="true"
      className={cn('hidden bg-current md:block', className)}
      style={{
        aspectRatio: `${item.width} / ${item.height}`,
        maskImage: `url(${item.src})`,
        WebkitMaskImage: `url(${item.src})`,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  );
}
