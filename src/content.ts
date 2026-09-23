import raw from './content.json';
import type {
  ChangelogEntry,
  FAQItem,
  Feature,
  SiteContent,
  Stat,
  Step,
  Testimonial,
} from './content-types';

export const CONTENT = raw as unknown as SiteContent;

export type { ChangelogEntry, FAQItem, Feature, SiteContent, Stat, Step, Testimonial };

/* ---- site-level ---- */
export const DOWNLOAD_URL = CONTENT.site.downloadUrl;
export const LATEST_VERSION = CONTENT.site.latestVersion;
export const CONTACT = CONTENT.site.contact;

export const NAV_LINKS = CONTENT.nav.links;

/* ---- hero ---- */
export const HERO = CONTENT.hero;

/* ---- sections ---- */
export const FEATURES: Feature[] = CONTENT.features.items;
export const FEATURES_HEAD = CONTENT.features;

export const STEPS: Step[] = CONTENT.steps.items;
export const STEPS_HEAD = CONTENT.steps;

export const PRICING = CONTENT.pricing;
export const PRICING_INCLUDES = CONTENT.pricing.includes;

export const DOWNLOAD = CONTENT.download;
export const SYS_REQS = CONTENT.download.requirements;
export const FAQ: FAQItem[] = CONTENT.download.faq;

export const FOOTER = CONTENT.footer;

/* ---- social proof ---- */
export const STATS: Stat[] = CONTENT.stats;
export const TESTIMONIALS: Testimonial[] = CONTENT.testimonials;
export const CHANGELOG: ChangelogEntry[] = CONTENT.changelog;
export const TICKER = CONTENT.ticker;

export default CONTENT;