import type { ReactNode } from 'react';

type Props = {
  src: string;
  alt?: string;
  className?: string;
  children?: ReactNode;
};

export default function Logo({ src, alt = 'Rokar', className, children }: Props) {
  return (
    <span className={className || ''} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      {src ? (
        <img src={src} alt={alt} width={40} height={40} style={{ borderRadius: 10, flex: '0 0 auto' }} />
      ) : (
        <span className="logo-glyph" aria-hidden="true">
          R
        </span>
      )}
      <span className="logo-word">
        Rokar <i>· POS</i>
      </span>
      {children}
    </span>
  );
}