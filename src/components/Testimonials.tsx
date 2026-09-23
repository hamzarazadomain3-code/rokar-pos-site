import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TESTIMONIALS } from '../content';
import Icon from './Icon';

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + TESTIMONIALS.length) % TESTIMONIALS.length);

  useEffect(() => {
    timer.current = window.setInterval(() => setIndex((i) => (i + 1) % TESTIMONIALS.length), 6000);
    return () => window.clearInterval(timer.current);
  }, []);

  const active = TESTIMONIALS[index];

  return (
    <section className="section section--teal testimonials">
      <div className="hero-glow hero-glow--soft" aria-hidden="true" />
      <div className="container">
        <div className="section-head" style={{ maxWidth: 640 }}>
          <span className="eyebrow" style={{ color: 'var(--gold-hi)' }}>
            Shopkeepers ki raay
          </span>
          <h2>Chhoti dukaanon ka <em style={{ color: 'var(--gold-hi)', fontStyle: 'normal' }}>bada bharosa</em></h2>
        </div>

        <div className="tst">
          <motion.blockquote
            key={index}
            className="tst-card"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="tst-mark" aria-hidden="true">
              <Icon name="quote" size={22} />
            </span>
            <p className="tst-quote">{active.quote}</p>
            <footer className="tst-by">
              <strong>{active.name}</strong>
              <span>{active.role}</span>
            </footer>
          </motion.blockquote>
        </div>

        <div className="tst-nav">
          {TESTIMONIALS.map((t, i) => (
            <button
              key={t.name}
              className={`tst-dot ${i === index ? 'is-active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>

        <div className="tst-arrows">
          <button className="tst-arrow" onClick={() => go(-1)} aria-label="Previous">
            <Icon name="chevron" size={20} />
          </button>
          <button className="tst-arrow" onClick={() => go(1)} aria-label="Next">
            <Icon name="chevron" size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>
        </div>
      </div>
    </section>
  );
}