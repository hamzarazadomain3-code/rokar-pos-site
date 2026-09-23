import { FEATURES } from '../content';
import Icon from './Icon';
import Reveal from './Reveal';

export default function Features() {
  return (
    <section id="features" className="section section--cream-hi">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">Everything a shop needs</span>
            <h2>
              One app. <em style={{ color: 'var(--teal)', fontStyle: 'normal' }}>Full control.</em>
            </h2>
            <p className="lead">
              Rokar brings billing, stock, credit, and reports together — the kit that used to live
              in your cash-box registers, your khaata book, and your head.
            </p>
          </div>
        </Reveal>

        <div className="feat-grid">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.07}>
              <article className="feat-card">
                {f.tag && <span className="feat-tag">{f.tag}</span>}
                <span className="feat-icon">
                  <Icon name={f.icon} size={22} strokeWidth={1.7} />
                </span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}