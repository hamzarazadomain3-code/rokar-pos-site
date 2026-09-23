import { PRICING } from '../content';
import Icon from './Icon';
import Reveal from './Reveal';

export default function Pricing() {
  return (
    <section id="pricing" className="section section--teal">
      <div className="hero-glow hero-glow--soft" aria-hidden="true" />
      <div className="container">
        <Reveal>
          <div className="section-head" style={{ maxWidth: 620 }}>
            <span className="eyebrow">{PRICING.eyebrow}</span>
            <h2>
              {PRICING.titleA}{' '}
              <em style={{ color: 'var(--gold-hi)', fontStyle: 'normal' }}>{PRICING.titleB}</em>
            </h2>
            <p className="lead">{PRICING.lead}</p>
          </div>
        </Reveal>

        <div className="pricing-grid">
          <Reveal>
            <div className="price-card">
              <span className="price-badge">{PRICING.badge}</span>
              <h3 style={{ fontSize: '1.6rem' }}>{PRICING.cardTitle}</h3>
              <p className="price-sub">{PRICING.cardSub}</p>
              <a className="btn btn-primary" href="#contact">
                <Icon name="mail" size={18} />
                {PRICING.cardCta}
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="price-includes">
              <h3 style={{ color: 'var(--cream-hi)' }}>{PRICING.includesTitle}</h3>
              <ul className="includes">
                {PRICING.includes.map((inc) => (
                  <li key={inc}>
                    <span className="inc-check">
                      <Icon name="check" size={14} strokeWidth={2.6} />
                    </span>
                    {inc}
                  </li>
                ))}
              </ul>
              <p className="price-note">
                <strong>{PRICING.noteHeading}</strong> — {PRICING.note}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}