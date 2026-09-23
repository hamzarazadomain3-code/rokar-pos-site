import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { DOWNLOAD_URL, HERO, LATEST_VERSION, CONTACT } from '../content';
import Icon from './Icon';
import Reveal from './Reveal';

export default function Hero({ scene }: { scene: ReactNode }) {
  return (
    <section id="top" className="section hero">
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-glow hero-glow--2" aria-hidden="true" />
      <div className="hero-grain" aria-hidden="true" />
      <div className="hero-orbit hero-orbit--1" aria-hidden="true" />
      <div className="hero-orbit hero-orbit--2" aria-hidden="true" />

      <div className="container hero-grid">
        <div className="hero-copy">
          <Reveal>
            <div className="hero-rating-badge">
              <span className="star-icons">⭐⭐⭐⭐⭐</span>
              <span className="rating-text">
                <strong>4.9 / 5</strong> · 500+ Dukanon Ka Bharosa
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <span className="eyebrow" style={{ color: 'var(--gold-hi)' }}>
              <span className="eyebrow-dot" />
              Offline-First POS &mdash; Made for Pakistani Shops
            </span>
          </Reveal>

          <Reveal delay={0.12}>
            <h1>
              Billing, stock aur udhaar{' '}
              <span className="gradient-gold-text">sab ek hi app mein.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.18}>
            <p className="lead">{HERO.lead}</p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="hero-cta-row">
              <motion.a
                className="btn btn-primary btn-lg"
                href={DOWNLOAD_URL}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <Icon name="download" size={20} />
                {HERO.ctaDownload}
              </motion.a>
              <a className="btn btn-ghost btn-lg hero-more" href="#tour">
                <Icon name="play" size={18} />
                {HERO.ctaHow}
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="hero-chips">
              {HERO.trust.map((t) => (
                <span key={t} className="chip">
                  <Icon name="check" size={13} strokeWidth={2.8} />
                  {t}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.36}>
            <div className="hero-vmeta-row">
              <p className="hero-vmeta">
                <span className="vmeta-tag">Official Windows App</span> Version {LATEST_VERSION} &mdash; 15 days free full trial, instant setup
              </p>
            </div>
          </Reveal>
        </div>

        <motion.div
          className="hero-scene"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
        >
          {scene}
          <div className="hero-scene-actions">
            <a className="hero-wa" href={CONTACT.whatsapp} target="_blank" rel="noreferrer">
              <span className="wa-mini-dot" />
              <Icon name="whatsapp" size={16} />
              WhatsApp par 15 Min Free Setup Mangein
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}