import { Section, SectionHeading } from '@/components/section';
import { toTelHref } from '@/lib/format';
import { content } from '@/data/content';
import { siteData } from '@/data/site';

interface LeadSectionProps {
  /** Форма заявки; в этом change не передаётся. */
  children?: React.ReactNode;
}

export function LeadSection({ children }: LeadSectionProps) {
  return (
    <Section id="lead-form">
      <SectionHeading
        sectionId="lead-form"
        eyebrow={content.lead.eyebrow}
        title={content.lead.title}
        lead={content.lead.lead}
      />

      <ol className="mt-10 grid gap-4 md:grid-cols-3">
        {content.lead.steps.map((step, index) => (
          <li key={step} className="flex gap-4 rounded-card border border-border bg-card p-5">
            <span className="font-heading text-h3 text-muted-foreground">{index + 1}</span>
            <p className="text-body">{step}</p>
          </li>
        ))}
      </ol>

      {children && <div className="mt-10">{children}</div>}

      <p className="mt-10 text-body">
        {content.lead.callPrompt}{' '}
        <a href={toTelHref(siteData.phone)} className="font-medium underline underline-offset-4">
          {siteData.phone}
        </a>
      </p>
    </Section>
  );
}
