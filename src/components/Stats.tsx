import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { STATS } from '../content';

function Counter({ value, decimals = 0, suffix }: { value: number; decimals?: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [inView, value, decimals]);

  return (
    <span className="stat-value">
      <span ref={ref}>{display}</span>
      {suffix}
    </span>
  );
}

export default function Stats() {
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
          </motion.div>
        ))}
      </div>
    </section>
  );
}