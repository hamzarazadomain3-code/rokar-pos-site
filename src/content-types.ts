export type Feature = {
  icon: string;
  title: string;
  desc: string;
  tag?: string;
};

export type Step = {
  num: string;
  title: string;
  desc: string;
  urdu: string;
};

export type Stat = {
  value: number;
  decimals?: number;
  suffix: string;
  label: string;
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  urdu?: string;
};

export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  notes: string[];
};

export type FAQItem = {
  q: string;
  a: string;
};

export type SiteContent = {
  meta: {
    name: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
  };
  site: {
    downloadUrl: string;
    latestVersion: string;
    contact: {
      phone: string;
      phoneTel: string;
      email: string;
      supportHours: string;
      whatsapp: string;
    };
  };
  nav: {
    links: { href: string; label: string }[];
  };
  hero: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    lead: string;
    ctaDownload: string;
    ctaHow: string;
    trust: string[];
    versionNote: string;
  };
  features: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    lead: string;
    items: Feature[];
  };
  steps: {
    eyebrow: string;
    title: string;
    lead: string;
    items: Step[];
  };
  pricing: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    lead: string;
    badge: string;
    cardTitle: string;
    cardSub: string;
    cardCta: string;
    includesTitle: string;
    includes: string[];
    noteHeading: string;
    note: string;
  };
  download: {
    eyebrow: string;
    title: string;
    lead: string;
    buttonLabel: string;
    factsPrefix: string;
    safe: string;
    requirementsTitle: string;
    requirements: string[];
    requirementNote: string;
    faqTitle: string;
    faq: FAQItem[];
  };
  footer: {
    taglineUrdu: string;
    tagline: string;
    siteTitle: string;
    supportTitle: string;
    rights: string;
    tiny: string;
  };
  stats: Stat[];
  testimonials: Testimonial[];
  changelog: ChangelogEntry[];
  ticker: string[];
};