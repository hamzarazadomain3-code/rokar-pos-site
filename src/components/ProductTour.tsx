import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import Reveal from './Reveal';
import ThermalReceiptModal from './ThermalReceiptModal';
import LiveBillingDemo from './LiveBillingDemo';
import shotManifest from '../../public/screens/manifest.json';

type ViewId = 'billing' | 'dashboard' | 'inventory' | 'udhaar' | 'purchases' | 'reports';

interface Shot {
  id: ViewId;
  label: string;
  icon: string;
  /** File name from the capture manifest, e.g. "billing.webp". */
  file: string;
  alt: string;
  tag: string;
  title: string;
  desc: string;
}

/**
 * The tour now shows the real application instead of hand-drawn mockups.
 *
 * Every image here is a screenshot of Rokar POS actually running, captured by
 * `pos-app/scripts/capture_screens.js` against a demo database seeded with
 * fictional data (see `pos-app/scripts/seed_demo.js`). Nothing in these pictures
 * is a real customer, shop or transaction, which is why the caption under each
 * one says so.
 *
 * The per-shot pixel dimensions are read from the capture manifest rather than
 * hard-coded, so the browser reserves the right box before the image arrives and
 * the page does not jump. If a screen is missing from the manifest the lookup
 * throws at render time, which fails the build instead of shipping a broken <img>.
 */
const SHOTS: Shot[] = [
  {
    id: 'billing',
    label: 'Fast Billing',
    icon: 'zap',
    file: 'billing.webp',
    alt: 'Rokar POS billing screen with three products added to the cart — Tapal Danedar Tea, Shakoor Sugar and Coca-Cola — showing prices, wholesale prices and remaining stock.',
    tag: '3-Sec Billing',
    title: 'Scan karo, bill banao — 3 seconds mein',
    desc: 'Barcode scanner ya 2-letter search. Auto-discount, cash ya credit — receipt foran print ya WhatsApp par bhejein.',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'chart',
    file: 'dashboard.webp',
    alt: 'Rokar POS dashboard showing today’s sales and bill count, total udhaar due, low-stock alerts, top selling products and the most recent bills.',
    tag: 'Owner Overview',
    title: 'Subah kholte hi poora haal',
    desc: 'Aaj ki sale, aaj ke bill, kul udhaar, stock alerts aur top products — sab ek hi screen par, bina kisi report banaye.',
  },
  {
    id: 'inventory',
    label: 'Stock',
    icon: 'box',
    file: 'inventory.webp',
    alt: 'Rokar POS inventory screen listing products with their cost price, sale price, stock quantity and low-stock levels.',
    tag: 'Live Inventory',
    title: 'Pata ho shelf par kitna maal bacha hai',
    desc: 'Real-time stock deduction, low-stock alerts, aur full Stock Audit — physical dukan aur system ledger ka foran milaan.',
  },
  {
    id: 'udhaar',
    label: 'Udhaar / Khata',
    icon: 'book',
    file: 'udhaar.webp',
    alt: 'Rokar POS udhaar ledger listing customers with their outstanding credit balances.',
    tag: 'Credit Ledger',
    title: 'Grahak ka hisaab, hamesha roshan',
    desc: 'Customer ledgers, "Kitna baqi hai" balance warning, aur 1-click WhatsApp payment reminder se udhaar recovery aasan.',
  },
  {
    id: 'purchases',
    label: 'Purchases',
    icon: 'truck',
    file: 'purchases.webp',
    alt: 'Rokar POS purchases screen showing supplier purchase orders and their status.',
    tag: 'Suppliers',
    title: 'Maa ki tadaad aur supplier ka hisaab',
    desc: 'Purchase order banao, maal receive karo, stock aur cost price apne aap update ho jaye — aur supplier ka baqi hisaab bhi rahe.',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'chart',
    file: 'reports.webp',
    alt: 'Rokar POS reports and analytics screen showing sales and profit figures over a date range.',
    tag: 'Owner Insights',
    title: 'Asli net profit, har din ke hisaab se',
    desc: 'Daily sales, best-sellers, hourly trends aur monthly P&L. Sab 1 click mein Excel aur PDF mein export ho jata hai.',
  },
];

const manifestShots = new Map(
  (shotManifest.shots as { screen: string; file: string; width: number; height: number }[]).map((s) => [
    s.screen,
    s,
  ]),
);

function shotSrc(shot: Shot): string {
  return `/screens/${shot.file}`;
}

function shotDims(shot: Shot): { width: number; height: number } {
  const m = manifestShots.get(shot.id);
  if (!m) throw new Error(`public/screens/manifest.json has no entry for "${shot.id}" — re-run npm run capture:screens`);
  return { width: m.width, height: m.height };
}

