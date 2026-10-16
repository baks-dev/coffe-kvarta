import { About } from '@/components/sections/about';
import { Contacts } from '@/components/sections/contacts';
import { Delivery } from '@/components/sections/delivery';
import { Footer } from '@/components/sections/footer';
import { LeadSection } from '@/components/sections/lead-section';
import { Header } from '@/components/sections/header';
import { Hero } from '@/components/sections/hero';
import { Products } from '@/components/sections/products';
import { Subscription } from '@/components/sections/subscription';

export const ensureStatic = 'navigation';

export default function HomePage() {
  return (
    <>
      <div id="top" />
      <Header />
      <main className="flex-1">
        <Hero />
        <Products />
        <About />
        <Subscription />
        <Delivery />
        <LeadSection />
        <Contacts />
      </main>
      <Footer />
    </>
  );
}
