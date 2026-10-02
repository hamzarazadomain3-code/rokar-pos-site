import type { ReactNode } from 'react';

type Props = {
  src: string;
  alt?: string;
  className?: string;
  children?: ReactNode;
};

export default function Logo({ src, alt = 'Rokar POS logo', className, children }: Props) {
  return (
    <span className={className || ''} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      {src ? (
        <img
          src={src}
          // The wordmark is drawn at 40px, so a 2x asset covers every display
          // without shipping the 800px original.
          srcSet={src === '/logo.png' ? '/logo-80.png 80w, /logo-160.png 160w' : undefined}
          sizes="40px"
          alt={alt}
          width={40}
          height={40}
          loading="eager"
          decoding="async"
          style={{ borderRadius: 10, flex: '0 0 auto' }}
        />
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