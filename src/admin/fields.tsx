import type { ReactNode } from 'react';

type TextProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
};

export function Field({ label, value, onChange, placeholder, mono }: TextProps) {
  return (
    <label className="af-field">
      <span className="af-label">{label}</span>
      <input
        className={mono ? 'af-input af-mono' : 'af-input'}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function Area({ label, value, onChange, rows = 3 }: TextProps & { rows?: number }) {
  return (
    <label className="af-field">
      <span className="af-label">{label}</span>
      <textarea
        className="af-input af-area"
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function NumField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <label className="af-field af-field--sm">
      <span className="af-label">{label}</span>
      <input
        className="af-input"
        type="number"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

export function StringListEditor({
  label,
  items,
  onChange,
  addLabel,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel: string;
}) {
  const move = (i: number, dir: -1 | 1) => {
    const next = [...items];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="af-array">
      <div className="af-array-head">
        <span className="af-label">{label}</span>
        <span className="af-count">{items.length}</span>
      </div>
      {items.map((item, i) => (
        <div className="af-item af-string-item" key={i}>
          <input
            className="af-input"
            value={item}
            onChange={(e) => onChange(items.map((it, idx) => (idx === i ? e.target.value : it)))}
          />
          <div className="af-item-actions">
            <button type="button" className="af-mini" onClick={() => move(i, -1)} disabled={i === 0}>
              ↑
            </button>
            <button
              type="button"
              className="af-mini"
              onClick={() => move(i, 1)}
              disabled={i === items.length - 1}
            >
              ↓
            </button>
            <button
              type="button"
              className="af-mini af-mini--danger"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="af-add" onClick={() => onChange([...items, ''])}>
        + {addLabel}
      </button>
    </div>
  );
}

export function ArrayEditor<T>({
  label,
  items,
  onChange,
  renderItem,
  makeNew,
  addLabel,
}: {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, patch: (p: Partial<T>) => void, index: number) => ReactNode;
  makeNew: () => T;
  addLabel: string;
}) {
  const move = (i: number, dir: -1 | 1) => {
    const next = [...items];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const patch = (i: number) => (p: Partial<T>) => {
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...p } : it)));
  };

  return (
    <div className="af-array">
      <div className="af-array-head">
        <span className="af-label">{label}</span>
        <span className="af-count">{items.length}</span>
      </div>
      {items.map((item, i) => (
        <div className="af-item" key={i}>
          <div className="af-item-bar">
            <span className="af-item-idx">#{i + 1}</span>
            <div className="af-item-actions">
              <button type="button" className="af-mini" onClick={() => move(i, -1)} title="Move up" disabled={i === 0}>
                ↑
              </button>
              <button
                type="button"
                className="af-mini"
                onClick={() => move(i, 1)}
                title="Move down"
                disabled={i === items.length - 1}
              >
                ↓
              </button>
              <button type="button" className="af-mini af-mini--danger" onClick={() => remove(i)} title="Remove">
                ✕
              </button>
            </div>
          </div>
          {renderItem(item, patch(i), i)}
        </div>
      ))}
      <button type="button" className="af-add" onClick={() => onChange([...items, makeNew()])}>
        + {addLabel}
      </button>
    </div>
  );
}