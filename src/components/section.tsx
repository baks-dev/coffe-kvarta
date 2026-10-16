import { cn } from '@/lib/utils';

type SectionTone = 'default' | 'surface';

interface SectionProps {
  id: string;
  tone?: SectionTone;
  className?: string;
  children: React.ReactNode;
}

export function Section({ id, tone = 'default', className, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn('scroll-mt-16 py-section', tone === 'surface' && 'bg-surface')}
    >
      <div className={cn('mx-auto max-w-page px-4 md:px-8', className)}>{children}</div>
    </section>
  );
}

interface SectionHeadingProps {
  sectionId: string;
  eyebrow?: string;
  title: string;
  lead?: string;
  inverse?: boolean;
  className?: string;
}

export function SectionHeading({
  sectionId,
  eyebrow,
  title,
  lead,
  inverse = false,
  className,
}: SectionHeadingProps) {
  const textTone = inverse ? 'text-espresso-foreground' : 'text-muted-foreground';

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {eyebrow && <p className={cn('text-eyebrow', textTone)}>{eyebrow}</p>}
      <h2
        id={`${sectionId}-title`}
        className={cn('text-h2 text-balance', inverse ? textTone : undefined)}
      >
        {title}
      </h2>
      {lead && <p className={cn('text-body max-w-2xl', textTone)}>{lead}</p>}
    </div>
  );
}
