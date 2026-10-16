import { Section, SectionHeading } from '@/components/section';
import { content } from '@/data/content';

interface InfoBlockProps {
  title: string;
  items: readonly string[];
}

function InfoBlock({ title, items }: InfoBlockProps) {
  return (
    <div className="flex flex-col gap-4 rounded-card border border-border bg-card p-6">
      <h3 className="text-h3">{title}</h3>
      <ul className="flex list-disc flex-col gap-3 pl-5 text-body">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function Delivery() {
  return (
    <Section id="delivery" tone="surface">
      <SectionHeading
        sectionId="delivery"
        eyebrow={content.delivery.eyebrow}
        title={content.delivery.title}
      />

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <InfoBlock
          title={content.delivery.delivery.title}
          items={content.delivery.delivery.items}
        />
        <InfoBlock title={content.delivery.pickup.title} items={content.delivery.pickup.items} />
      </div>
    </Section>
  );
}
