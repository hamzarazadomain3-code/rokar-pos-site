import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Float, RoundedBox, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo, useRef, useState, useEffect } from 'react';

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

/* ---------------- POS screen texture ---------------- */

function salesTexture() {
  return makeTexture(1024, 640, (ctx) => {
    ctx.fillStyle = '#F7F3E9';
    ctx.fillRect(0, 0, 1024, 640);

    // header
    ctx.fillStyle = '#0B5D48';
    ctx.fillRect(0, 0, 1024, 70);
    ctx.fillStyle = '#F7F3E9';
    ctx.font = '700 34px Arial, sans-serif';
    ctx.fillText('ROKAR POS', 40, 46);
    ctx.textAlign = 'right';
    ctx.font = '600 20px Arial, sans-serif';
    ctx.fillStyle = '#7FD2B4';
    ctx.fillText('Bill #0042 · 10:42 AM', 984, 46);
    ctx.textAlign = 'left';

    // tab pills
    const tabs = ['Billing', 'Stock', 'Reports'];
    let tx = 40;
    for (const [i, t] of tabs.entries()) {
      ctx.fillStyle = i === 0 ? '#E8A33D' : 'rgba(11,93,72,0.10)';
      ctx.beginPath();
      ctx.roundRect(tx, 86, 150, 44, 12);
      ctx.fill();
      ctx.fillStyle = i === 0 ? '#073B2E' : '#16302B';
      ctx.font = '700 19px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t, tx + 75, 114);
      ctx.textAlign = 'left';
      tx += 166;
    }

    // left: product list
    const items: Array<[string, string, string]> = [
      ['Basmati Rice 5kg', 'x1', 'Rs 1,150'],
      ['Sugar 1kg', 'x2', 'Rs 330'],
      ['Oil Canola 2L', 'x1', 'Rs 890'],
      ['Doodh 500ml', 'x1', 'Rs 190'],
      ['Red Chilli 250g', 'x1', 'Rs 240'],
    ];
    let y = 164;
    ctx.font = '600 24px Arial, sans-serif';
    items.forEach(([name, qty, price]) => {
      ctx.fillStyle = '#16302B';
      ctx.fillText(name, 40, y);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#8A9A94';
      ctx.fillText(qty, 300, y);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#16302B';
      ctx.fillText(price, 420, y);
      ctx.textAlign = 'left';
      y += 46;
    });

    ctx.strokeStyle = '#D9CDB4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, y + 10);
    ctx.lineTo(420, y + 10);
    ctx.stroke();

    ctx.fillStyle = '#0B5D48';
    ctx.font = '700 26px Arial, sans-serif';
    ctx.fillText('Cash', 40, y + 56);
    ctx.textAlign = 'right';
    ctx.fillText('Rs 2,800', 420, y + 56);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#8A9A94';
    ctx.fillText('Change', 40, y + 88);
    ctx.textAlign = 'right';
    ctx.fillText('Rs 200', 420, y + 88);
    ctx.textAlign = 'left';

    // right: summary card
    const cx = 470;
    ctx.fillStyle = '#0B5D48';
    ctx.beginPath();
    ctx.roundRect(cx, 160, 330, 300, 20);
    ctx.fill();
    ctx.fillStyle = 'rgba(247,243,233,0.5)';
    ctx.font = '600 18px Arial, sans-serif';
    ctx.fillText('TODAY · TOTALS', cx + 28, 198);
    ctx.fillStyle = '#F7F3E9';
    ctx.font = '800 40px Arial, sans-serif';
    ctx.fillText('Rs 42,150', cx + 28, 244);
    ctx.font = '700 20px Arial, sans-serif';
    ctx.fillText('124 bills · 5 items avg', cx + 28, 280);

    ctx.strokeStyle = 'rgba(247,243,233,0.25)';
    ctx.beginPath();
    ctx.moveTo(cx + 28, 300);
    ctx.lineTo(cx + 302, 300);
    ctx.stroke();

    const chart = [22, 40, 30, 56, 48, 74, 62, 90, 80];
    const bx = cx + 28;
    const bw = 26;
    const maxV = 100;
    ctx.fillStyle = '#F0B95B';
    chart.forEach((v, i) => {
      const h = (v / maxV) * 96;
      ctx.beginPath();
      ctx.roundRect(bx + i * (bw + 6), 416 - h, bw, h, 6);
      ctx.fill();
    });

    // pay button
    ctx.fillStyle = '#E8A33D';
    ctx.beginPath();
    ctx.roundRect(cx + 28, 428, 302, 60, 16);
    ctx.fill();
    ctx.fillStyle = '#073B2E';
    ctx.font = '800 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAY & PRINT RECEIPT', cx + 179, 468);
    ctx.textAlign = 'left';
  });
}

