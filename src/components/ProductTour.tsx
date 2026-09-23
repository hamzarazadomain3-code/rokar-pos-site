import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import Reveal from './Reveal';

type View = 'billing' | 'stock' | 'reports';

const VIEWS: {
  id: View;
  label: string;
  icon: string;
  title: string;
  desc: string;
  tag: string;
}[] = [
  {
    id: 'billing',
    label: 'Billing',
    icon: 'zap',
    title: 'Scan karo, bill banao — seconds me',
    desc: 'Barcode scan ya 3-key search, auto-discount, cash ya udhaar — receipt print ya WhatsApp par bhejein.',
    tag: 'Speed billing',
  },
  {
    id: 'stock',
    label: 'Stock',
    icon: 'box',
    title: 'Hamesha pata ho kitna stock hai',
    desc: 'Live stock levels, low-stock alerts, aur full Stock Audit — bin aur ledger ka milaan ek click me.',
    tag: 'Inventory',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'chart',
    title: 'Asli profit, har din ke hisaab se',
    desc: 'Daily sales, best-sellers, hourly trends aur monthly P&L. Sab Excel me export ho jata hai.',
    tag: 'Dashboard',
  },
];

const BILL_ROWS = [
  ['Basmati Rice 5kg', 'x1', 'Rs 1,150'],
  ['Sugar 1kg', 'x2', 'Rs 330'],
  ['Oil Canola 2L', 'x1', 'Rs 890'],
  ['Doodh 500ml', 'x1', 'Rs 190'],
];

const STOCK_ROWS = [
  ['Flour 5kg', 'Low · 4 left', 'need 20'],
  ['Oil Canola 2L', '26 in stock', 'ok'],
  ['Tea 450g', '12 in stock', 'ok'],
  ['Rice Basmati 5kg', 'Low · 3 left', 'need 30'],
];

const REPORT_ROWS = [
  ['Thu', 'Rs 38,200'],
  ['Fri', 'Rs 45,600'],
  ['Sat', 'Rs 52,900'],
  ['Total', 'Rs 1,36,700'],
];

function ScreenInner({ view }: { view: View }) {
  if (view === 'billing') {
    return (
      <div className="tour-screen">
        <div className="ts-head" key="b-head">
          <b>ROKAR POS</b>
          <span>Bill #0042 · 10:42 AM</span>
        </div>
        <div className="ts-tabs">
          {['Billing', 'Stock', 'Reports'].map((t) => (
            <span key={t} className={t === 'Billing' ? 'on' : ''}>
              {t}
            </span>
          ))}
        </div>
        <ul className="ts-list">
          {BILL_ROWS.map(([n, q, p]) => (
            <li key={n}>
              <b>{n}</b>
              <span className="qty">{q}</span>
              <span className="price">{p}</span>
            </li>
          ))}
        </ul>
        <div className="ts-total">
          <span>Total</span>
          <b>Rs 2,560</b>
        </div>
        <div className="ts-cta">PAY & PRINT RECEIPT</div>
      </div>
    );
  }
  if (view === 'stock') {
    return (
      <div className="tour-screen">
        <div className="ts-head" key="s-head">
          <b>ROKAR POS</b>
          <span>Stock Audit</span>
        </div>
        <div className="ts-tabs">
          {['Billing', 'Stock', 'Reports'].map((t) => (
            <span key={t} className={t === 'Stock' ? 'on' : ''}>
              {t}
            </span>
          ))}
        </div>
        <ul className="ts-list ts-stock">
          {STOCK_ROWS.map(([n, s, w]) => (
            <li key={n}>
              <b>{n}</b>
              <span className={`badge ${w === 'need 20' || w === 'need 30' ? 'warn' : ''}`}>{w}</span>
              <span className="price">{s}</span>
            </li>
          ))}
        </ul>
        <div className="ts-card">
          <span>Audit result</span>
          <b>1,284 items · 3 mismatches</b>
        </div>
        <div className="ts-cta">PROCEED AUDIT</div>
      </div>
    );
  }
  return (
    <div className="tour-screen">
      <div className="ts-head" key="r-head">
        <b>ROKAR POS</b>
        <span>Jump today · wal</span>
      </div>
      <div className="ts-tabs">
        {['Billing', 'Stock', 'Reports'].map((t) => (
          <span key={t} className={t === 'Reports' ? 'on' : ''}>
            {t}
          </span>
        ))}
      </div>
      <div className="ts-metric">
        <span>Today's sales</span>
        <b>Rs 42,150</b>
        <em>▲ +18% vs yesterday</em>
      </div>
      <ul className="ts-list ts-report">
        {REPORT_ROWS.map(([d, v]) => (
          <li key={d}>
            <span>{d}</span>
            <span className="price">{v}</span>
          </li>
        ))}
      </ul>
      <div className="ts-cta">EXPORT TO EXCEL</div>
    </div>
  );
}

export default function ProductTour() {
  const [view, setView] = useState<View>('billing');
  const active = VIEWS.find((v) => v.id === view)!;

  return (
    <section id="tour" className="section tour">
      <div className="container">
        <Reveal>
          <div className="section-head" style={{ maxWidth: 760 }}>
            <span className="eyebrow">Product tour</span>
            <h2>
              Ek nazar me <em style={{ color: 'var(--gold-hi)', fontStyle: 'normal' }}>poora POS</em>
            </h2>
            <p className="lead">
              Tabs daba kar dekhein — Rokar ki sab se kam aane wali screens.
            </p>
          </div>
        </Reveal>

        <div className="tour-grid">
          <Reveal>
            <div className="tour-stage">
              <div className="tour-device" data-view={view}>
                <div className="tour-cam" aria-hidden="true" />
                <div className="tour-screen-wrap">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={view}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ScreenInner view={view} />
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="tour-stand" aria-hidden="true" />
              </div>
              <span className="tour-chip tour-chip--a">Udhaar OK</span>
              <span className="tour-chip tour-chip--b">OneDrive · done</span>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="tour-panel">
              <div className="tour-tabs">
                {VIEWS.map((v) => (
                  <button
                    key={v.id}
                    className={`tour-tab ${view === v.id ? 'is-active' : ''}`}
                    onClick={() => setView(v.id)}
                  >
                    <Icon name={v.icon} size={17} />
                    {v.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3 }}
                  className="tour-copy"
                >
                  <span className="tour-tag">{active.tag}</span>
                  <h3>{active.title}</h3>
                  <p>{active.desc}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}