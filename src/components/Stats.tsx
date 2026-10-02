import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { STATS } from '../content';

function Counter({ value, decimals = 0, suffix }: { value: number; decimals?: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [display, setDisplay] = useState('0');

  // content.json is edited by hand through the admin panel, so a stat can arrive
  // as a string ("Rs 25k") or as missing. Animating to NaN prints a literal
  // "NaN" on the page, so fall back to showing the raw text unchanged.
  const numeric = Number.isFinite(Number(value)) ? Number(value) : null;

  useEffect(() => {
    if (!inView || numeric === null) return;
    const controls = animate(0, numeric, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [inView, numeric, decimals]);

  return (
    <span className="stat-value">
      <span ref={ref}>{numeric === null ? String(value ?? '') : display}</span>
      {numeric === null ? '' : suffix}
    </span>
  );
}

export default function Stats() {
  if (!STATS.length) return null;

  return (
    <section className="section stats">
      <div className="container stats-grid">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            className="stat"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
          >
            <Counter value={s.value} decimals={s.decimals} suffix={s.suffix} />
            <span className="stat-label">{s.label}</span>
            {s.sub && <span className="stat-sub">{s.sub}</span>}
          </motion.div>
        ))}
      </div>
    </section>
  );
}