function shuttleTexture() {
  return makeTexture(460, 170, (ctx) => {
    const top = { label: 'Udhaar', sub: 'Rs 2,150 baqi · 12 customers', bg: '#F4E1C1', fg: '#B26A10' };
    const bottom = { label: 'Khaata', sub: 'updated now', bg: '#0B5D48', fg: '#F7F3E9' };
    for (const [row, g] of [[0, top], [1, bottom]] as Array<[number, typeof top]>) {
      const cy = row === 0 ? 55 : 130;
      ctx.fillStyle = g.bg;
      ctx.beginPath();
      ctx.roundRect(24, cy - 30, 96, 60, 16);
      ctx.fill();
      ctx.fillStyle = g.fg;
      ctx.font = '800 28px Arial, sans-serif';
      ctx.fillText(g.label, 144, cy - 4);
      ctx.font = '600 20px Arial, sans-serif';
      ctx.fillText(g.sub, 144, cy + 24);
    }
  });
}

function stockTexture() {
  return makeTexture(460, 170, (ctx) => {
    const top = { label: 'Stock', sub: 'Audit OK · 1,284 items', bg: '#2E7D66', fg: '#FFFFFF' };
    const bottom = { label: 'Backup', sub: 'OneDrive · done 1m ago', bg: '#E8A33D', fg: '#073B2E' };
    for (const [row, g] of [[0, top], [1, bottom]] as Array<[number, typeof top]>) {
      const cy = row === 0 ? 55 : 130;
      ctx.fillStyle = g.bg;
      ctx.beginPath();
      ctx.roundRect(24, cy - 30, 96, 60, 16);
      ctx.fill();
      ctx.fillStyle = g.fg;
      ctx.font = '800 28px Arial, sans-serif';
      ctx.fillText(g.label, 144, cy - 4);
      ctx.font = '600 20px Arial, sans-serif';
      ctx.fillText(g.sub, 144, cy + 24);
    }
  });
}

function growthTexture() {
  return makeTexture(460, 300, (ctx) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(0, 0, 460, 300, 24);
    ctx.fill();
    ctx.fillStyle = '#7B8C86';
    ctx.font = '600 20px Arial, sans-serif';
    ctx.fillText('Monthly profit', 30, 44);
    ctx.fillStyle = '#073B2E';
    ctx.font = '800 42px Arial, sans-serif';
    ctx.fillText('Rs 1,84,300', 30, 96);
    ctx.fillStyle = '#15966F';
    ctx.font = '700 22px Arial, sans-serif';
    ctx.fillText('▲ +18% this month', 30, 128);

    const bars = [34, 46, 40, 62, 56, 78, 72, 96, 88, 112];
    const bw = 30;
    const base = 260;
    bars.forEach((v, i) => {
      ctx.fillStyle = i === bars.length - 1 ? '#E8A33D' : '#DCE8E3';
      ctx.beginPath();
      ctx.roundRect(30 + i * (bw + 12), base - v * 1.5, bw, v * 1.5, 8);
      ctx.fill();
    });
  });
}

