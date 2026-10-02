import { Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Ticker from './components/Ticker';
import Features from './components/Features';
import ProductTour from './components/ProductTour';
import IndustrySolutions from './components/IndustrySolutions';
import Stats from './components/Stats';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import Changelog from './components/Changelog';
import Download from './components/Download';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';
import { useCanRender3D } from './hooks/useCanRender3D';

const Hero3D = lazy(() => import('./components/Hero3D'));
const Admin = lazy(() => import('./admin/Admin'));
const AdminGate = lazy(() => import('./admin/AdminGate'));

export default function App() {
  const canRender3D = useCanRender3D();
  const hash = typeof window !== 'undefined' ? window.location.hash : '';

  return (
    <>
      {hash.startsWith('#/admin') ? (
        <Suspense fallback={<AdminGate />}>
          <Admin />
        </Suspense>
      ) : (
        <>
          <Navbar />
          <main id="main">
            {/* three.js is ~1 MB, so it is only pulled in on devices that can
                actually run it. Everywhere else the hero falls back to a poster. */}
            <Hero scene={canRender3D ? <Hero3D /> : null} />
            <Ticker />
            <Features />
            <ProductTour />
            <IndustrySolutions />
            <Stats />
            <HowItWorks />
            <Testimonials />
            <Pricing />
            <Changelog />
            <Download />
          </main>
          <Footer />
          <WhatsAppFloat />
        </>
      )}
    </>
  );
}