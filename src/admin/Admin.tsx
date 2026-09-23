import { useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { SiteContent, Feature, Step, FAQItem, Testimonial, Stat, ChangelogEntry, PricingPackage, SystemRequirement } from '../content-types';
import fallback from '../content.json';
import { Field, Area, NumField, StringListEditor, ArrayEditor } from './fields';
import './admin.css';

const RAW_URL =
  'https://raw.githubusercontent.com/hamzarazadomain3-code/rokar-pos-site/main/src/content.json';

const TOKEN_KEY = 'rokar_admin_token';
const CONTENT = fallback as unknown as SiteContent;

const TABS = [
  { id: 'general', label: 'General & Hero' },
  { id: 'features', label: 'Features' },
  { id: 'steps', label: 'Steps' },
  { id: 'commerce', label: 'Pricing & Download' },
  { id: 'social', label: 'Proof & Stats' },
  { id: 'updates', label: 'Updates' },
] as const;

type Tab = (typeof TABS)[number]['id'];

/* ================= Login ================= */

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok?: boolean; token?: string; error?: string };
      if (!res.ok || !data.token) throw new Error(data.error || 'Login failed');
      sessionStorage.setItem(TOKEN_KEY, data.token);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin">
      <div className="admin-login">
        <div className="admin-login-logo">R</div>
        <h1>Rokar Admin</h1>
        <p className="admin-login-sub">Apni website ka content yahan se update karein.</p>
        <form onSubmit={submit} className="admin-login-form">
          <input
            className="af-input"
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p className="admin-error">{error}</p>}
          <button className="af-btn af-btn--primary" disabled={busy || !password}>
            {busy ? 'Verifying…' : 'Log in'}
          </button>
        </form>
        <a className="admin-back" href="/">
          ← Vapas site par
        </a>
      </div>
    </div>
  );
}

/* ================= Editor sections ================= */

type SetContent = (c: SiteContent) => void;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="af-section">
      <h3 className="af-section-title">{title}</h3>
      {children}
    </div>
  );
}

