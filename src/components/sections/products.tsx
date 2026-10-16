import { ProductCard } from '@/components/product-card';
import { Section, SectionHeading } from '@/components/section';
import { toTelHref } from '@/lib/format';
import { getShowcaseProducts } from '@/lib/get-products';
import { content } from '@/data/content';
import { siteData } from '@/data/site';

export function Products() {
  const products = getShowcaseProducts();

  return (
    <Section id="products">
      <SectionHeading
        sectionId="products"
        eyebrow={content.products.eyebrow}
        title={content.products.title}
        lead={content.products.lead}
      />

      {products.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-body">
          {content.products.empty}{' '}
          <a href={toTelHref(siteData.phone)} className="font-medium underline underline-offset-4">
            {siteData.phone}
          </a>
        </p>
      )}
    </Section>
  );
}
