import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import Reveal from './Reveal';
import ThermalReceiptModal from './ThermalReceiptModal';
import LiveBillingDemo from './LiveBillingDemo';

type View = 'billing' | 'stock' | 'khata' | 'reports';

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
    label: 'Fast Billing',
    icon: 'zap',
    title: 'Scan karo, bill banao — 3 seconds mein',
    desc: 'Barcode scanner ya 2-letter search. Auto-discount, cash ya credit — receipt foran print ya WhatsApp par bhejein.',
    tag: '3-Sec Billing',
  },
  {
    id: 'khata',
    label: 'Udhaar / Khata',
    icon: 'book',
    title: 'Grahak ka hisaab, hamesha roshan',
    desc: 'Customer ledgers, "Kitna baqi hai" balance warning, aur 1-click WhatsApp payment reminder se udhaar recovery aasan.',
    tag: 'Credit Ledger',
  },
  {
    id: 'stock',
    label: 'Stock Audit',
    icon: 'box',
    title: 'Pata ho shelf par kitna maal bacha hai',
    desc: 'Real-time stock deduction, low-stock alerts, aur full Stock Audit — physical dukan aur system ledger ka foran milaan.',
    tag: 'Live Inventory',
  },
  {
    id: 'reports',
    label: 'Profit Reports',
    icon: 'chart',
    title: 'Asli net profit, har din ke hisaab se',
    desc: 'Daily sales, best-sellers, hourly trends aur monthly P&L. Sab 1 click mein Excel aur PDF mein export ho jata hai.',
    tag: 'Owner Insights',
  },
];

const BILL_ROWS = [
  ['Basmati Rice Super 5kg', 'x1', 'Rs 1,150'],
  ['Habib Cooking Oil 2L', 'x1', 'Rs 890'],
  ['Sugar / Cheeni 2kg', 'x2', 'Rs 320'],
  ['Olpers Milk 1L', 'x2', 'Rs 560'],
];

const KHATA_ROWS = [
  ['Tariq Sb (Gali 3)', 'Rs 4,200', 'Overdue 5 days'],
  ['Malik Asif', 'Rs 1,850', 'Due today'],
  ['Chaudhry Riaz', 'Rs 6,100', 'Reminder sent'],
];

const STOCK_ROWS = [
  ['Atta Chakki 10kg', 'Low · 4 left', 'Need 25'],
  ['Habib Oil 2L Can', '28 in stock', 'OK'],
  ['Tapal Tea 450g', '14 in stock', 'OK'],
  ['Dal Chana 1kg', 'Low · 5kg left', 'Need 30kg'],
];

const REPORT_ROWS = [
  ['Daily Gross Sales', 'Rs 54,800'],
  ['Total Cost of Goods', 'Rs 41,200'],
  ['Net Day Profit (Bachaat)', 'Rs 13,600 (24.8%)'],
  ['Active Cash in Drawer', 'Rs 52,100'],
];

