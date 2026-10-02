import raw from './content.json';
import type {
  ChangelogEntry,
  FAQItem,
  Feature,
  Industry,
  PricingPackage,
  SiteContent,
  Stat,
  Step,
  Testimonial,
} from './content-types';

export const CONTENT = raw as unknown as SiteContent;

export type { ChangelogEntry, FAQItem, Feature, Industry, PricingPackage, SiteContent, Stat, Step, Testimonial };

/* ---- site-level ---- */
export const DOWNLOAD_URL = CONTENT.site.downloadUrl;
export const RELEASES_PAGE = CONTENT.site.releasesPage || '';
export const LATEST_VERSION = CONTENT.site.latestVersion;
export const CONTACT = CONTENT.site.contact;

/**
 * Contact rows are optional. An empty string means the owner has not filled the
 * real number in yet, so the UI hides the row entirely instead of publishing a
 * placeholder that customers could actually dial or message.
 */
export const HAS_WHATSAPP = Boolean(CONTACT.whatsapp?.trim());
export const HAS_PHONE = Boolean(CONTACT.phoneTel?.trim());
export const HAS_EMAIL = Boolean(CONTACT.email?.trim());

/**
 * Bare WhatsApp number pulled out of the configured wa.me link, so per-plan and
 * per-industry links can be built without repeating the digits (and without a
 * stale number being hard-coded into a component).
 */
export const WHATSAPP_NUMBER = CONTACT.whatsapp?.match(/wa\.me\/(\d+)/)?.[1] ?? '';

export const NAV_LINKS = CONTENT.nav.links;

/* ---- hero ---- */
export const HERO = CONTENT.hero;

/* ---- sections ---- */
export const FEATURES: Feature[] = CONTENT.features.items;
export const FEATURES_HEAD = CONTENT.features;

export const INDUSTRIES: Industry[] = CONTENT.industries || [];

export const STEPS: Step[] = CONTENT.steps.items;
export const STEPS_HEAD = CONTENT.steps;

export const PRICING = CONTENT.pricing;
export const PRICING_INCLUDES = CONTENT.pricing.includes || [];
export const PRICING_PACKAGES: PricingPackage[] = CONTENT.pricing.packages || [];

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