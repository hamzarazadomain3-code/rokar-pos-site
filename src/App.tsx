import { Suspense, lazy, useMemo } from 'react';
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

const Hero3D = lazy(() => import('./components/Hero3D'));
const Admin = lazy(() => import('./admin/Admin'));
const AdminGate = lazy(() => import('./admin/AdminGate'));

export default function App() {
  const scene = useMemo(
    () => (
      <Suspense
        fallback={
          <div
            style={{
              width: '100%',
              aspectRatio: '4/3',
              display: 'grid',
              placeItems: 'center',
              color: 'rgba(251,250,247,0.6)',
              font: '700 13px Plus Jakarta Sans, sans-serif',
              letterSpacing: '0.14em',
            }}
          >
            ⚡ LOADING TERMINAL
          </div>
        }
      >
        <Hero3D />
      </Suspense>
    ),
    [],
  );

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
          <main>
            <Hero scene={scene} />
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