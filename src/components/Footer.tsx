import { NAV_LINKS, DOWNLOAD_URL, RELEASES_PAGE, FOOTER, CONTACT, HAS_WHATSAPP, HAS_PHONE, HAS_EMAIL } from '../content';
import Icon from './Icon';
import Logo from './Logo';

const YEAR = new Date().getFullYear();

const CITIES = [
  'Lahore',
  'Karachi',
  'Rawalpindi',
  'Islamabad',
  'Faisalabad',
  'Multan',
  'Gujranwala',
  'Peshawar',
  'Quetta',
  'Sialkot',
];

export default function Footer() {
  return (
    <footer id="contact" className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo src="/logo.png" />
          <p>
            <span className="urdu font-urdu-tagline" lang="ur">
              {FOOTER.taglineUrdu}
            </span>
            <br />
            {FOOTER.tagline}
          </p>

          <div className="footer-cities">
            <span className="cities-label">Trusted across Pakistan:</span>
            <div className="cities-pills">
              {CITIES.map((c) => (
                <span key={c} className="city-pill">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-col">
          <h4>{FOOTER.siteTitle}</h4>
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
          <a href={DOWNLOAD_URL}>Download Installer</a>
          {RELEASES_PAGE && (
            <a href={RELEASES_PAGE} target="_blank" rel="noreferrer">
              All releases &amp; portable version
            </a>
          )}
        </div>

        <div className="footer-col">
          <h4>{FOOTER.supportTitle}</h4>
          {HAS_PHONE && (
            <a href={`tel:${CONTACT.phoneTel}`} className="footer-contact">
              <Icon name="phone" size={16} /> {CONTACT.phone}
            </a>
          )}
          {HAS_EMAIL && (
            <a href={`mailto:${CONTACT.email}`} className="footer-contact">
              <Icon name="mail" size={16} /> {CONTACT.email}
            </a>
          )}
          {HAS_WHATSAPP && (
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="footer-contact footer-wa-highlight"
            >
              <Icon name="whatsapp" size={16} /> WhatsApp Live Chat
            </a>
          )}
          {/* With no contact row configured, the download button is the only
              working action on the page -- point people at it instead of an
              empty column. */}
          {!HAS_PHONE && !HAS_EMAIL && !HAS_WHATSAPP && (
            <>
              <a href={DOWNLOAD_URL} className="footer-contact footer-wa-highlight">
                <Icon name="download" size={16} /> Download Rokar POS
              </a>
              <span className="footer-contact footer-muted">
                Download aur install free hai — koi card, koi signup nahi.
              </span>
            </>
          )}
          {CONTACT.supportHours && (
            <span className="footer-contact footer-muted">{CONTACT.supportHours}</span>
          )}
          <span className="footer-contact footer-muted">Remote Setup via AnyDesk / TeamViewer</span>
        </div>
      </div>

      <div className="container footer-end">
        <span>
          © {YEAR} {FOOTER.rights}
        </span>
        <span className="footer-tiny">{FOOTER.tiny}</span>
      </div>
    </footer>
  );
}