function clockTexture() {
  return makeTexture(300, 170, (ctx) => {
    ctx.fillStyle = '#0B5D48';
    ctx.beginPath();
    ctx.roundRect(0, 0, 300, 170, 22);
    ctx.fill();
    ctx.fillStyle = 'rgba(247,243,233,0.5)';
    ctx.font = '600 17px Arial, sans-serif';
    ctx.fillText('SHIFT · CASH', 24, 42);
    ctx.fillStyle = '#F7F3E9';
    ctx.font = '800 46px Arial, sans-serif';
    ctx.fillText('10:42 AM', 24, 96);
    ctx.fillStyle = '#F0B95B';
    ctx.font = '700 20px Arial, sans-serif';
    ctx.fillText('Morning · Rs 14,200', 24, 132);
  });
}

/* ---------------- 3D pieces ---------------- */

type ChipProps = { position: [number, number, number]; rotation?: [number, number, number] };

function DataCard({
  position,
  texture,
  rotation,
  size = [4.6, 1.7],
}: ChipProps & { texture: THREE.Texture; size?: [number, number] }) {
  return (
    <Float speed={1.5} rotationIntensity={0.7} floatIntensity={1.5}>
      <mesh position={position} rotation={rotation}>
        <planeGeometry args={size} />
        <meshBasicMaterial map={texture} transparent />
      </mesh>
    </Float>
  );
}

function ScreenCard({ position, texture, rotation, size }: ChipProps & { texture: THREE.Texture; size: [number, number] }) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}

function Terminal() {
  const screen = useMemo(() => salesTexture(), []);
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.22) * 0.22 + state.pointer.x * 0.12;
    group.current.rotation.x = Math.sin(t * 0.16) * 0.05 - state.pointer.y * 0.06;
  });

  return (
    <group ref={group}>
      {/* screen */}
      <mesh position={[0, 0, 0.34]}>
        <planeGeometry args={[7.6, 4.75]} />
        <meshBasicMaterial map={screen} />
      </mesh>
      <RoundedBox args={[8.2, 5.35, 0.2]} radius={0.18} position={[0, 0, 0.28]}>
        <meshStandardMaterial color="#0C1A15" metalness={0.3} roughness={0.45} />
      </RoundedBox>
      {/* gold rim glow behind */}
      <mesh position={[0, 0, 0.14]}>
        <planeGeometry args={[8.6, 5.7]} />
        <meshBasicMaterial color="#E8A33D" transparent opacity={0.16} />
      </mesh>
      {/* stand */}
      <RoundedBox args={[0.5, 1.3, 0.5]} radius={0.06} position={[0, -3.4, -0.4]}>
        <meshStandardMaterial color="#16302B" metalness={0.35} roughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[3.6, 0.4, 2.6]} radius={0.12} position={[0, -4.1, -0.4]}>
        <meshStandardMaterial color="#10241E" roughness={0.5} />
      </RoundedBox>
      {/* base glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.18, -0.4]}>
        <ringGeometry args={[1.9, 2.7, 48]} />
        <meshBasicMaterial color="#F0B95B" transparent opacity={0.4} />
      </mesh>
      {/* floating keyboard */}
      <RoundedBox args={[2.6, 0.14, 1.1]} radius={0.05} position={[0, -2.1, 1.7]} rotation={[-0.25, 0, 0]}>
        <meshStandardMaterial color="#0C1A15" roughness={0.3} metalness={0.4} />
      </RoundedBox>
    </group>
  );
}

/* ---------------- scroll parallax rig ---------------- */

function Rig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!group.current) return;
    const y = typeof window !== 'undefined' ? window.scrollY : 0;
    const p = Math.min(1, y / (window.innerHeight || 1));
    group.current.position.y = p * -0.6;
    group.current.rotation.z = p * 0.06;
  });
  return <group ref={group}>{children}</group>;
}

