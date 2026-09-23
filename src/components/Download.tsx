import { DOWNLOAD_URL, FAQ, LATEST_VERSION, SYS_REQS } from '../content';
import Icon from './Icon';
import Reveal from './Reveal';

export default function Download() {
  return (
    <section id="download" className="section section--cream-hi">
      <div className="container">
        <div className="dl-grid">
          <Reveal>
            <div className="dl-main">
              <span className="eyebrow">Download</span>
              <h2>Free trial for your shop today</h2>
              <p className="lead">
                Install in under two minutes. Set up your products and start billing — 15 days free,
                no credit card.
              </p>

              <div className="dl-meta">
                <a className="btn btn-primary btn-lg" href={DOWNLOAD_URL}>
                  <Icon name="download" size={22} />
                  Download for Windows
                </a>
                <span className="dl-facts">
                  <b>v{LATEST_VERSION}</b> · Windows 64-bit · NSIS installer
                </span>
              </div>

              <div className="dl-safe">
                <Icon name="shield" size={18} />
                <span>
                  Updates check automatically inside the app — Roz issues fix milengi, data par
                  koi asar nahi.
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="dl-reqs">
              <h3>System requirements</h3>
              <ul>
                {SYS_REQS.map((r) => (
                  <li key={r}>
                    <span className="req-dot" />
                    {r}
                  </li>
                ))}
              </ul>
              <p className="req-note">
                Roz installation mobile/laptop dono par chalti hai — low-end PC par bhi smooth.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.05}>
          <div className="faq">
            <h3 className="faq-title">Common questions</h3>
            <div className="faq-list">
              {FAQ.map((f) => (
                <details className="faq-item" key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}