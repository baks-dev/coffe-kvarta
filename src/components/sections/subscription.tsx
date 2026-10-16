import { LeadIntentLink } from '@/components/lead-intent-link';
import { Section, SectionHeading } from '@/components/section';
import { formatPrice } from '@/lib/format';
import { getSubscriptionProduct } from '@/lib/get-products';
import { content } from '@/data/content';

export function Subscription() {
  const subscription = getSubscriptionProduct();

  return (
    <Section id="subscription">
      <div className="flex flex-col gap-8 rounded-card bg-espresso p-6 text-espresso-foreground md:p-10 lg:p-12">
        <SectionHeading
          sectionId="subscription"
          inverse
          eyebrow={content.subscription.eyebrow}
          title={content.subscription.title}
          lead={content.subscription.description}
        />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-4">
            <p className="font-heading text-h2">
              {`${formatPrice(subscription.price)} / ${subscription.period}`}
            </p>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-body">
              {content.subscription.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <LeadIntentLink
              intent={{ interest: 'subscription', productId: subscription.id }}
              variant="accent"
              size="lg"
            >
              {content.subscription.cta}
            </LeadIntentLink>
            <p className="text-small">{content.subscription.note}</p>
          </div>
        </div>
      </div>
    </Section>
  );
}
