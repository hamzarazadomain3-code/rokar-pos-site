import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { CONTENT } from '../content';
import BreadcrumbList from '../components/BreadcrumbList';
import Reveal from '../components/Reveal';

export default function IndustryPage() {
  const [, navigate] = useLocation();
  const params = useParams();
  const id = params?.id;

  const industry = CONTENT.industries?.find((ind) => ind.id === id);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!industry) {
      navigate('/');
      return;
    }
    window.scrollTo(0, 0);
    setLoaded(true);
  }, [industry, navigate]);

  if (!industry || !loaded) return null;

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rokarpos.co.uk/' },
      { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://rokarpos.co.uk/#industries' },
      { '@type': 'ListItem', position: 3, name: industry.name, item: `https://rokarpos.co.uk/industry/${industry.id}` },
    ],
  };

  return (
    <section className="industry-page" aria-labelledby="industry-heading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <BreadcrumbList items={[
        { label: 'Home', href: '/' },
        { label: 'Industries', href: '/#industries' },
        { label: industry.name, href: `/industry/${industry.id}` },
      ]} />

      <div className="container">
        <header className="industry-header">
          <span className="industry-icon" aria-hidden="true">{industry.icon}</span>
          <h1 id="industry-heading">{industry.name}</h1>
          <p className="industry-urdu">{industry.urdu}</p>
          <p className="industry-desc">{industry.desc}</p>
        </header>

        <div className="industry-features" role="list">
          {industry.points?.map((point, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="industry-feature" role="listitem">
                <span className="feature-bullet" aria-hidden="true">✓</span>
                <span>{point}</span>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="industry-cta">
          <p className="industry-cta-text">Ready to streamline your {industry.name.toLowerCase()} business?</p>
          <a href="/#download" className="btn btn-primary btn-lg">
            Download Rokar POS
          </a>
        </div>
      </div>
    </section>
  );
}