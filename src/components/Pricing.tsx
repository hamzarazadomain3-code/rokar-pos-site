import {
  PRICING,
  PRICING_PACKAGES,
  CONTACT,
  DOWNLOAD_URL,
  HAS_WHATSAPP,
  WHATSAPP_NUMBER,
} from '../content';
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
                  {HAS_WHATSAPP ? (
                    <a
                      className={`btn ${pkg.popular ? 'btn-primary' : 'btn-ghost'} btn-block`}
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        `Assalam o Alaikum, mujhe Rokar POS ke ${pkg.name} package ki price chahiye.`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Icon name="whatsapp" size={17} /> Is Package Ki Price Poochein
                    </a>
                  ) : (
                    <a
                      className={`btn ${pkg.popular ? 'btn-primary' : 'btn-ghost'} btn-block`}
                      href={DOWNLOAD_URL}
                    >
                      <Icon name="download" size={17} /> Download Karein
                    </a>
                  )}
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
              <h4>Hisaab Hamesha Aap Ke Paas</h4>
              <p>
                Jo udhaar chipka hua tha wo <strong>bilkul hisaab ke andar</strong> nazar aata hai
                — koi bhi customer pooche to turant jawab mil jata hai. Har raat 2 baje{' '}
                <strong>aap ke folder mein backup</strong> banta hai, aur PC badalne par wahi
                backup wapas restore ho jaata hai.
              </p>
            </div>
            <div className="roi-action">
              {HAS_WHATSAPP ? (
                <a className="btn btn-primary btn-sm" href={CONTACT.whatsapp} target="_blank" rel="noreferrer">
                  Direct WhatsApp Quote
                </a>
              ) : (
                <a className="btn btn-primary btn-sm" href={DOWNLOAD_URL}>
                  <Icon name="download" size={16} />
                  Download Rokar POS
                </a>
              )}
            </div>
          </div>
        </Reveal>

        {/* Licence note */}
        <Reveal delay={0.28}>
          <div className="pricing-note">
            <p>
              <strong>{PRICING.noteHeading}:</strong> {PRICING.note}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}