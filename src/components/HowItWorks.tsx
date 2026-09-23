import { STEPS_HEAD, STEPS } from '../content';
import Reveal from './Reveal';

export default function HowItWorks() {
  return (
    <section id="how" className="section">
      <div className="container">
        <Reveal>
          <div className="section-head" style={{ maxWidth: 560 }}>
            <span className="eyebrow">{STEPS_HEAD.eyebrow}</span>
            <h2>{STEPS_HEAD.title}</h2>
            <p className="lead">{STEPS_HEAD.lead}</p>
          </div>
        </Reveal>

        <ol className="steps">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.num} delay={i * 0.08}>
              <article className="step-card">
                <span className="step-num">{s.num}</span>
                <div className="step-line" aria-hidden="true" />
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <span className="urdu step-urdu">{s.urdu}</span>
              </article>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}