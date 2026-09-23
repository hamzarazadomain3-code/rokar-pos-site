import { PRICING, PRICING_PACKAGES, CONTACT } from '../content';
import Icon from './Icon';
import Reveal from './Reveal';

export default function Pricing() {
  return (
    <section id="pricing" className="section section--teal">
      <div className="hero-glow hero-glow--soft" aria-hidden="true" />
      <div className="container">
        <Reveal>
          <div className="section-head" style={{ maxWidth: 760 }}>
            <span className="eyebrow" style={{ color: 'var(--gold-hi)' }}>
              <span className="eyebrow-dot" /> {PRICING.eyebrow}
            </span>
            <h2>
              {PRICING.titleA}{' '}
              <span style={{ color: 'var(--gold-hi)' }}>{PRICING.titleB}</span>
            </h2>
            <p className="lead">{PRICING.lead}</p>
          </div>
        </Reveal>

        {/* 3 Packages Grid */}
        <div className="pricing-cards-grid">
          {PRICING_PACKAGES.map((pkg, idx) => (
            <Reveal key={pkg.id} delay={idx * 0.08}>
              <div className={`price-pkg-card ${pkg.popular ? 'is-popular' : ''}`}>
                {pkg.popular && <span className="popular-ribbon">⭐ {pkg.badge}</span>}

                <div className="pkg-header">
                  <div className="pkg-title-wrap">
                    <h3>{pkg.name}</h3>
                    <span className="pkg-urdu urdu">{pkg.urdu}</span>
                  </div>
                  <p className="pkg-sub">{pkg.sub}</p>
                </div>

                <div className="pkg-cta-wrap">
                  <a
                    className={`btn ${pkg.popular ? 'btn-primary' : 'btn-ghost'} btn-block`}
                    href={`https://wa.me/923001234567?text=Assalam%20o%20Alaikum,%20mujhe%20Rokar%20POS%20ke%20${encodeURIComponent(
                      pkg.name,
                    )}%20package%20ka%20price%20aur%20free%20trial%20chahiye.`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Icon name="whatsapp" size={17} /> 15 Din Free Trial Mangein
                  </a>
                </div>

                <div className="pkg-features">
                  <span className="pkg-features-title">Pura Package Shamil Hai:</span>
                  <ul>
                    {pkg.features.map((feat, fIdx) => (
                      <li key={fIdx}>
                        <span className="pkg-check">
                          <Icon name="check" size={14} strokeWidth={2.8} />
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ROI / Savings Box */}
        <Reveal delay={0.24}>
          <div className="pricing-roi-banner">
            <div className="roi-icon-wrap">
              <Icon name="chart" size={32} />
            </div>
            <div className="roi-content">
              <h4>Dukaan Ka Nuqsaan Khatam, Munafa Mehfooz</h4>
              <p>
                Hamare 500+ dukaandar har mahine kam az kam <strong>15-20 ghante hisaab kitab</strong> ke bachate hain aur{' '}
                <strong>Rs 25,000+ ka bhoola hua udhaar</strong> recover karte hain.
              </p>
            </div>
            <div className="roi-action">
              <a className="btn btn-primary btn-sm" href={CONTACT.whatsapp} target="_blank" rel="noreferrer">
                Direct WhatsApp Quote
              </a>
            </div>
          </div>
        </Reveal>

        {/* Trial Note */}
        <Reveal delay={0.28}>
          <div className="pricing-trial-note">
            <p>
              <strong>{PRICING.noteHeading}:</strong> {PRICING.note}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}