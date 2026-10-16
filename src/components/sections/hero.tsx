import Image from 'next/image';
import { Handwriting } from '@/components/handwriting';
import { buttonVariants } from '@/components/ui/button';
import { content } from '@/data/content';
import { images } from '@/data/images';

export function Hero() {
  return (
    <div className="mx-auto grid max-w-page gap-8 px-4 pt-8 pb-section md:px-8 lg:grid-cols-2 lg:items-center lg:pt-12">
      <div className="flex min-w-0 flex-col gap-6">
        <p className="text-eyebrow text-muted-foreground">{content.hero.eyebrow}</p>
        <h1 className="text-display text-balance">{content.hero.headline}</h1>
        <p className="text-body max-w-xl text-muted-foreground">{content.hero.subheading}</p>
        <div className="flex flex-wrap gap-3">
          <a href="#lead-form" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
            {content.hero.cta}
          </a>
          <a href="#subscription" className={buttonVariants({ variant: 'ghost', size: 'lg' })}>
            {content.hero.secondaryCta}
          </a>
        </div>
      </div>

      <div className="relative aspect-[4/3] overflow-hidden rounded-card lg:aspect-auto lg:min-h-[32rem]">
        <Image
          src={images.hero.src}
          alt={images.hero.alt}
          fill
          preload
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        <Handwriting
          id="fresh-weekly"
          className="absolute top-6 right-6 w-44 -rotate-6 text-espresso-foreground lg:w-56"
        />
      </div>
    </div>
  );
}