function ScreenInner({ view, onOpenReceipt }: { view: View; onOpenReceipt: () => void }) {
  if (view === 'billing') {
    return (
      <div className="tour-screen">
        <div className="ts-head" key="b-head">
          <div className="ts-head-brand">
            <span className="ts-brand-badge" />
            <b>ROKAR POS · v2.8</b>
          </div>
          <span className="ts-head-meta">Bill #1042 · 10:42 AM</span>
        </div>
        <div className="ts-tabs">
          {['Billing', 'Khata', 'Stock', 'Reports'].map((t) => (
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
          <span>Gross Total (6 items)</span>
          <b>Rs 2,920</b>
        </div>
        <div className="ts-cta-row">
          <button className="ts-cta" onClick={onOpenReceipt}>
            <Icon name="printer" size={15} /> PAY & PRINT RECEIPT
          </button>
        </div>
      </div>
    );
  }

  if (view === 'khata') {
    return (
      <div className="tour-screen">
        <div className="ts-head" key="k-head">
          <div className="ts-head-brand">
            <span className="ts-brand-badge" />
            <b>ROKAR POS · Khata</b>
          </div>
          <span className="ts-head-meta">Total Udhaar: Rs 48,250</span>
        </div>
        <div className="ts-tabs">
          {['Billing', 'Khata', 'Stock', 'Reports'].map((t) => (
            <span key={t} className={t === 'Khata' ? 'on' : ''}>
              {t}
            </span>
          ))}
        </div>
        <ul className="ts-list ts-khata">
          {KHATA_ROWS.map(([n, bal, status]) => (
            <li key={n}>
              <div>
                <b>{n}</b>
                <span className="status-note">{status}</span>
              </div>
              <span className="price text-danger">{bal}</span>
            </li>
          ))}
        </ul>
        <div className="ts-card">
          <span>1-Click Recovery:</span>
          <b>Send WhatsApp Balance Reminder</b>
        </div>
        <div className="ts-cta-row">
          <button className="ts-cta" style={{ background: '#10b981', color: '#fff' }}>
            <Icon name="whatsapp" size={15} /> SEND WHATSAPP KHATA
          </button>
        </div>
      </div>
    );
  }

  if (view === 'stock') {
    return (
      <div className="tour-screen">
        <div className="ts-head" key="s-head">
          <div className="ts-head-brand">
            <span className="ts-brand-badge" />
            <b>ROKAR POS · Stock Audit</b>
          </div>
          <span className="ts-head-meta">Audit Status: Active</span>
        </div>
        <div className="ts-tabs">
          {['Billing', 'Khata', 'Stock', 'Reports'].map((t) => (
            <span key={t} className={t === 'Stock' ? 'on' : ''}>
              {t}
            </span>
          ))}
        </div>
        <ul className="ts-list ts-stock">
          {STOCK_ROWS.map(([n, s, w]) => (
            <li key={n}>
              <b>{n}</b>
              <span className={`badge ${w.startsWith('Need') ? 'warn' : ''}`}>{w}</span>
              <span className="price">{s}</span>
            </li>
          ))}
        </ul>
        <div className="ts-card">
          <span>Physical vs System Audit:</span>
          <b>1,420 Items Scanned · 2 Mismatches</b>
        </div>
        <div className="ts-cta-row">
          <button className="ts-cta">PROCEED AUDIT DISCREPANCY</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tour-screen">
      <div className="ts-head" key="r-head">
        <div className="ts-head-brand">
          <span className="ts-brand-badge" />
          <b>ROKAR POS · Daily P&L</b>
        </div>
        <span className="ts-head-meta">Shift 1 & 2 Summary</span>
      </div>
      <div className="ts-tabs">
        {['Billing', 'Khata', 'Stock', 'Reports'].map((t) => (
          <span key={t} className={t === 'Reports' ? 'on' : ''}>
            {t}
          </span>
        ))}
      </div>
      <div className="ts-metric">
        <span>Today's Total Net Profit</span>
        <b>Rs 13,600</b>
        <em>▲ +19.4% vs last week</em>
      </div>
      <ul className="ts-list ts-report">
        {REPORT_ROWS.map(([d, v]) => (
          <li key={d}>
            <span>{d}</span>
            <span className="price font-bold">{v}</span>
          </li>
        ))}
      </ul>
      <div className="ts-cta-row">
        <button className="ts-cta">EXPORT TO EXCEL REPORT</button>
      </div>
    </div>
  );
}

export default function ProductTour() {
  const [view, setView] = useState<View>('billing');
  const [receiptOpen, setReceiptOpen] = useState(false);
  const active = VIEWS.find((v) => v.id === view) || VIEWS[0];

  return (
    <section id="tour" className="section tour">
      <div className="container">
        <Reveal>
          <div className="section-head" style={{ maxWidth: 800 }}>
            <span className="eyebrow">
              <span className="eyebrow-dot" /> Live Software Tour
            </span>
            <h2>
              Ek nazar mein <span style={{ color: 'var(--teal-accent)' }}>poori dukaan ka control</span>
            </h2>
            <p className="lead">
              Rokar POS ke mukhtalif modules dekhein — Fast Billing, Udhaar Khata, Stock Audit aur Daily Profit Dashboard.
            </p>
          </div>
        </Reveal>

        {/* Device Stage & Tabs Grid */}
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
                      transition={{ duration: 0.25 }}
                    >
                      <ScreenInner view={view} onOpenReceipt={() => setReceiptOpen(true)} />
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="tour-stand" aria-hidden="true" />
              </div>
              <span className="tour-chip tour-chip--a">⚡ 100% Offline Active</span>
              <span className="tour-chip tour-chip--b">☁️ Cloud Backup Done</span>
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
                  </div>
                </motion.div>
              </AnimatePresence>
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

      {/* Receipt Modal */}
      <ThermalReceiptModal isOpen={receiptOpen} onClose={() => setReceiptOpen(false)} />
    </section>
  );
}