'use client';

import { buttonVariants } from '@/components/ui/button';
import { requestLeadIntent, type LeadIntent } from '@/lib/lead-intent';

interface LeadIntentLinkProps {
  intent: LeadIntent;
  variant?: 'primary' | 'accent' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  children: React.ReactNode;
}

export function LeadIntentLink({
  intent,
  variant = 'primary',
  size = 'default',
  className,
  children,
}: LeadIntentLinkProps) {
  return (
    <a
      href="#lead-form"
      className={buttonVariants({ variant, size, className })}
      onClick={() => requestLeadIntent(intent)}
    >
      {children}
    </a>
  );
}
