import { useRef } from 'react';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
};

export default function TiltCard({ children, className = '', max = 9, glare = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - py) * max;
    const ry = (px - 0.5) * max;
    el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`;
    if (glareRef.current) {
      glareRef.current.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.55), rgba(255,255,255,0) 55%)`;
      glareRef.current.style.opacity = '1';
    }
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
    if (glareRef.current) glareRef.current.style.opacity = '0';
  };

  return (
    <div
      ref={ref}
      className={`tilt ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transform: 'perspective(900px)', transformStyle: 'preserve-3d' }}
    >
      {children}
      {glare && <div ref={glareRef} className="tilt-glare" aria-hidden="true" />}
    </div>
  );
}