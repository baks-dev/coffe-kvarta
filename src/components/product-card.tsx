import Image from 'next/image';
import { LeadIntentLink } from '@/components/lead-intent-link';
import { formatPrice, formatWeight } from '@/lib/format';
import type { ShowcaseProduct } from '@/lib/get-products';
import { content } from '@/data/content';
import { images } from '@/data/images';

interface ProductCardProps {
  product: ShowcaseProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const image = images.products[product.id];
  const eyebrow =
    product.type === 'coffee'
      ? content.products.roastLabels[product.roastLevel]
      : content.products.dripPackEyebrow;
  const meta =
    product.type === 'coffee'
      ? formatWeight(product.weight)
      : `${product.quantity} ${content.products.quantityUnit}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-card border border-border bg-card shadow-card">
      {image ? (
        <div className="relative aspect-[4/3]">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 18rem, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 bg-surface p-6 text-center">
          {product.type === 'coffee' ? (
            <>
              <p className="font-heading text-h2">{product.notes[0] ?? product.name}</p>
              <p className="text-small text-muted-foreground">
                {content.products.roastLabels[product.roastLevel]}
              </p>
            </>
          ) : (
            <>
              <p className="font-heading text-display">{product.quantity}</p>
              <p className="text-small text-muted-foreground">{content.products.dripPackCaption}</p>
            </>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-eyebrow text-muted-foreground">{eyebrow}</p>
        <h3 className="text-h3">{product.name}</h3>
        {product.type === 'coffee' && (
          <p className="text-small text-muted-foreground">{product.notes.join(' · ')}</p>
        )}
        {product.description && <p className="text-small">{product.description}</p>}

        <div className="mt-auto flex items-end justify-between gap-4 pt-4">
          <div className="flex flex-col">
            <span className="text-small text-muted-foreground">{meta}</span>
            <span className="font-heading text-h3">{formatPrice(product.price)}</span>
          </div>
          <LeadIntentLink intent={{ interest: 'order', productId: product.id }}>
            {content.products.cta}
            <span className="sr-only"> — {product.name}</span>
          </LeadIntentLink>
        </div>
      </div>
    </article>
  );
}
