import { motion } from 'framer-motion';
import { Suspense, type ReactNode } from 'react';
import { DOWNLOAD_URL, HERO, HAS_WHATSAPP, CONTACT } from '../content';
import Icon from './Icon';
import Reveal from './Reveal';

/**
 * Shown instead of the WebGL scene on devices that cannot afford it. Drawing it
 * in CSS rather than shipping a screenshot keeps the fallback at zero bytes --
 * the whole point of skipping three.js is not adding weight back elsewhere.
 */
function HeroPoster() {
  return (
    <div className="hero-poster" role="img" aria-label="Rokar POS ka billing screen: ek receipt par items, total aur payment">
      <div className="hero-poster-slip">
        <div className="hero-poster-head">
          <b>Rokar POS</b>
          <span>Bill #RKR-1048</span>
        </div>
        <ul className="hero-poster-items">
          {[
            ['Surf Excel 1kg', '1,180'],
            ['Tapal Danedar 450g', '680'],
            ['Olpers Milk 1L', '560'],
            ['National Biscuit', '120'],
          ].map(([name, amount]) => (
            <li key={name}>
              <span>{name}</span>
              <span>{amount}</span>
            </li>
          ))}
        </ul>
        <div className="hero-poster-total">
          <span>Total</span>
          <span>2,540</span>
        </div>
        <div className="hero-poster-foot">Paid &amp; Printed</div>
      </div>
    </div>
  );
}

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
            <span className="eyebrow" style={{ color: 'var(--gold-hi)' }}>
              <span className="eyebrow-dot" />
              Offline-First POS &mdash; Made for Pakistani Shops
            </span>
          </Reveal>

          <Reveal delay={0.06}>
            <h1>
              {HERO.titleA} <span className="gradient-gold-text">{HERO.titleB}</span>
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="lead">{HERO.lead}</p>
          </Reveal>

          <Reveal delay={0.18}>
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

          <Reveal delay={0.24}>
            <div className="hero-chips">
              {HERO.trust.map((t) => (
                <span key={t} className="chip">
                  <Icon name="check" size={13} strokeWidth={2.8} />
                  {t}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="hero-vmeta-row">
              <p className="hero-vmeta">
                <span className="vmeta-tag">Official Windows App</span> {HERO.versionNote}
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
          {scene ? (
            <Suspense fallback={<HeroPoster />}>{scene}</Suspense>
          ) : (
            <HeroPoster />
          )}
          {HAS_WHATSAPP && (
            <div className="hero-scene-actions">
              <a className="hero-wa" href={CONTACT.whatsapp} target="_blank" rel="noreferrer">
                <span className="wa-mini-dot" />
                <Icon name="whatsapp" size={16} />
                WhatsApp par 15 Min Free Setup Mangein
              </a>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}