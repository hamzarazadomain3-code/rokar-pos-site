import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { DOWNLOAD_URL, LATEST_VERSION } from '../content';
import Icon from './Icon';
import Reveal from './Reveal';

const TRUST = ['Works fully offline', 'Urdu + English', 'Windows 10 / 11', 'Barcode & thermal ready'];

export default function Hero({ scene }: { scene: ReactNode }) {
  return (
    <section id="top" className="section hero">
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-grain" aria-hidden="true" />
      <div className="container hero-grid">
        <div className="hero-copy">
          <Reveal>
            <span className="eyebrow" style={{ color: 'var(--gold-hi)' }}>
              <span className="eyebrow-dot" />
              Offline-first POS · Made for Pakistani shops
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h1>
              Billing, stock aur udhaar —{' '}
              <span style={{ color: 'var(--gold-hi)' }}>sab ek hi app mein.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="lead">
              Rokar is a fast, offline billing &amp; inventory POS built for retail shops in Pakistan.
              Scan or search, bill in seconds, track udhaar (khata), and know your real profit — no
              internet? No problem.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="hero-cta-row">
              <a className="btn btn-primary btn-lg" href={DOWNLOAD_URL}>
                <Icon name="download" size={20} />
                Download for Windows
              </a>
              <a className="btn btn-ghost btn-lg hero-more" href="#how">
                <Icon name="play" size={18} />
                See how it works
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.32}>
            <div className="hero-chips">
              {TRUST.map((t) => (
                <span key={t} className="chip">
                  <Icon name="check" size={13} strokeWidth={2.6} />
                  {t}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <p className="hero-vmeta">
              Version {LATEST_VERSION} · Update checks run automatically inside the app
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
        </motion.div>
      </div>
    </section>
  );
}