import { FEATURES_HEAD, FEATURES } from '../content';
import Icon from './Icon';
import Reveal from './Reveal';
import TiltCard from './TiltCard';

export default function Features() {
  return (
    <section id="features" className="section section--cream-hi">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">{FEATURES_HEAD.eyebrow}</span>
            <h2>
              {FEATURES_HEAD.titleA}{' '}
              <em style={{ color: 'var(--teal)', fontStyle: 'normal' }}>{FEATURES_HEAD.titleB}</em>
            </h2>
            <p className="lead">{FEATURES_HEAD.lead}</p>
          </div>
        </Reveal>

        <div className="feat-grid">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.07}>
              <TiltCard>
                <article className="feat-card">
                  {f.tag && <span className="feat-tag">{f.tag}</span>}
                  <span className="feat-icon">
                    <Icon name={f.icon} size={22} strokeWidth={1.7} />
                  </span>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </article>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}