function GeneralEditor({ c, setC }: { c: SiteContent; setC: SetContent }) {
  return (
    <>
      <Section title="Site & SEO">
        <Field label="Site name" value={c.meta.name} onChange={(v) => setC({ ...c, meta: { ...c.meta, name: v } })} />
        <Area
          label="Meta description"
          value={c.meta.description}
          onChange={(v) => setC({ ...c, meta: { ...c.meta, description: v } })}
          rows={2}
        />
        <Field label="OG title" value={c.meta.ogTitle} onChange={(v) => setC({ ...c, meta: { ...c.meta, ogTitle: v } })} />
        <Area
          label="OG description"
          value={c.meta.ogDescription}
          onChange={(v) => setC({ ...c, meta: { ...c.meta, ogDescription: v } })}
          rows={2}
        />
      </Section>

      <Section title="App / Download">
        <Field
          label="Download URL"
          value={c.site.downloadUrl}
          mono
          onChange={(v) => setC({ ...c, site: { ...c.site, downloadUrl: v } })}
        />
        <Field
          label="Latest version"
          value={c.site.latestVersion}
          onChange={(v) => setC({ ...c, site: { ...c.site, latestVersion: v } })}
        />
      </Section>

      <Section title="Navigation">
        <ArrayEditor
          label="Nav links"
          items={c.nav.links}
          onChange={(items) => setC({ ...c, nav: { ...c.nav, links: items } })}
          addLabel="Add link"
          makeNew={() => ({ href: '#', label: 'New' })}
          renderItem={(item, patch) => (
            <div className="af-row">
              <Field label="Label" value={item.label} onChange={(v) => patch({ label: v })} />
              <Field label="Href" value={item.href} mono onChange={(v) => patch({ href: v })} />
            </div>
          )}
        />
      </Section>

      <Section title="Hero">
        <Field label="Eyebrow" value={c.hero.eyebrow} onChange={(v) => setC({ ...c, hero: { ...c.hero, eyebrow: v } })} />
        <div className="af-row">
          <Field label="Title part (before highlight)" value={c.hero.titleA} onChange={(v) => setC({ ...c, hero: { ...c.hero, titleA: v } })} />
          <Field label="Highlighted part" value={c.hero.titleB} onChange={(v) => setC({ ...c, hero: { ...c.hero, titleB: v } })} />
        </div>
        <Area label="Lead paragraph" value={c.hero.lead} onChange={(v) => setC({ ...c, hero: { ...c.hero, lead: v } })} rows={3} />
        <div className="af-row">
          <Field label="Download button" value={c.hero.ctaDownload} onChange={(v) => setC({ ...c, hero: { ...c.hero, ctaDownload: v } })} />
          <Field label="Secondary button" value={c.hero.ctaHow} onChange={(v) => setC({ ...c, hero: { ...c.hero, ctaHow: v } })} />
        </div>
        <Field label="Version note (under buttons)" value={c.hero.versionNote} onChange={(v) => setC({ ...c, hero: { ...c.hero, versionNote: v } })} />
        <StringListEditor
          label="Trust chips"
          items={c.hero.trust}
          onChange={(items) => setC({ ...c, hero: { ...c.hero, trust: items } })}
          addLabel="Add chip"
        />
      </Section>

      <Section title="Footer">
        <Field label="Urdu tagline" value={c.footer.taglineUrdu} onChange={(v) => setC({ ...c, footer: { ...c.footer, taglineUrdu: v } })} />
        <Field label="English tagline" value={c.footer.tagline} onChange={(v) => setC({ ...c, footer: { ...c.footer, tagline: v } })} />
        <div className="af-row">
          <Field label="Site column title" value={c.footer.siteTitle} onChange={(v) => setC({ ...c, footer: { ...c.footer, siteTitle: v } })} />
          <Field label="Support column title" value={c.footer.supportTitle} onChange={(v) => setC({ ...c, footer: { ...c.footer, supportTitle: v } })} />
        </div>
        <div className="af-row">
          <Field label="Copyright note" value={c.footer.rights} onChange={(v) => setC({ ...c, footer: { ...c.footer, rights: v } })} />
          <Field label="Tiny note" value={c.footer.tiny} onChange={(v) => setC({ ...c, footer: { ...c.footer, tiny: v } })} />
        </div>
      </Section>

      <Section title="Contact">
        <div className="af-row">
          <Field label="Phone (display)" value={c.site.contact.phone} onChange={(v) => setC({ ...c, site: { ...c.site, contact: { ...c.site.contact, phone: v } } })} />
          <Field label="Phone (tel: link)" value={c.site.contact.phoneTel} mono onChange={(v) => setC({ ...c, site: { ...c.site, contact: { ...c.site.contact, phoneTel: v } } })} />
        </div>
        <div className="af-row">
          <Field label="Email" value={c.site.contact.email} mono onChange={(v) => setC({ ...c, site: { ...c.site, contact: { ...c.site.contact, email: v } } })} />
          <Field label="Support hours" value={c.site.contact.supportHours} onChange={(v) => setC({ ...c, site: { ...c.site, contact: { ...c.site.contact, supportHours: v } } })} />
        </div>
        <Field label="WhatsApp link" value={c.site.contact.whatsapp} mono onChange={(v) => setC({ ...c, site: { ...c.site, contact: { ...c.site.contact, whatsapp: v } } })} />
      </Section>
    </>
  );
}

function FeaturesEditor({ c, setC }: { c: SiteContent; setC: SetContent }) {
  const f = c.features;
  const set = (patch: Partial<SiteContent['features']>) => setC({ ...c, features: { ...f, ...patch } });
  return (
    <>
      <Section title="Features heading">
        <Field label="Eyebrow" value={f.eyebrow} onChange={(v) => set({ eyebrow: v })} />
        <div className="af-row">
          <Field label="Title A" value={f.titleA} onChange={(v) => set({ titleA: v })} />
          <Field label="Title B (highlight)" value={f.titleB} onChange={(v) => set({ titleB: v })} />
        </div>
        <Area label="Lead" value={f.lead} onChange={(v) => set({ lead: v })} rows={2} />
      </Section>
      <Section title="Feature cards">
        <ArrayEditor<Feature>
          label="Features"
          items={f.items}
          onChange={(items) => set({ items })}
          addLabel="Add feature"
          makeNew={() => ({ icon: 'zap', title: 'New feature', desc: 'Description yahan likhein', tag: '' })}
          renderItem={(item, patch) => (
            <>
              <div className="af-row">
                <Field label="Icon name" value={item.icon} onChange={(v) => patch({ icon: v })} />
                <Field label="Tag (optional)" value={item.tag || ''} onChange={(v) => patch({ tag: v || undefined })} />
              </div>
              <Field label="Title" value={item.title} onChange={(v) => patch({ title: v })} />
              <Area label="Description" value={item.desc} onChange={(v) => patch({ desc: v })} rows={2} />
            </>
          )}
        />
      </Section>
    </>
  );
}

