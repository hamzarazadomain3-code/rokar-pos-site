import { NAV_LINKS, DOWNLOAD_URL, FOOTER, CONTACT } from '../content';
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
            <span className="urdu font-urdu-tagline">{FOOTER.taglineUrdu}</span>
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
        </div>

        <div className="footer-col">
          <h4>{FOOTER.supportTitle}</h4>
          <a href={`tel:${CONTACT.phoneTel}`} className="footer-contact">
            <Icon name="phone" size={16} /> {CONTACT.phone}
          </a>
          <a href={`mailto:${CONTACT.email}`} className="footer-contact">
            <Icon name="mail" size={16} /> {CONTACT.email}
          </a>
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="footer-contact footer-wa-highlight"
          >
            <Icon name="whatsapp" size={16} /> WhatsApp Live Chat
          </a>
          <span className="footer-contact footer-muted">Mon&ndash;Sat &nbsp;|&nbsp; 9am &ndash; 9pm</span>
          <span className="footer-contact footer-muted">Remote Setup via AnyDesk / TeamViewer</span>
        </div>
      </div>

      <div className="container footer-end">
        <span>
          © {YEAR} {FOOTER.rights}
        </span>
        <span className="footer-tiny">Made for the shopkeepers of Pakistan &mdash; 100% local data, always private.</span>
      </div>
    </footer>
  );
}