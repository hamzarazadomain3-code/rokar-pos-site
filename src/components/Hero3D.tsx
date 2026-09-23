import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useEffect, useMemo, useRef, useState } from 'react';

/* ---------------- texture helpers ---------------- */

function makeTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  draw(ctx);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.minFilter = THREE.LinearFilter;
  return t;
}

function screenTexture() {
  return makeTexture(1024, 640, (ctx) => {
    ctx.fillStyle = '#F7F3E9';
    ctx.fillRect(0, 0, 1024, 640);

    ctx.fillStyle = '#0B5D48';
    ctx.fillRect(0, 0, 1024, 84);
    ctx.fillStyle = '#F7F3E9';
    ctx.font = '700 44px Arial, sans-serif';
    ctx.fillText('ROKAR POS', 48, 56);
    ctx.fillStyle = '#7FD2B4';
    ctx.font = '600 26px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Bill #0042', 976, 56);
    ctx.textAlign = 'left';

    const items: Array<[string, string]> = [
      ['Basmati Rice 5kg', 'Rs 1,150'],
      ['Sugar 1kg', 'Rs 165'],
      ['Oil Canola 2L', 'Rs 890'],
      ['Doodh 500ml', 'Rs 190'],
    ];
    let y = 140;
    ctx.font = '600 30px Arial, sans-serif';
    items.forEach(([name, price]) => {
      ctx.fillStyle = '#16302B';
      ctx.fillText(name, 48, y);
      ctx.textAlign = 'right';
      ctx.fillText(price, 976, y);
      ctx.textAlign = 'left';
      y += 66;
    });

    ctx.strokeStyle = '#D9CDB4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(48, y + 8);
    ctx.lineTo(976, y + 8);
    ctx.stroke();
    ctx.fillStyle = '#0B5D48';
    ctx.font = '800 42px Arial, sans-serif';
    ctx.fillText('Total', 48, y + 74);
    ctx.textAlign = 'right';
    ctx.fillText('Rs 2,395', 976, y + 74);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#E8A33D';
    ctx.beginPath();
    ctx.roundRect(368, y + 46, 288, 74, 20);
    ctx.fill();
    ctx.fillStyle = '#073B2E';
    ctx.font = '800 32px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PRINT RECEIPT', 512, y + 96);
    ctx.textAlign = 'left';
  });
}

function pillTexture(groups: Array<{ label: string; sub: string; bg: string; fg: string }>) {
  const w = 460;
  const h = 170;
  return makeTexture(w, h, (ctx) => {
    const top = groups[0];
    const bottom = groups[1] ?? top;
    for (const [row, g] of [[0, top], [1, bottom]] as Array<[number, (typeof top) | null]>) {
      if (!g) continue;
      const cy = row === 0 ? 55 : 130;
      ctx.fillStyle = g.bg;
      ctx.beginPath();
      ctx.roundRect(24, cy - 30, 96, 60, 16);
      ctx.fill();
      ctx.fillStyle = g.fg;
      ctx.font = '800 30px Arial, sans-serif';
      ctx.fillText(g.label, 144, cy - 2);
      ctx.font = '600 22px Arial, sans-serif';
      ctx.fillText(g.sub, 144, cy + 26);
    }
  });
}

/* ---------------- 3D pieces ---------------- */

function BarcodeChip({ position }: { position: [number, number, number] }) {
  const tex = useMemo(
    () =>
      makeTexture(340, 160, (ctx) => {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(0, 0, 340, 160, 22);
        ctx.fill();
        ctx.fillStyle = '#16302B';
        let x = 22;
        ctx.save();
        for (let i = 0; i < 34; i++) {
          const bw = 3 + ((Math.random() * 9) | 0);
          ctx.fillRect(x, 28, bw, 104);
          x += bw + 4;
        }
        ctx.restore();
        ctx.font = '700 20px Arial, sans-serif';
        ctx.fillText('8692 1403 7752 08', 70, 148);
      }),
    [],
  );
  return (
    <Float speed={1.6} rotationIntensity={1.2} floatIntensity={1.8}>
      <mesh position={position}>
        <planeGeometry args={[3.5, 1.65]} />
        <meshBasicMaterial map={tex} transparent />
      </mesh>
    </Float>
  );
}

function UdhaarChip({ position }: { position: [number, number, number] }) {
  const tex = useMemo(
    () =>
      pillTexture([
        { label: 'Udhaar', sub: 'Rs 0 baqi · paid', bg: '#F4E1C1', fg: '#B26A10' },
        { label: 'Khaata', sub: 'updated', bg: '#0B5D48', fg: '#F7F3E9' },
      ]),
    [],
  );
  return (
    <Float speed={1.4} rotationIntensity={0.8} floatIntensity={1.4}>
      <mesh position={position}>
        <planeGeometry args={[4.6, 1.7]} />
        <meshBasicMaterial map={tex} transparent />
      </mesh>
    </Float>
  );
}

function StockChip({ position }: { position: [number, number, number] }) {
  const tex = useMemo(
    () =>
      pillTexture([
        { label: 'Stock', sub: 'Audit OK', bg: '#2E7D66', fg: '#FFFFFF' },
        { label: 'Backup', sub: 'OneDrive · done', bg: '#E8A33D', fg: '#073B2E' },
      ]),
    [],
  );
  return (
    <Float speed={1.8} rotationIntensity={0.6} floatIntensity={1.6}>
      <mesh position={position}>
        <planeGeometry args={[4.6, 1.7]} />
        <meshBasicMaterial map={tex} transparent />
      </mesh>
    </Float>
  );
}