function StepsEditor({ c, setC }: { c: SiteContent; setC: SetContent }) {
  const s = c.steps;
  const set = (patch: Partial<SiteContent['steps']>) => setC({ ...c, steps: { ...s, ...patch } });
  return (
    <>
      <Section title="Steps heading">
        <Field label="Eyebrow" value={s.eyebrow} onChange={(v) => set({ eyebrow: v })} />
        <Field label="Title" value={s.title} onChange={(v) => set({ title: v })} />
        <Area label="Lead" value={s.lead} onChange={(v) => set({ lead: v })} rows={2} />
      </Section>
      <Section title="Steps">
        <ArrayEditor<Step>
          label="Steps"
          items={s.items}
          onChange={(items) => set({ items })}
          addLabel="Add step"
          makeNew={() => ({ num: '05', title: 'New step', desc: 'Description', urdu: 'اردو' })}
          renderItem={(item, patch) => (
            <>
              <div className="af-row">
                <Field label="Number" value={item.num} onChange={(v) => patch({ num: v })} />
                <Field label="Title" value={item.title} onChange={(v) => patch({ title: v })} />
              </div>
              <Field label="Urdu" value={item.urdu} onChange={(v) => patch({ urdu: v })} />
              <Area label="Description" value={item.desc} onChange={(v) => patch({ desc: v })} rows={2} />
            </>
          )}
        />
      </Section>
    </>
  );
}

function CommerceEditor({ c, setC }: { c: SiteContent; setC: SetContent }) {
  const p = c.pricing;
  const d = c.download;
  const setP = (patch: Partial<SiteContent['pricing']>) => setC({ ...c, pricing: { ...p, ...patch } });
  const setD = (patch: Partial<SiteContent['download']>) => setC({ ...c, download: { ...d, ...patch } });
  return (
    <>
      <Section title="Pricing heading">
        <Field label="Eyebrow" value={p.eyebrow} onChange={(v) => setP({ eyebrow: v })} />
        <div className="af-row">
          <Field label="Title A" value={p.titleA} onChange={(v) => setP({ titleA: v })} />
          <Field label="Title B (highlight)" value={p.titleB} onChange={(v) => setP({ titleB: v })} />
        </div>
        <Area label="Lead" value={p.lead} onChange={(v) => setP({ lead: v })} rows={2} />
      </Section>
      <Section title="Pricing packages">
        <ArrayEditor<PricingPackage>
          label="Pricing packages"
          items={p.packages}
          onChange={(packages) => setP({ packages })}
          addLabel="Add package"
          makeNew={() => ({ id: 'new', name: 'Naya Plan', urdu: 'پلان', sub: 'Kis ke liye', badge: '', features: [], popular: false })}
          renderItem={(item, patch) => (
            <>
              <div className="af-row">
                <Field label="Name" value={item.name} onChange={(v) => patch({ name: v })} />
                <Field label="Urdu name" value={item.urdu} onChange={(v) => patch({ urdu: v })} />
              </div>
              <Field label="Subtitle" value={item.sub} onChange={(v) => patch({ sub: v })} />
              <div className="af-row">
                <Field label="Badge" value={item.badge} onChange={(v) => patch({ badge: v })} />
                <label className="af-check">
                  <input
                    type="checkbox"
                    checked={!!item.popular}
                    onChange={(e) => patch({ popular: e.target.checked })}
                  />
                  Popular (highlight)
                </label>
              </div>
              <StringListEditor
                label="Features"
                items={item.features}
                onChange={(features) => patch({ features })}
                addLabel="Add feature"
              />
            </>
          )}
        />
      </Section>
      <Section title="Included list">
        <StringListEditor
          label="Included items"
          items={p.includes}
          onChange={(includes) => setP({ includes })}
          addLabel="Add item"
        />
        <div className="af-row">
          <Field label="Note heading" value={p.noteHeading} onChange={(v) => setP({ noteHeading: v })} />
          <Field label="Note" value={p.note} onChange={(v) => setP({ note: v })} />
        </div>
      </Section>

      <Section title="Download section">
        <Field label="Eyebrow" value={d.eyebrow} onChange={(v) => setD({ eyebrow: v })} />
        <div className="af-row">
          <Field label="Title A" value={d.titleA} onChange={(v) => setD({ titleA: v })} />
          <Field label="Title B (highlight)" value={d.titleB} onChange={(v) => setD({ titleB: v })} />
        </div>
        <Area label="Lead" value={d.lead} onChange={(v) => setD({ lead: v })} rows={2} />
        <Field label="Button label" value={d.buttonLabel} onChange={(v) => setD({ buttonLabel: v })} />
        <Field label="Facts line (after version)" value={d.facts} onChange={(v) => setD({ facts: v })} />
      </Section>
      <Section title="System requirements">
        <Field label="Heading" value={d.requirementsTitle} onChange={(v) => setD({ requirementsTitle: v })} />
        <ArrayEditor<SystemRequirement>
          label="Requirements"
          items={d.requirements}
          onChange={(requirements) => setD({ requirements })}
          addLabel="Add requirement"
          makeNew={() => ({ label: 'OS', value: 'Windows 10 or 11' })}
          renderItem={(item, patch) => (
            <div className="af-row">
              <Field label="Label" value={item.label} onChange={(v) => patch({ label: v })} />
              <Field label="Value" value={item.value} onChange={(v) => patch({ value: v })} />
            </div>
          )}
        />
      </Section>
      <Section title="FAQ">
        <Field label="Heading" value={d.faqTitle} onChange={(v) => setD({ faqTitle: v })} />
        <ArrayEditor<FAQItem>
          label="Questions"
          items={d.faq}
          onChange={(faq) => setD({ faq })}
          addLabel="Add question"
          makeNew={() => ({ q: 'New question?', a: 'Answer yahan likhein.' })}
          renderItem={(item, patch) => (
            <>
              <Field label="Question" value={item.q} onChange={(v) => patch({ q: v })} />
              <Area label="Answer" value={item.a} onChange={(v) => patch({ a: v })} rows={2} />
            </>
          )}
        />
      </Section>
    </>
  );
}

