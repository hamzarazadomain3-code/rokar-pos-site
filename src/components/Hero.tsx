import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { DOWNLOAD_URL, HERO, LATEST_VERSION, CONTACT } from '../content';
import Icon from './Icon';
import Reveal from './Reveal';

export default function Hero({ scene }: { scene: ReactNode }) {
  return (
    <section id="top" className="section hero">
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-grain" aria-hidden="true" />
      <div className="hero-orbit hero-orbit--1" aria-hidden="true" />
      <div className="hero-orbit hero-orbit--2" aria-hidden="true" />
      <div className="container hero-grid">
        <div className="hero-copy">
          <Reveal>
            <span className="eyebrow" style={{ color: 'var(--gold-hi)' }}>
              <span className="eyebrow-dot" />
              {HERO.eyebrow}
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h1>
              {HERO.titleA}{' '}
              <span style={{ color: 'var(--gold-hi)' }}>{HERO.titleB}</span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
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
              <a className="btn btn-ghost btn-lg hero-more" href="#how">
                <Icon name="play" size={18} />
                {HERO.ctaHow}
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.32}>
            <div className="hero-chips">
              {HERO.trust.map((t) => (
                <span key={t} className="chip">
                  <Icon name="check" size={13} strokeWidth={2.6} />
                  {t}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <p className="hero-vmeta">
              Version {LATEST_VERSION} · {HERO.versionNote}
            </p>
          </Reveal>
        </div>

        <motion.div
          className="hero-scene"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          {scene}
          <a className="hero-wa" href={CONTACT.whatsapp} target="_blank" rel="noreferrer">
            <Icon name="whatsapp" size={16} />
            WhatsApp par poochiye
          </a>
        </motion.div>
      </div>
    </section>
  );
}