import { DOWNLOAD, DOWNLOAD_URL, FAQ, LATEST_VERSION, SYS_REQS } from '../content';
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
              <h2>{DOWNLOAD.title}</h2>
              <p className="lead">{DOWNLOAD.lead}</p>

              <div className="dl-meta">
                <a className="btn btn-primary btn-lg" href={DOWNLOAD_URL}>
                  <Icon name="download" size={22} />
                  {DOWNLOAD.buttonLabel}
                </a>
                <span className="dl-facts">
                  <b>v{LATEST_VERSION}</b> · {DOWNLOAD.factsPrefix}
                </span>
              </div>

              <div className="dl-safe">
                <Icon name="shield" size={18} />
                <span>{DOWNLOAD.safe}</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="dl-reqs">
              <h3>{DOWNLOAD.requirementsTitle}</h3>
              <ul>
                {SYS_REQS.map((r) => (
                  <li key={r}>
                    <span className="req-dot" />
                    {r}
                  </li>
                ))}
              </ul>
              <p className="req-note">{DOWNLOAD.requirementNote}</p>
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