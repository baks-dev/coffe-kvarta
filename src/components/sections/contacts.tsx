import { buttonVariants } from '@/components/ui/button';
import { Section, SectionHeading } from '@/components/section';
import { toTelHref } from '@/lib/format';
import { cn } from '@/lib/utils';
import { getYandexMapsUrl, getYandexMapWidgetUrl } from '@/lib/yandex-map';
import { content } from '@/data/content';
import { siteData } from '@/data/site';

export function Contacts() {
  return (
    <Section id="contacts">
      <SectionHeading
        sectionId="contacts"
        eyebrow={content.contacts.eyebrow}
        title={content.contacts.title}
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
        <dl className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <dt className="text-eyebrow text-muted-foreground">
              {content.contacts.labels.address}
            </dt>
            <dd className="text-body">{siteData.address}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-eyebrow text-muted-foreground">{content.contacts.labels.phone}</dt>
            <dd className="text-body">
              <a
                href={toTelHref(siteData.phone)}
                className="font-medium underline underline-offset-4"
              >
                {siteData.phone}
              </a>
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-eyebrow text-muted-foreground">{content.contacts.labels.email}</dt>
            <dd className="text-body">
              <a
                href={`mailto:${siteData.email}`}
                className="font-medium underline underline-offset-4"
              >
                {siteData.email}
              </a>
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-eyebrow text-muted-foreground">{content.contacts.labels.hours}</dt>
            <dd className="text-body">
              {content.hours.weekday}
              <br />
              {content.hours.weekend}
            </dd>
          </div>
        </dl>

        <div className="flex min-w-0 flex-col gap-4">
          <iframe
            src={getYandexMapWidgetUrl(siteData.geo)}
            title={content.contacts.mapTitle}
            loading="lazy"
            className="h-80 w-full rounded-card border border-border lg:h-96"
          />
          <a
            href={getYandexMapsUrl(siteData.geo)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: 'outline' }), 'border')}
          >
            {content.contacts.mapLink}
          </a>
        </div>
      </div>
    </Section>
  );
}
