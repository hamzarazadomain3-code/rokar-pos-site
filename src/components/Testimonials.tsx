import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TESTIMONIALS } from '../content';
import Icon from './Icon';

export default function Testimonials() {
  const count = TESTIMONIALS.length;
  const [index, setIndex] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count);

  useEffect(() => {
    if (count < 2) return;
    timer.current = window.setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => window.clearInterval(timer.current);
  }, [count]);

  // The section used to ship with invented customer names, so it is now empty by
  // default. Hooks must run unconditionally, so the empty check comes last and
  // leaves no empty heading or carousel shell on the page.
  if (count === 0) return null;

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

        {count > 1 && (
          <>
            <div className="tst-nav">
              {TESTIMONIALS.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  className={`tst-dot ${i === index ? 'is-active' : ''}`}
                  onClick={() => setIndex(i)}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>

            <div className="tst-arrows">
              <button type="button" className="tst-arrow" onClick={() => go(-1)} aria-label="Previous">
                <Icon name="chevron" size={20} />
              </button>
              <button type="button" className="tst-arrow" onClick={() => go(1)} aria-label="Next">
                <Icon name="chevron" size={20} style={{ transform: 'rotate(180deg)' }} />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}