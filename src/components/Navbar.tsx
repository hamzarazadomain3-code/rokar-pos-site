import { motion, useScroll, useTransform } from 'framer-motion';
import { useState } from 'react';
import { NAV_LINKS, DOWNLOAD_URL } from '../content';
import Icon from './Icon';
import Logo from './Logo';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const bg = useTransform(
    scrollY,
    [0, 60],
    ['rgba(247,243,233,0.55)', 'rgba(247,243,233,0.92)'],
  );

  return (
    <motion.header className="nav" style={{ background: bg }}>
      <div className="container nav-inner">
        <a href="#top" className="nav-logo" aria-label="Rokar home">
          <Logo src="/logo.png" />
        </a>

        <nav className="nav-links" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <a className="btn btn-primary nav-cta" href={DOWNLOAD_URL}>
          <Icon name="download" size={18} />
          Download
        </a>

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
          <a className="btn btn-primary" href={DOWNLOAD_URL} onClick={() => setOpen(false)}>
            <Icon name="download" size={18} />
            Download for Windows
          </a>
        </div>
      )}
    </motion.header>
  );
}