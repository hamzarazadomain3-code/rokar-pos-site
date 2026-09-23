import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INDUSTRIES } from '../content';
import Icon from './Icon';
import Reveal from './Reveal';

export default function IndustrySolutions() {
  const [activeId, setActiveId] = useState<string>(INDUSTRIES[0]?.id || 'grocery');
  const activeIndustry = INDUSTRIES.find((ind) => ind.id === activeId) || INDUSTRIES[0];

  if (!INDUSTRIES.length) return null;

  return (
    <section id="industries" className="section section-industries">
      <div className="container">
        <Reveal>
          <div className="section-head" style={{ maxWidth: 780 }}>
            <span className="eyebrow">
              <span className="eyebrow-dot" /> Har Dukaan Ke Mutabiq
            </span>
            <h2>
              Aap ki dukaan koi bhi ho —{' '}
              <span style={{ color: 'var(--teal-accent)' }}>Rokar POS tayyar hai</span>
            </h2>
            <p className="lead">
              Apni dukan ki category select karein aur dekhein ke Rokar POS aapke business ko kaise aasan aur munafabakhsh banata hai.
            </p>
          </div>
        </Reveal>

        {/* Industry Pill Tabs */}
        <Reveal delay={0.08}>
          <div className="industry-tabs-bar">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind.id}
                className={`industry-tab-btn ${activeId === ind.id ? 'is-active' : ''}`}
                onClick={() => setActiveId(ind.id)}
              >
                <span className="ind-name">{ind.name}</span>
                <span className="ind-urdu urdu">{ind.urdu}</span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* Selected Industry Card */}
        <Reveal delay={0.16}>
          <AnimatePresence mode="wait">
            {activeIndustry && (
              <motion.div
                key={activeIndustry.id}
                className="industry-display-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <div className="ind-card-left">
                  <div className="ind-badge-row">
                    <span className="ind-cat-tag">Tailored for {activeIndustry.name}</span>
                    <span className="ind-cat-urdu urdu">{activeIndustry.urdu}</span>
                  </div>

                  <h3>{activeIndustry.desc}</h3>

                  <ul className="ind-features-list">
                    {activeIndustry.points.map((pt, idx) => (
                      <li key={idx}>
                        <span className="ind-check-icon">
                          <Icon name="check" size={15} strokeWidth={2.8} />
                        </span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="ind-cta-row">
                    <a
                      className="btn btn-primary btn-sm"
                      href={`https://wa.me/923001234567?text=Assalam%20o%20Alaikum,%20meri%20${encodeURIComponent(
                        activeIndustry.name,
                      )}%20ki%20shop%20hai,%20mujhe%20Rokar%20POS%20demo%20chahiye.`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Icon name="whatsapp" size={16} /> Is Category Ka Demo Mangein
                    </a>
                  </div>
                </div>

                <div className="ind-card-right">
                  <div className="ind-preview-graphic">
                    <div className="ind-mockup-header">
                      <div className="mac-dots">
                        <span />
                        <span />
                        <span />
                      </div>
                      <span className="mockup-title">{activeIndustry.name} POS Mode</span>
                    </div>

                    <div className="ind-mockup-body">
                      <div className="mockup-stat-tile">
                        <span>Offline Reliability</span>
                        <b>100% Active</b>
                      </div>
                      <div className="mockup-stat-tile">
                        <span>Checkout Time</span>
                        <b style={{ color: 'var(--teal-accent)' }}>~3 Seconds</b>
                      </div>
                      <div className="mockup-stat-tile">
                        <span>Hardware Compatibility</span>
                        <b>All Thermal & Barcode Scanners</b>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
}
