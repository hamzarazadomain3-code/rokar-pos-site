import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

const SITE_URL = 'https://rokarpos.co.uk/';

type Content = {
  meta: Record<string, string>;
  site: {
    downloadUrl: string;
    contact: { phone: string; phoneTel: string; email: string; supportHours: string; whatsapp: string };
  };
  hero: { titleA: string; titleB: string; lead: string; ctaDownload: string };
  features: { items: { title: string; desc: string }[] };
  industries?: { name: string; desc: string }[];
  download: { faq: { q: string; a: string }[]; requirements: { label: string; value: string }[] };
};

function loadContent(): Content {
  return JSON.parse(
    readFileSync(fileURLToPath(new URL('../src/content.json', import.meta.url)), 'utf8'),
  ) as Content;
}

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Build the JSON-LD graph.
 *
 * Deliberately no `aggregateRating` and no `review`. The site used to declare
 * "4.9 from 540 ratings" for reviews that did not exist. Google treats invented
 * review markup as a spam violation, so it was removed rather than restyled --
 * this graph now only carries facts a visitor can verify on the page itself.
 *
 * `offers` is intentionally absent too: a price of "0" would misrepresent a
 * product that is only free for a 15-day trial, then paid.
 */
function buildJsonLd(c: Content) {
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: 'Rokar POS',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}logo.png` },
      areaServed: { '@type': 'Country', name: 'Pakistan' },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}#website`,
      url: SITE_URL,
      name: 'Rokar POS',
      inLanguage: 'en',
      publisher: { '@id': `${SITE_URL}#organization` },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}#app`,
      name: 'Rokar POS',
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'Point of sale',
      operatingSystem: 'Windows 10, Windows 11',
      description: c.meta.description,
      url: SITE_URL,
      downloadUrl: c.site.downloadUrl,
      featureList: c.features.items.map((f) => f.title),
      inLanguage: 'en',
      publisher: { '@id': `${SITE_URL}#organization` },
    },
  ];

  // A ContactPoint only goes in when a real number is configured -- otherwise the
  // markup would tell search engines to publish a phone nobody answers.
  const email = c.site.contact.email?.trim();
  const tel = c.site.contact.phoneTel?.trim();
  if (email || tel) {
    graph.push({
      '@type': 'ContactPoint',
      contactType: 'customer support',
      ...(tel ? { telephone: tel } : {}),
      ...(email ? { email } : {}),
      ...(c.site.contact.supportHours ? { hoursAvailable: c.site.contact.supportHours } : {}),
      areaServed: 'PK',
    });
  }

  if (c.download.faq?.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${SITE_URL}#faq`,
      mainEntity: c.download.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(
    /</g,
    '\\u003c',
  );
}

/**
 * The page is client-rendered, so a consumer that does not execute JavaScript
 * sees an empty <div id="root">. This mirrors the headline content into a
 * <noscript> block: real visitors still get the React app, while crawlers and
 * no-JS browsers get the words.
 */
function buildNoscript(c: Content) {
  const faq = c.download.faq
    .map((f) => `<dt><strong>${esc(f.q)}</strong></dt><dd>${esc(f.a)}</dd>`)
    .join('');

  const industries = c.industries?.length
    ? `<h2>Industries</h2><ul>${c.industries
        .map((i) => `<li>${esc(i.name)} &mdash; ${esc(i.desc)}</li>`)
        .join('')}</ul>`
    : '';

  return [
    '<noscript>',
    '<div style="max-width:720px;margin:0 auto;padding:24px;font-family:system-ui,sans-serif;line-height:1.6">',
    `<h1>${esc(`${c.hero.titleA} ${c.hero.titleB}`)}</h1>`,
    `<p>${esc(c.hero.lead)}</p>`,
    `<p><a href="${esc(c.site.downloadUrl)}">${esc(c.hero.ctaDownload)}</a></p>`,
    '<h2>Features</h2>',
    '<ul>',
    c.features.items.map((f) => `<li><strong>${esc(f.title)}:</strong> ${esc(f.desc)}</li>`).join(''),
    '</ul>',
    industries,
    '<h2>System requirements</h2>',
    '<ul>',
    c.download.requirements.map((r) => `<li>${esc(r.label)}: ${esc(r.value)}</li>`).join(''),
    '</ul>',
    '<h2>Frequently asked questions</h2>',
    `<dl>${faq}</dl>`,
    '</div>',
    '</noscript>',
  ].join('');
}

function rokarSeo(): Plugin {
  return {
    name: 'rokar-seo',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const c = loadContent();
        return html
          .replace(
            '<!--@seo:jsonld-->',
            () => `<script type="application/ld+json">${buildJsonLd(c)}</script>`,
          )
          .replace('<!--@seo:noscript-->', () => buildNoscript(c));
      },
    },
    // robots.txt and sitemap.xml live in public/ so they are served in dev, in
    // `vite preview` and in the production build with identical behaviour.
  };
}

export default rokarSeo;