function SocialEditor({ c, setC }: { c: SiteContent; setC: SetContent }) {
  const set = (patch: Partial<SiteContent>) => setC({ ...c, ...patch });
  return (
    <>
      <Section title="Stats">
        <ArrayEditor<Stat>
          label="Statistics"
          items={c.stats}
          onChange={(stats) => set({ stats })}
          addLabel="Add stat"
          makeNew={() => ({ value: 100, suffix: '+', label: 'New stat' })}
          renderItem={(item, patch) => (
            <>
              <div className="af-row">
                <Field label="Label" value={item.label} onChange={(v) => patch({ label: v })} />
                <Field label="Suffix" value={item.suffix} onChange={(v) => patch({ suffix: v })} />
              </div>
              <div className="af-row">
                <NumField label="Value" value={item.value} onChange={(v) => patch({ value: v })} />
                <NumField label="Decimals" value={item.decimals ?? 0} onChange={(v) => patch({ decimals: v })} />
              </div>
            </>
          )}
        />
      </Section>
      <Section title="Testimonials">
        <ArrayEditor<Testimonial>
          label="Quotes"
          items={c.testimonials}
          onChange={(testimonials) => set({ testimonials })}
          addLabel="Add testimonial"
          makeNew={() => ({ quote: 'Quote yahan likhein.', name: 'Naam', role: 'City · Shop' })}
          renderItem={(item, patch) => (
            <>
              <Area label="Quote" value={item.quote} onChange={(v) => patch({ quote: v })} rows={2} />
              <div className="af-row">
                <Field label="Name" value={item.name} onChange={(v) => patch({ name: v })} />
                <Field label="Role / shop" value={item.role} onChange={(v) => patch({ role: v })} />
              </div>
            </>
          )}
        />
      </Section>
      <Section title="Ticker strip">
        <StringListEditor
          label="Ticker items"
          items={c.ticker}
          onChange={(ticker) => set({ ticker })}
          addLabel="Add ticker item"
        />
      </Section>
    </>
  );
}

function UpdatesEditor({ c, setC }: { c: SiteContent; setC: SetContent }) {
  return (
    <>
      <Section title="Changelog (Updates section)">
        <p className="af-hint">
          Pehla item "Latest" ke tor par highlight hota hai. Naya release aane par naya item upar add karein.
        </p>
        <ArrayEditor<ChangelogEntry>
          label="Releases"
          items={c.changelog}
          onChange={(changelog) => setC({ ...c, changelog })}
          addLabel="Add release"
          makeNew={() => ({ version: '2.9.0', date: '2025-07-01', title: 'New release', notes: ['Kya naya hai'] })}
          renderItem={(item, patch) => (
            <>
              <div className="af-row">
                <Field label="Version" value={item.version} mono onChange={(v) => patch({ version: v })} />
                <Field label="Date (YYYY-MM-DD)" value={item.date} onChange={(v) => patch({ date: v })} />
              </div>
              <Field label="Title" value={item.title} onChange={(v) => patch({ title: v })} />
              <StringListEditor
                label="Notes"
                items={item.notes}
                onChange={(notes) => patch({ notes })}
                addLabel="Add note"
              />
            </>
          )}
        />
      </Section>
    </>
  );
}

/* ================= Editor shell ================= */

