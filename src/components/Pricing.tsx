import { PRICING_INCLUDES } from '../content';
import Icon from './Icon';
import Reveal from './Reveal';

export default function Pricing() {
  return (
    <section id="pricing" className="section section--teal">
      <div className="hero-glow hero-glow--soft" aria-hidden="true" />
      <div className="container">
        <Reveal>
          <div className="section-head" style={{ maxWidth: 620 }}>
            <span className="eyebrow">Pricing</span>
            <h2>Simple yearly license. <em style={{ color: 'var(--gold-hi)', fontStyle: 'normal' }}>No hidden fees.</em></h2>
            <p className="lead">
              One payment covers everything — billing, inventory, printing, backups, updates, and
              support. Pehle 15 din bilkul free try karein.
            </p>
          </div>
        </Reveal>

        <div className="pricing-grid">
          <Reveal>
            <div className="price-card">
              <span className="price-badge">Annual licence</span>
              <h3 style={{ fontSize: '1.6rem' }}>Contact us for pricing</h3>
              <p className="price-sub">
                Price depends on your shop size and branches. WhatsApp ya email par poochiye —
                usually same-day answer.
              </p>
              <a className="btn btn-primary" href="#contact">
                <Icon name="mail" size={18} />
                Ask for a price
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="price-includes">
              <h3 style={{ color: 'var(--cream-hi)' }}>Hamesha included:</h3>
              <ul className="includes">
                {PRICING_INCLUDES.map((inc) => (
                  <li key={inc}>
                    <span className="inc-check">
                      <Icon name="check" size={14} strokeWidth={2.6} />
                    </span>
                    {inc}
                  </li>
                ))}
              </ul>
              <p className="price-note">
                <strong>Try before you buy</strong> — install, set up your products, and bill for 15
                days free. Zyada requirements? We will tailor a package.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}