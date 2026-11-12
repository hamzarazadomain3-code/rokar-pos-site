import { DOWNLOAD, DOWNLOAD_URL, WEB_APP_URL, FAQ, SYS_REQS } from '../content';
import Icon from './Icon';
import Reveal from './Reveal';

export default function DownloadSection() {
  return (
    <section id="download" className="section section--cream-hi">
      <div className="container">
        <div className="dl-grid">
          <Reveal>
            <div className="dl-main">
              <span className="eyebrow">{DOWNLOAD.eyebrow}</span>
              <h2>
                {DOWNLOAD.titleA}{' '}
                <em style={{ color: 'var(--teal)', fontStyle: 'normal' }}>{DOWNLOAD.titleB}</em>
              </h2>
              <p className="lead">{DOWNLOAD.lead}</p>

              <div className="dl-meta">
                <a className="btn btn-primary btn-lg" href={DOWNLOAD_URL}>
                  <Icon name="download" size={22} />
                  {DOWNLOAD.buttonLabel}
                </a>
                <span className="dl-facts">{DOWNLOAD.facts}</span>
              </div>

              {/* Browser version: same product, no install. The 7-day figure and
                  the "no card" promise describe the web Worker (accounts.ts
                  TRIAL_DAYS = 7; signup takes shop name + username + password
                  only). The desktop app ships no such offer, so this block is
                  worded as web-only. */}
              <div className="dl-web">
                <p className="dl-web-title">{DOWNLOAD.webTitle}</p>
                <p className="dl-web-note">{DOWNLOAD.webNote}</p>
                {DOWNLOAD.webSteps?.length ? (
                  <ol className="dl-web-steps">
                    {DOWNLOAD.webSteps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                ) : null}
                <a className="btn btn-ghost-dark" href={WEB_APP_URL}>
                  <Icon name="window" size={18} />
                  {DOWNLOAD.webButtonLabel}
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="dl-reqs">
              <h3>{DOWNLOAD.requirementsTitle}</h3>
              <ul>
                {SYS_REQS.map((r) => (
                  <li key={r.label}>
                    <span className="req-dot" />
                    <b>{r.label}:</b> {r.value}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.05}>
          <div className="faq">
            <h3 className="faq-title">{DOWNLOAD.faqTitle}</h3>
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