function Editor({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('general');
  const [content, setContent] = useState<SiteContent>(CONTENT);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [reqMsg, setReqMsg] = useState(`Site update${content.site.latestVersion ? ` · v${content.site.latestVersion}` : ''}`);

  const token = useMemo(() => sessionStorage.getItem(TOKEN_KEY) || '', []);

  const loadLive = async () => {
    setMessage('Live content load ho raha hai…');
    try {
      const res = await fetch(RAW_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`raw fetch ${res.status}`);
      const data = (await res.json()) as SiteContent;
      setContent(data);
      setLoaded(true);
      setMessage('Live content loaded ✓');
    } catch (err) {
      setLoaded(true);
      setMessage(`Live content nahi mila (${err instanceof Error ? err.message : 'error'}) — bundled content use ho raha hai.`);
    }
  };

  const publish = async () => {
    setBusy(true);
    setMessage('Publishing… (GitHub commit → Vercel deploy)');
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content, message: reqMsg }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        commitUrl?: string;
        error?: string;
        deploy?: {
          ok?: boolean;
          deployId?: string;
          deployUrl?: string;
          skipped?: boolean;
          reason?: string;
          error?: string;
        };
      };
      if (!res.ok || !data.ok) throw new Error(data.error || 'Publish failed');
      const deploy = data.deploy;
      let deployNote = '';
      if (deploy?.ok && deploy.skipped) deployNote = ' · Auto-build on (git connected)';
      else if (deploy?.ok && deploy.deployId) deployNote = ` · Deploy: ${deploy.deployUrl || deploy.deployId}`;
      else if (deploy && !deploy.ok) deployNote = ` · Deploy FAIL: ${deploy.error}`;
      setMessage(`Published ✓ — Commit: ${data.commitUrl || 'done'}${deployNote}`);
    } catch (err) {
      setMessage(`Publish nahi hua: ${err instanceof Error ? err.message : 'error'}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin">
      <div className="admin-shell">
        <aside className="admin-side">
          <div className="admin-brand">
            <span className="admin-brand-glyph">R</span>
            <div>
              <b>Rokar Admin</b>
              <span className="admin-ver">v{content.site.latestVersion}</span>
            </div>
          </div>
          <nav className="admin-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`admin-tab ${tab === t.id ? 'is-active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <button className="admin-logout" onClick={onLogout}>
            Log out
          </button>
          <a className="admin-view" href="/" target="_blank" rel="noreferrer">
            Deployed site dekhain →
          </a>
        </aside>

        <main className="admin-main">
          <header className="admin-topbar">
            <div>
              <h2>{TABS.find((t) => t.id === tab)?.label}</h2>
              <span className={`admin-status ${loaded ? 'is-loaded' : ''}`}>
                {loaded ? 'Live content loaded' : 'Loading live content…'}
              </span>
            </div>
            <div className="admin-top-actions">
              <button className="af-btn" onClick={loadLive} disabled={busy}>
                Reload live
              </button>
              <button className="af-btn af-btn--primary" onClick={publish} disabled={busy}>
                {busy ? 'Publishing…' : 'Publish & Deploy'}
              </button>
            </div>
          </header>

          {message && <p className={`admin-msg ${message.includes('Publish nahi') || message.includes('nahi mila') ? 'admin-msg--err' : ''}`}>{message}</p>}

          <div className="af-body">
            <div className="af-publish-note">
              <span>
                <b>Kaise chalta hai:</b> "Publish & Deploy" dabane par ye content GitHub par commit hota hai aur Vercel
                site foran dobara banata hai (site ~30 second me live ho jati hai). Har publish git history me saved rehta hai.
              </span>
              <textarea
                className="af-input"
                rows={1}
                value={reqMsg}
                onChange={(e) => setReqMsg(e.target.value)}
                placeholder="Commit message (optional)"
              />
            </div>

            {tab === 'general' && <GeneralEditor c={content} setC={setContent} />}
            {tab === 'features' && <FeaturesEditor c={content} setC={setContent} />}
            {tab === 'steps' && <StepsEditor c={content} setC={setContent} />}
            {tab === 'commerce' && <CommerceEditor c={content} setC={setContent} />}
            {tab === 'social' && <SocialEditor c={content} setC={setContent} />}
            {tab === 'updates' && <UpdatesEditor c={content} setC={setContent} />}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ================= Root ================= */

export default function Admin() {
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem(TOKEN_KEY));
  return authed ? (
    <Editor onLogout={() => { sessionStorage.removeItem(TOKEN_KEY); setAuthed(false); }} />
  ) : (
    <Login onDone={() => setAuthed(true)} />
  );
}