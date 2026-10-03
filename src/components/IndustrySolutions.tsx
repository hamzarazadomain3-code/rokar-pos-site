import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INDUSTRIES, DOWNLOAD_URL, HAS_WHATSAPP, WHATSAPP_NUMBER } from '../content';
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
                    {HAS_WHATSAPP ? (
                      <a
                        className="btn btn-primary btn-sm"
                        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                          `Assalam o Alaikum, meri ${activeIndustry.name} ki shop hai, mujhe Rokar POS demo chahiye.`,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Icon name="whatsapp" size={16} /> Is Category Ka Demo Mangein
                      </a>
                    ) : (
                      <a className="btn btn-primary btn-sm" href={DOWNLOAD_URL}>
                        <Icon name="download" size={16} /> Download Karein
                      </a>
                    )}
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
                      {(activeIndustry.preview || []).map((tile) => (
                        <div className="mockup-stat-tile" key={tile.k}>
                          <span>{tile.k}</span>
                          <b>{tile.v}</b>
                        </div>
                      ))}
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
