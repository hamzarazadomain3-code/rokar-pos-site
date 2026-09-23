import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import { CONTACT } from '../content';

export default function WhatsAppFloat() {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="wa-float-container">
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="wa-float-tooltip"
            initial={{ opacity: 0, scale: 0.9, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 10 }}
            transition={{ duration: 0.18 }}
          >
            <div className="wa-tooltip-header">
              <span className="wa-status-dot" />
              <span>Rokar Support · Online</span>
            </div>
            <p>15-min free trial setup ya software demo ke liye rabta karein!</p>
          </motion.div>
        )}
      </AnimatePresence>

      <a
        href={CONTACT.whatsapp}
        target="_blank"
        rel="noreferrer"
        className="wa-float-btn"
        aria-label="Contact on WhatsApp"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span className="wa-online-pulse" />
        <Icon name="whatsapp" size={26} />
        <span className="wa-float-label">WhatsApp Support</span>
      </a>
    </div>
  );
}
