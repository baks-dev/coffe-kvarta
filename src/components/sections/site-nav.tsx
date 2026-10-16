import { cn } from '@/lib/utils';
import { content } from '@/data/content';

interface SiteNavProps {
  label: string;
  className?: string;
  linkClassName?: string;
}

export function SiteNav({ label, className, linkClassName }: SiteNavProps) {
  return (
    <nav aria-label={label} className={className}>
      <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {content.nav.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className={cn(
                'rounded-card text-small font-medium text-muted-foreground transition-colors hover:text-foreground',
                linkClassName,
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
