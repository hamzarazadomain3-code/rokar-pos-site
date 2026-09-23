import { NAV_LINKS, DOWNLOAD_URL, FOOTER, CONTACT } from '../content';
import Icon from './Icon';
import Logo from './Logo';

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer id="contact" className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo src="/logo.png" />
          <p>
            <span className="urdu">{FOOTER.taglineUrdu}</span>
            <br />
            {FOOTER.tagline}
          </p>
        </div>

        <div className="footer-col">
          <h4>{FOOTER.siteTitle}</h4>
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
          <a href={DOWNLOAD_URL}>Download</a>
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
            className="footer-contact"
          >
            <Icon name="whatsapp" size={16} /> WhatsApp
          </a>
          <span className="footer-contact footer-muted">{CONTACT.supportHours}</span>
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