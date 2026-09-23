import { Suspense, lazy, useMemo } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import Download from './components/Download';
import Footer from './components/Footer';

const Hero3D = lazy(() => import('./components/Hero3D'));

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
              color: 'rgba(247,243,233,0.5)',
              font: '600 14px Manrope, sans-serif',
              letterSpacing: '0.12em',
            }}
          >
            LOADING
          </div>
        }
      >
        <Hero3D />
      </Suspense>
    ),
    [],
  );

  return (
    <>
      <Navbar />
      <main>
        <Hero scene={scene} />
        <Features />
        <HowItWorks />
        <Pricing />
        <Download />
      </main>
      <Footer />
    </>
  );
}