function Terminal() {
  const screen = useMemo(() => screenTexture(), []);
  const group = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.18;
  });

  return (
    <group ref={group}>
      {/* screen + bezel */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[7.4, 4.63]} />
        <meshBasicMaterial map={screen} />
      </mesh>
      <RoundedBox args={[8.1, 5.3, 0.16]} radius={0.16} position={[0, 0, -0.02]}>
        <meshStandardMaterial color="#101C18" metalness={0.2} roughness={0.6} />
      </RoundedBox>
      {/* stand + base */}
      <RoundedBox args={[0.5, 1.1, 0.5]} radius={0.06} position={[0, -3.15, -0.9]}>
        <meshStandardMaterial color="#16302B" roughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[3.4, 0.4, 2.4]} radius={0.12} position={[0, -3.9, -0.9]}>
        <meshStandardMaterial color="#10241E" roughness={0.5} />
      </RoundedBox>
      {/* base glow ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.99, -0.9]}>
        <ringGeometry args={[1.7, 2.5, 48]} />
        <meshBasicMaterial color="#E8A33D" transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

/* ---------------- static fallback (mobile / reduced motion) ---------------- */

function StaticTerminal() {
  return (
    <svg viewBox="0 0 640 460" className="hero-static" aria-hidden="true">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0E7A5D" />
          <stop offset="1" stopColor="#0B5D48" />
        </linearGradient>
      </defs>
      <g filter="blur(38px)" opacity="0.35">
        <ellipse cx="320" cy="400" rx="260" ry="50" fill="#E8A33D" />
      </g>
      <rect x="60" y="30" width="520" height="330" rx="26" fill="url(#sg)" />
      <rect x="82" y="52" width="476" height="286" rx="14" fill="#F7F3E9" />
      <rect x="82" y="52" width="476" height="46" rx="14" fill="#0B5D48" />
      <text x="112" y="84" fill="#F7F3E9" fontFamily="Arial" fontWeight="700" fontSize="22">
        ROKAR POS
      </text>
      <g fill="#16302B" fontFamily="Arial" fontSize="17">
        <text x="104" y="140">Basmati Rice 5kg</text>
        <text x="520" y="140" textAnchor="end">Rs 1,150</text>
        <text x="104" y="176">Sugar 1kg</text>
        <text x="520" y="176" textAnchor="end">Rs 165</text>
        <text x="104" y="212">Oil Canola 2L</text>
        <text x="520" y="212" textAnchor="end">Rs 890</text>
      </g>
      <line x1="104" y1="240" x2="536" y2="240" stroke="#D9CDB4" strokeWidth="2" />
      <g fontFamily="Arial">
        <rect x="350" y="262" width="190" height="52" rx="14" fill="#E8A33D" />
        <text x="445" y="296" fill="#073B2E" fontWeight="800" fontSize="19" textAnchor="middle">
          PRINT RECEIPT
        </text>
        <text x="104" y="296" fill="#0B5D48" fontWeight="800" fontSize="20">Total</text>
        <text x="534" y="296" fill="#0B5D48" fontWeight="800" fontSize="20" textAnchor="end">
          Rs 2,395
        </text>
      </g>
      <g transform="translate(96 300)">
        <rect x="0" y="0" width="170" height="54" rx="27" fill="#E8A33D" />
        <circle cx="48" cy="27" r="10" fill="#073B2E" />
        <text x="98" y="34" fill="#073B2E" fontFamily="Arial" fontWeight="700" fontSize="16">
          Barcode scan
        </text>
      </g>
      <g transform="translate(286 300)">
        <rect x="0" y="0" width="170" height="54" rx="27" fill="#0B5D48" />
        <circle cx="48" cy="27" r="10" fill="#E8A33D" />
        <text x="98" y="34" fill="#F7F3E9" fontFamily="Arial" fontWeight="700" fontSize="16">
          Udhaar khata
        </text>
      </g>
      <g transform="translate(320 80)" opacity="0.9">
        <rect x="0" y="0" width="110" height="34" rx="17" fill="#E8A33D" />
        <text x="55" y="22" fill="#073B2E" fontFamily="Arial" fontWeight="700" fontSize="14" textAnchor="middle">
          Stock OK
        </text>
      </g>
    </svg>
  );
}

/* ---------------- canvas scene (desktop + motion OK) ---------------- */

function Scene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.7, 7.4], fov: 42 }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} />
      <directionalLight position={[-6, -2, 4]} intensity={0.5} color="#E8A33D" />
      <Sparkles count={70} scale={[14, 9, 8]} size={2.4} speed={0.35} color="#F0B95B" opacity={0.7} />
      <Float speed={2} rotationIntensity={0.35} floatIntensity={0.7}>
        <Terminal />
      </Float>
      <BarcodeChip position={[-4.6, 1.9, 0.4]} />
      <UdhaarChip position={[4.8, 1.2, -0.6]} />
      <StockChip position={[-4.2, -1.9, -1.2]} />
    </Canvas>
  );
}

/* ---------------- default export with mount guard ---------------- */

export default function Hero3D() {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setOk(mq.matches && !reduced.matches);
    update();
    mq.addEventListener('change', update);
    reduced.addEventListener('change', update);
    return () => {
      mq.removeEventListener('change', update);
      reduced.removeEventListener('change', update);
    };
  }, []);

  return (
    <div className="hero3d" aria-hidden="true">
      {ok ? <Scene /> : <StaticTerminal />}
    </div>
  );
}