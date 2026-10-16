import { Logo } from '@/components/logo';
import { SiteNav } from '@/components/sections/site-nav';
import { buttonVariants } from '@/components/ui/button';
import { content } from '@/data/content';

export function Header() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-background">
      <div className="mx-auto flex h-full max-w-page items-center justify-between gap-6 px-4 md:px-8">
        <Logo size="header" />
        <SiteNav label="Основная навигация" className="hidden lg:flex" />
        <a href="#lead-form" className={buttonVariants({ variant: 'primary' })}>
          {content.header.cta}
        </a>
      </div>
    </header>
  );
}
