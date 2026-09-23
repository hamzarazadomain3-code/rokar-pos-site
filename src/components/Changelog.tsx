import { CHANGELOG, DOWNLOAD_URL, LATEST_VERSION } from '../content';
import Icon from './Icon';
import Reveal from './Reveal';

export default function Changelog() {
  return (
    <section id="updates" className="section section--cream-hi">
      <div className="container">
        <Reveal>
          <div className="section-head ch-head" style={{ maxWidth: 700 }}>
            <span className="eyebrow">Latest updates</span>
            <h2>Rokar <em style={{ color: 'var(--teal)', fontStyle: 'normal' }}>growing weekly</em></h2>
            <p className="lead">
              We ship improvements har hafte — installs updated automatically, bahir se kuch aur karna nahi padta.
            </p>
          </div>
        </Reveal>

        <div className="ch-grid">
          {CHANGELOG.map((c, i) => (
            <Reveal key={c.version} delay={i * 0.06}>
              <article className={`ch-card ${i === 0 ? 'ch-card--latest' : ''}`}>
                {i === 0 && <span className="ch-latest">v{LATEST_VERSION}</span>}
                <div className="ch-meta">
                  <b>v{c.version}</b>
                  <span>{c.date}</span>
                </div>
                <h3>{c.title}</h3>
                <ul>
                  {c.notes.map((n) => (
                    <li key={n}>
                      <Icon name="check" size={13} strokeWidth={2.6} />
                      {n}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="ch-foot">
            <a className="btn btn-primary" href={DOWNLOAD_URL}>
              <Icon name="download" size={18} />
              Get the latest build
            </a>
            <span className="ch-note">App ke andar update checks khud chaltay hain — koi manual download nahi.</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}