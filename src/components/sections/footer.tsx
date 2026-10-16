import { Logo } from '@/components/logo';
import { SiteNav } from '@/components/sections/site-nav';
import { toTelHref } from '@/lib/format';
import { content } from '@/data/content';
import { siteData } from '@/data/site';

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-page flex-col gap-8 px-4 py-12 md:flex-row md:items-start md:justify-between md:px-8">
        <div className="flex flex-col gap-3">
          <Logo size="footer" />
          <p className="text-small text-muted-foreground">{content.footer.tagline}</p>
          <a
            href={toTelHref(siteData.phone)}
            className="text-small font-medium underline underline-offset-4"
          >
            {siteData.phone}
          </a>
        </div>

        <SiteNav label={content.footer.navLabel} className="flex" />

        <div className="flex flex-col gap-1 text-small text-muted-foreground">
          <p>{content.footer.copyright}</p>
          <p>{content.footer.photoCredit}</p>
        </div>
      </div>
    </footer>
  );
}
