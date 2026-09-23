import { TICKER } from '../content';
import Icon from './Icon';

export default function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="ticker-wrap" role="marquee" aria-label="Rokar features">
      <div className="ticker-track">
        {items.map((t, i) => (
          <span key={`${t}-${i}`} className="ticker-item">
            <Icon name="check" size={14} strokeWidth={2.6} />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}