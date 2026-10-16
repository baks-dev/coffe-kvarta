import Image from 'next/image';
import { Handwriting } from '@/components/handwriting';
import { Section, SectionHeading } from '@/components/section';
import { content } from '@/data/content';
import { images } from '@/data/images';

export function About() {
  const { whyFresh } = content.about;

  return (
    <Section id="about" tone="surface">
      <div className="grid gap-8 lg:grid-cols-5 lg:items-center">
        <div className="relative aspect-[4/5] overflow-hidden rounded-card lg:col-span-2">
          <Image
            src={images.about.src}
            alt={images.about.alt}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
          <Handwriting
            id="with-love"
            className="absolute bottom-6 left-6 w-44 -rotate-3 text-espresso-foreground lg:w-56"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-6 lg:col-span-3">
          <SectionHeading
            sectionId="about"
            eyebrow={content.about.eyebrow}
            title={content.about.title}
          />
          {content.about.story.map((paragraph) => (
            <p key={paragraph} className="text-body text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-16 flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h3 className="text-h3">{whyFresh.title}</h3>
          <p className="text-body max-w-2xl text-muted-foreground">{whyFresh.description}</p>
        </div>

        <ol className="grid gap-6 lg:grid-cols-3">
          {whyFresh.steps.map((step, index) => (
            <li
              key={step.label}
              className="flex flex-col gap-2 rounded-card border border-border bg-card p-6"
            >
              <span className="font-heading text-display text-muted-foreground">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="text-eyebrow text-muted-foreground">{step.label}</p>
              <h3 className="text-h3">{step.title}</h3>
              <p className="text-body">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
