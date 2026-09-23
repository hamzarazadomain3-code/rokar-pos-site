import { motion, useScroll, useTransform } from 'framer-motion';
import { useState } from 'react';
import { NAV_LINKS, DOWNLOAD_URL, CONTACT } from '../content';
import Icon from './Icon';
import Logo from './Logo';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const bg = useTransform(
    scrollY,
    [0, 50],
    ['rgba(4, 28, 21, 0.45)', 'rgba(4, 28, 21, 0.94)'],
  );
  const border = useTransform(
    scrollY,
    [0, 50],
    ['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.22)'],
  );

  return (
    <motion.header className="nav" style={{ background: bg, borderBottomColor: border }}>
      <div className="container nav-inner">
        <a href="#top" className="nav-logo" aria-label="Rokar POS Home">
          <Logo src="/logo.png" />
          <span className="nav-tag-badge">OFFLINE POS</span>
        </a>

        <nav className="nav-links" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <a
            className="btn btn-ghost nav-wa-btn"
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noreferrer"
            title="Chat on WhatsApp"
          >
            <Icon name="whatsapp" size={17} />
            <span>WhatsApp</span>
          </a>

          <a className="btn btn-primary nav-cta" href={DOWNLOAD_URL}>
            <Icon name="download" size={17} />
            <span>Download</span>
          </a>
        </div>

        <button
          className={`nav-burger ${open ? 'is-open' : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {open && (
        <div className="nav-mobile">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <div className="nav-mobile-btns">
            <a
              className="btn btn-accent"
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
            >
              <Icon name="whatsapp" size={18} />
              WhatsApp Help & Pricing
            </a>
            <a className="btn btn-primary" href={DOWNLOAD_URL} onClick={() => setOpen(false)}>
              <Icon name="download" size={18} />
              Download Free Trial
            </a>
          </div>
        </div>
      )}
    </motion.header>
  );
}