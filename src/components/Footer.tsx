import { NAV_LINKS, DOWNLOAD_URL } from '../content';
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
            <span className="urdu">اپنی دکان کا پورا حساب، ایک سکرین پر۔</span>
            <br />
            Billing, khata, stock aur reports — offline, kisi bhi Windows PC par.
          </p>
        </div>

        <div className="footer-col">
          <h4>Site</h4>
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
          <a href={DOWNLOAD_URL}>Download</a>
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          <a href="tel:+923001234567" className="footer-contact">
            <Icon name="phone" size={16} /> +92 300 1234567
          </a>
          <a href="mailto:support@rokarpos.pk" className="footer-contact">
            <Icon name="mail" size={16} /> support@rokarpos.pk
          </a>
          <span className="footer-contact footer-muted">Mon–Sat · 9am – 9pm</span>
        </div>
      </div>

      <div className="container footer-end">
        <span>© {YEAR} Rokar POS. All rights reserved.</span>
        <span className="footer-tiny">
          Made for the shopkeepers of Pakistan · 100% local data
        </span>
      </div>
    </footer>
  );
}