export default function ProductTour() {
  const [view, setView] = useState<ViewId>('billing');
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const active = useMemo(() => SHOTS.find((s) => s.id === view) || SHOTS[0], [view]);
  const dims = shotDims(active);

  const step = useCallback((dir: 1 | -1) => {
    setView((cur) => {
      const i = SHOTS.findIndex((s) => s.id === cur);
      const next = (i + dir + SHOTS.length) % SHOTS.length;
      return SHOTS[next].id;
    });
  }, []);

  // Warm the browser cache for the remaining screenshots once the section is
  // close to the viewport, so moving between tabs does not flash an empty frame.
  // Only fires for shots the visitor has not reached yet, and never on a
  // connection that has asked for less data.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const warmed = new Set<ViewId>(['billing']);

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        if (
          typeof navigator !== 'undefined' &&
          'connection' in navigator &&
          // @ts-expect-error — not in the DOM lib's Connection type
          (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType || ''))
        ) {
          return;
        }
        SHOTS.forEach((s) => {
          if (warmed.has(s.id)) return;
          warmed.add(s.id);
          const im = new Image();
          im.src = shotSrc(s);
        });
      },
      { rootMargin: '250px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Lightbox: Escape closes, arrows move, and the page behind must not scroll.
  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomOpen(false);
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [zoomOpen, step]);

  return (
    <section id="tour" className="section tour">
      <div className="container">
        <Reveal>
          <div className="section-head" style={{ maxWidth: 800 }}>
            <span className="eyebrow">
              <span className="eyebrow-dot" /> Real Screenshots
            </span>
            <h2>
              Ye <span style={{ color: 'var(--teal-accent)' }}>asli software</span> hai — khud chala kar dekhein
            </h2>
            <p className="lead">
              Neeche Rokar POS ke asal modules hain, wahi screenshots jo aap download karne ke baad khud kholenge —
              Billing, Dashboard, Stock, Udhaar Khata, Purchases aur Reports.
            </p>
          </div>
        </Reveal>

        <div className="tour-grid">
          <Reveal>
            <div className="tour-stage" ref={stageRef}>
              <div className="tour-device" data-view={view}>
                <div className="tour-cam" aria-hidden="true" />
                <div className="tour-screen-wrap">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={view}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25 }}
                    >
                      <figure className="tour-shot">
                        <button
                          type="button"
                          className="tour-shot-btn"
                          onClick={() => setZoomOpen(true)}
                          aria-label={`${active.label} ka screenshot poore size mein dekhein`}
                        >
                          <img
                            className="tour-shot-img"
                            src={shotSrc(active)}
                            width={dims.width}
                            height={dims.height}
                            loading="lazy"
                            decoding="async"
                            alt={active.alt}
                          />
                          <span className="tour-zoom" aria-hidden="true">
                            <Icon name="zoom" size={15} /> Poora size
                          </span>
                        </button>
                        <figcaption className="tour-shot-cap">
                          Asli interface · <b>sample data</b> — koi asli dukaan ya grahak nahi
                        </figcaption>
                      </figure>
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="tour-stand" aria-hidden="true" />
              </div>
              <span className="tour-chip tour-chip--a">⚡ Poori tarah offline chalta hai</span>
              <span className="tour-chip tour-chip--b">🧾 58mm · 80mm · A4 receipts</span>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="tour-panel">
              <div className="tour-tabs" role="tablist" aria-label="Software modules">
                {SHOTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    id={`tour-tab-${s.id}`}
                    aria-selected={view === s.id}
                    aria-controls="tour-shotpanel"
                    className={`tour-tab ${view === s.id ? 'is-active' : ''}`}
                    onClick={() => setView(s.id)}
                  >
                    <Icon name={s.icon} size={17} />
                    {s.label}
                  </button>
                ))}
              </div>

              <div id="tour-shotpanel" role="tabpanel" aria-labelledby={`tour-tab-${view}`}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={view}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                    className="tour-copy"
                  >
                    <span className="tour-tag">{active.tag}</span>
                    <h3>{active.title}</h3>
                    <p>{active.desc}</p>

                    <div className="tour-action-row">
                      <button className="btn btn-primary btn-sm" onClick={() => setReceiptOpen(true)}>
                        <Icon name="printer" size={16} /> Thermal Receipt Sample Dekhein
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setZoomOpen(true)}>
                        <Icon name="zoom" size={16} /> Screenshot Bada Karein
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Interactive Live Billing Demo Container */}
        <Reveal delay={0.16}>
          <div className="tour-simulator-wrap">
            <div className="simulator-intro">
              <span className="eyebrow" style={{ color: 'var(--teal-accent)' }}>
                ⚡ Self-Test Simulator
              </span>
              <h3>Live Bill Bana Kar Test Karein</h3>
              <p>Neeche diye gaye terminal par khud products par click karein aur real-time calculations check karein:</p>
            </div>
            <LiveBillingDemo />
          </div>
        </Reveal>
      </div>

      {/* Screenshot lightbox */}
      {zoomOpen && (
        <div
          className="tour-lb"
          role="dialog"
          aria-modal="true"
          aria-label={`${active.label} — full size screenshot`}
          onClick={() => setZoomOpen(false)}
        >
          <button
            ref={closeRef}
            type="button"
            className="tour-lb-btn tour-lb-close"
            onClick={() => setZoomOpen(false)}
            aria-label="Close screenshot"
          >
            <Icon name="close" size={20} />
          </button>
          <button
            type="button"
            className="tour-lb-btn tour-lb-prev"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            aria-label="Previous screenshot"
          >
            <Icon name="chevron" size={22} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <figure className="tour-lb-fig" onClick={(e) => e.stopPropagation()}>
            <img
              src={shotSrc(active)}
              width={dims.width}
              height={dims.height}
              alt={active.alt}
              className="tour-lb-img"
            />
            <figcaption className="tour-lb-cap">
              <b>{active.label}</b> — Rokar POS ka asli interface · <b>sample data</b>
            </figcaption>
          </figure>
          <button
            type="button"
            className="tour-lb-btn tour-lb-next"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            aria-label="Next screenshot"
          >
            <Icon name="chevron" size={22} />
          </button>
        </div>
      )}

      {/* Receipt Modal */}
      <ThermalReceiptModal isOpen={receiptOpen} onClose={() => setReceiptOpen(false)} />
    </section>
  );
}