function Scene() {
  const shuttle = useMemo(() => shuttleTexture(), []);
  const stock = useMemo(() => stockTexture(), []);
  const growth = useMemo(() => growthTexture(), []);
  const clock = useMemo(() => clockTexture(), []);

  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.6, 8.4], fov: 40 }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 8, 5]} intensity={1.05} />
      <directionalLight position={[-6, -2, 4]} intensity={0.4} color="#F0B95B" />
      <pointLight position={[-4, 3, -2]} intensity={14} color="#0E7A5D" />

      <Sparkles count={110} scale={[16, 10, 8]} size={2.6} speed={0.32} color="#F0B95B" opacity={0.65} />

      <Rig>
        <Float speed={1.8} rotationIntensity={0.28} floatIntensity={0.6}>
          <Terminal />
        </Float>

        <ScreenCard position={[-5.4, 1.6, 0.4]} texture={growth} size={[3.6, 2.35]} rotation={[0, 0.5, -0.12]} />
        <DataCard position={[5.5, 1.5, -0.4]} texture={shuttle} rotation={[0, -0.45, 0.1]} />
        <DataCard position={[-4.4, -2.2, -1]} texture={stock} rotation={[0, 0.4, 0.08]} />
        <DataCard position={[4.6, -1.9, -1.4]} texture={clock} size={[3, 1.7]} rotation={[0, -0.35, 0]} />

        <ContactShadows position={[0, -4.35, 0]} opacity={0.5} scale={16} blur={2.6} far={4.5} color="#04130E" />
      </Rig>
    </Canvas>
  );
}

/* ---------------- static fallback (mobile / reduced motion) ---------------- */

function StaticTerminal() {
  return (
    <svg viewBox="0 0 640 480" className="hero-static" aria-hidden="true">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0E7A5D" />
          <stop offset="1" stopColor="#0B5D48" />
        </linearGradient>
      </defs>
      <g filter="blur(38px)" opacity="0.35">
        <ellipse cx="320" cy="430" rx="260" ry="50" fill="#E8A33D" />
      </g>
      <rect x="40" y="30" width="560" height="360" rx="26" fill="url(#sg)" />
      <rect x="64" y="54" width="512" height="312" rx="14" fill="#F7F3E9" />
      <rect x="64" y="54" width="512" height="48" rx="14" fill="#0B5D48" />
      <text x="96" y="86" fill="#F7F3E9" fontFamily="Arial" fontWeight="700" fontSize="22">ROKAR POS</text>
      <g fill="#16302B" fontFamily="Arial" fontSize="17">
        <text x="86" y="146">Basmati Rice 5kg</text>
        <text x="324" y="146" textAnchor="end">Rs 1,150</text>
        <text x="86" y="182">Sugar 1kg</text>
        <text x="324" y="182" textAnchor="end">Rs 330</text>
        <text x="86" y="218">Oil Canola 2L</text>
        <text x="324" y="218" textAnchor="end">Rs 890</text>
      </g>
      <g fontFamily="Arial">
        <rect x="368" y="142" width="184" height="230" rx="16" fill="#0B5D48" />
        <text x="386" y="176" fill="rgba(247,243,233,.5)" fontSize="14">TODAY</text>
        <text x="386" y="212" fill="#F7F3E9" fontWeight="800" fontSize="30">Rs 42,150</text>
        <rect x="386" y="300" width="148" height="54" rx="14" fill="#F0B95B" />
        <text x="460" y="334" fill="#073B2E" fontWeight="800" fontSize="17" textAnchor="middle">PAY</text>
      </g>
      <line x1="86" y1="244" x2="340" y2="244" stroke="#D9CDB4" strokeWidth="2" />
      <g transform="translate(56 292)">
        <rect x="0" y="0" width="180" height="52" rx="26" fill="#E8A33D" />
        <circle cx="46" cy="26" r="10" fill="#073B2E" />
        <text x="94" y="32" fill="#073B2E" fontFamily="Arial" fontWeight="700" fontSize="15">Barcode scan</text>
      </g>
      <g transform="translate(260 292)">
        <rect x="0" y="0" width="180" height="52" rx="26" fill="#0B5D48" />
        <circle cx="46" cy="26" r="10" fill="#E8A33D" />
        <text x="94" y="32" fill="#F7F3E9" fontFamily="Arial" fontWeight="700" fontSize="15">Udhaar khata</text>
      </g>
    </svg>
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