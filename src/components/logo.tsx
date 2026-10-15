import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ size = 'header' }: { size?: 'header' | 'footer' }) {
  const sizes = {
    header: 'text-base font-bold',
    footer: 'text-sm font-medium',
  };

  return (
    <Link
      href="#top"
      className={cn(
        'font-heading uppercase tracking-wider hover:opacity-80 transition-opacity rounded-card',
        sizes[size],
      )}
      aria-label="Кварта, на главную"
    >
      Кварта
    </Link>
  );
}
