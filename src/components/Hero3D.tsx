import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Float, RoundedBox, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo, useRef, useState, useEffect } from 'react';

/* ================================================================
   TEXTURE HELPERS
   ================================================================ */

function makeTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  draw(ctx);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 16;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  return t;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* ================================================================
   MAIN POS SCREEN TEXTURE — Ultra Premium
   ================================================================ */

function salesTexture() {
  return makeTexture(1200, 750, (ctx) => {
    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 750);
    bgGrad.addColorStop(0, '#F9F7F2');
    bgGrad.addColorStop(1, '#F2EDE3');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 750);

    // Top header bar — deep emerald
    const hdrGrad = ctx.createLinearGradient(0, 0, 1200, 80);
    hdrGrad.addColorStop(0, '#041c15');
    hdrGrad.addColorStop(0.5, '#083a2d');
    hdrGrad.addColorStop(1, '#041c15');
    ctx.fillStyle = hdrGrad;
    ctx.fillRect(0, 0, 1200, 80);

    // Header glow line
    ctx.fillStyle = 'rgba(16,185,129,0.5)';
    ctx.fillRect(0, 78, 1200, 2);

    // App name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.fillText('ROKAR POS', 36, 50);

    // Version badge
    roundRect(ctx, 220, 22, 100, 34, 8);
    ctx.fillStyle = 'rgba(16,185,129,0.25)';
    ctx.fill();
    ctx.fillStyle = '#34d399';
    ctx.font = '600 17px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('v2.8.0', 270, 43);
    ctx.textAlign = 'left';

    // Bill number + time on right
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '600 20px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Bill #0042  |  10:42 AM  |  Cashier: Ali', 1168, 48);
    ctx.textAlign = 'left';

    // Tab navigation
    const tabs = [
      { label: 'Billing', active: true },
      { label: 'Stock', active: false },
      { label: 'Udhaar', active: false },
      { label: 'Reports', active: false },
    ];
    let tx = 36;
    for (const tab of tabs) {
      const tw = 148;
      roundRect(ctx, tx, 92, tw, 46, 10);
      ctx.fillStyle = tab.active ? '#f59e0b' : 'rgba(8,58,45,0.1)';
      ctx.fill();
      ctx.fillStyle = tab.active ? '#041c15' : '#4e635c';
      ctx.font = `${tab.active ? '800' : '600'} 20px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(tab.label, tx + tw / 2, 122);
      ctx.textAlign = 'left';
      tx += tw + 12;
    }

    // LEFT PANEL — Item list (600px wide)
    // Search bar
    roundRect(ctx, 36, 152, 580, 50, 12);
    ctx.fillStyle = 'rgba(8,58,45,0.07)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(8,58,45,0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#4e635c';
    ctx.font = '500 20px Arial, sans-serif';
    ctx.fillText('Search by name or scan barcode...', 60, 182);

    // Column headers
    ctx.fillStyle = 'rgba(8,58,45,0.4)';
    ctx.font = '700 16px Arial, sans-serif';
    ctx.fillText('ITEM', 36, 228);
    ctx.textAlign = 'center';
    ctx.fillText('QTY', 420, 228);
    ctx.textAlign = 'right';
    ctx.fillText('PRICE', 616, 228);
    ctx.textAlign = 'left';

    ctx.strokeStyle = 'rgba(8,58,45,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(36, 236);
    ctx.lineTo(628, 236);
    ctx.stroke();

    // Product rows
    const items: Array<[string, string, string, boolean]> = [
      ['Basmati Rice Super 5kg', 'x1', 'Rs 1,150', false],
      ['Habib Canola Oil 2L', 'x1', 'Rs 890', true],
      ['Cheeni / Sugar 1kg', 'x2', 'Rs 320', false],
      ['Olpers Milk 1L Tetra', 'x2', 'Rs 560', false],
      ['Tapal Tea 450g', 'x1', 'Rs 680', false],
    ];

    let iy = 256;
    for (const [name, qty, price, highlight] of items) {
      if (highlight) {
        roundRect(ctx, 28, iy - 18, 608, 38, 8);
        ctx.fillStyle = 'rgba(245,158,11,0.1)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(245,158,11,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.fillStyle = '#091e17';
      ctx.font = '600 21px Arial, sans-serif';
      ctx.fillText(name, 44, iy + 6);
      ctx.textAlign = 'center';
      ctx.fillStyle = highlight ? '#d97706' : '#4e635c';
      ctx.fillText(qty, 420, iy + 6);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#083a2d';
      ctx.font = '700 21px Arial, sans-serif';
      ctx.fillText(price, 624, iy + 6);
      ctx.textAlign = 'left';
      iy += 46;
    }

    // Divider
    ctx.strokeStyle = 'rgba(8,58,45,0.15)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(36, iy + 6);
    ctx.lineTo(628, iy + 6);
    ctx.stroke();
    ctx.setLineDash([]);

    // Subtotal, cash, change rows
    const calcRows = [
      ['5 Items Total:', 'Rs 3,600', false],
      ['Discount (5%):', '- Rs 180', false],
      ['NET TOTAL:', 'Rs 3,420', true],
    ];
    iy += 26;
    for (const [label, value, bold] of calcRows) {
      ctx.fillStyle = bold ? '#041c15' : '#4e635c';
      ctx.font = `${bold ? '800' : '500'} ${bold ? 23 : 20}px Arial, sans-serif`;
      ctx.fillText(String(label), 44, iy);
      ctx.textAlign = 'right';
      ctx.fillStyle = bold ? '#10b981' : '#4e635c';
      ctx.fillText(String(value), 624, iy);
      ctx.textAlign = 'left';
      iy += 36;
    }

    // Cash received row
    ctx.fillStyle = '#4e635c';
    ctx.font = '500 20px Arial, sans-serif';
    ctx.fillText('Cash Received:', 44, iy + 8);
    roundRect(ctx, 200, iy - 10, 200, 34, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#041c15';
    ctx.font = '700 22px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Rs 4,000', 300, iy + 14);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#10b981';
    ctx.font = '700 22px Arial, sans-serif';
    ctx.fillText('Change: Rs 580', 624, iy + 8);
    ctx.textAlign = 'left';

    // Vertical divider between panels
    const grd = ctx.createLinearGradient(660, 90, 660, 700);
    grd.addColorStop(0, 'rgba(8,58,45,0)');
    grd.addColorStop(0.3, 'rgba(8,58,45,0.12)');
    grd.addColorStop(0.7, 'rgba(8,58,45,0.12)');
    grd.addColorStop(1, 'rgba(8,58,45,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(659, 90, 2, 620);

    // RIGHT PANEL — Summary + Chart (x=678 to 1168)
    const rx = 678;

    // TODAY'S TOTAL card
    const todayGrad = ctx.createLinearGradient(rx, 152, rx + 476, 152 + 180);
    todayGrad.addColorStop(0, '#041c15');
    todayGrad.addColorStop(1, '#083a2d');
    roundRect(ctx, rx, 152, 476, 180, 20);
    ctx.fillStyle = todayGrad;
    ctx.fill();

    // Emerald glow dot
    ctx.fillStyle = 'rgba(16,185,129,0.3)';
    roundRect(ctx, rx + 390, 168, 70, 26, 8);
    ctx.fill();
    ctx.fillStyle = '#34d399';
    ctx.font = '700 15px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LIVE', rx + 425, 185);
    ctx.textAlign = 'left';

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '600 18px Arial, sans-serif';
    ctx.fillText("TODAY'S SALES", rx + 24, 198);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px Arial, sans-serif';
    ctx.fillText('Rs 42,150', rx + 24, 256);

    // Mini stats row
    const miniStats = [
      ['124', 'Bills'],
      ['5.2', 'Avg Items'],
      ['18%', 'Margin'],
    ];
    let mx = rx + 24;
    for (const [val, lbl] of miniStats) {
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 22px Arial, sans-serif';
      ctx.fillText(val, mx, 298);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '600 16px Arial, sans-serif';
      ctx.fillText(lbl, mx, 318);
      mx += 140;
    }

    // Mini bar chart inside card
    const chart = [28, 42, 36, 58, 52, 76, 66, 92, 84, 62];
    const bx = rx + 310;
    const bw = 14;
    const maxV = 100;
    chart.forEach((v, i) => {
      const h = (v / maxV) * 70;
      roundRect(ctx, bx + i * (bw + 4), 340 - h, bw, h, 4);
      ctx.fillStyle = i === chart.length - 1 ? '#f59e0b' : 'rgba(16,185,129,0.5)';
      ctx.fill();
    });

    // Profit card
    roundRect(ctx, rx, 352, 226, 100, 16);
    ctx.fillStyle = 'rgba(16,185,129,0.12)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(16,185,129,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#4e635c';
    ctx.font = '600 17px Arial, sans-serif';
    ctx.fillText('Net Profit', rx + 20, 390);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.fillText('Rs 7,830', rx + 20, 425);
    ctx.fillStyle = '#10b981';
    ctx.font = '700 15px Arial, sans-serif';
    ctx.fillText('+18.6%', rx + 150, 390);

    // Udhaar card
    roundRect(ctx, rx + 246, 352, 226, 100, 16);
    ctx.fillStyle = 'rgba(245,158,11,0.1)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(245,158,11,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#4e635c';
    ctx.font = '600 17px Arial, sans-serif';
    ctx.fillText('Udhaar Baqi', rx + 266, 390);
    ctx.fillStyle = '#d97706';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.fillText('Rs 11,200', rx + 266, 425);
    ctx.fillStyle = '#d97706';
    ctx.font = '600 15px Arial, sans-serif';
    ctx.fillText('8 customers', rx + 266, 445);

    // Recent activity list
    ctx.fillStyle = '#4e635c';
    ctx.font = '700 17px Arial, sans-serif';
    ctx.fillText('RECENT BILLS', rx + 24, 484);

    const bills = [
      ['#0042 - Khalid Ahmed', '10:41 AM', 'Rs 3,420'],
      ['#0041 - Naseem Bibi', '10:38 AM', 'Rs 780'],
      ['#0040 - Tariq Sb', '10:32 AM', 'Rs 5,600'],
      ['#0039 - Walk-in', '10:27 AM', 'Rs 1,290'],
    ];
    let by = 510;
    for (const [name, time, amt] of bills) {
      ctx.fillStyle = '#091e17';
      ctx.font = '600 18px Arial, sans-serif';
      ctx.fillText(name, rx + 24, by);
      ctx.fillStyle = '#7b9189';
      ctx.font = '500 16px Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(time, rx + 280, by);
      ctx.fillStyle = '#083a2d';
      ctx.font = '700 18px Arial, sans-serif';
      ctx.fillText(amt, rx + 464, by);
      ctx.textAlign = 'left';

      ctx.strokeStyle = 'rgba(8,58,45,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rx + 24, by + 10);
      ctx.lineTo(rx + 464, by + 10);
      ctx.stroke();
      by += 38;
    }

    // Bottom action buttons
    // PAY button
    const payGrad = ctx.createLinearGradient(rx, 670, rx + 226, 720);
    payGrad.addColorStop(0, '#fbbf24');
    payGrad.addColorStop(1, '#f59e0b');
    roundRect(ctx, rx, 670, 226, 58, 14);
    ctx.fillStyle = payGrad;
    ctx.fill();
    ctx.fillStyle = '#041c15';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAY & PRINT', rx + 113, 706);
    ctx.textAlign = 'left';

    // WhatsApp receipt
    roundRect(ctx, rx + 246, 670, 226, 58, 14);
    ctx.fillStyle = '#083a2d';
    ctx.fill();
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WhatsApp Bill', rx + 359, 706);
    ctx.textAlign = 'left';

    // Bottom bar
    const botGrad = ctx.createLinearGradient(0, 718, 1200, 750);
    botGrad.addColorStop(0, '#041c15');
    botGrad.addColorStop(1, '#083a2d');
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, 718, 1200, 32);
    ctx.fillStyle = '#10b981';
    ctx.font = '600 15px Arial, sans-serif';
    ctx.fillText('ROKAR POS v2.8.0', 20, 740);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('Cloud backup: synced 2 min ago   |   Offline mode active', 1180, 740);
    ctx.textAlign = 'left';
  });
}

/* ================================================================
   FLOATING DATA CARDS
   ================================================================ */

function khataTexture() {
  return makeTexture(560, 200, (ctx) => {
    // Glass card bg
    const bg = ctx.createLinearGradient(0, 0, 560, 200);
    bg.addColorStop(0, '#041c15');
    bg.addColorStop(1, '#083a2d');
    roundRect(ctx, 0, 0, 560, 200, 24);
    ctx.fillStyle = bg;
    ctx.fill();

    // Accent top line
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(24, 0, 80, 4);

    // Icon circle
    roundRect(ctx, 24, 24, 60, 60, 16);
    ctx.fillStyle = 'rgba(245,158,11,0.2)';
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Rs', 54, 62);
    ctx.textAlign = 'left';

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '600 18px Arial, sans-serif';
    ctx.fillText('UDHAAR BALANCE', 100, 46);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px Arial, sans-serif';
    ctx.fillText('Rs 11,200', 100, 90);

    ctx.fillStyle = '#f59e0b';
    ctx.font = '700 18px Arial, sans-serif';
    ctx.fillText('8 customers pending', 100, 118);

    // Mini customer list
    const custs = [['Khalid Ahmed', 'Rs 4,200'], ['Tariq Sb', 'Rs 3,500']];
    let cy = 148;
    for (const [name, bal] of custs) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '600 17px Arial, sans-serif';
      ctx.fillText(name, 30, cy);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(bal, 530, cy);
      ctx.textAlign = 'left';
      cy += 28;
    }
  });
}

function stockTexture() {
  return makeTexture(560, 200, (ctx) => {
    roundRect(ctx, 0, 0, 560, 200, 24);
    ctx.fillStyle = '#0e5f49';
    ctx.fill();

    ctx.fillStyle = '#34d399';
    ctx.fillRect(24, 0, 80, 4);

    roundRect(ctx, 24, 24, 60, 60, 16);
    ctx.fillStyle = 'rgba(52,211,153,0.2)';
    ctx.fill();
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('OK', 54, 62);
    ctx.textAlign = 'left';

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '600 18px Arial, sans-serif';
    ctx.fillText('STOCK STATUS', 100, 46);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px Arial, sans-serif';
    ctx.fillText('1,284 Items', 100, 90);
    ctx.fillStyle = '#34d399';
    ctx.font = '700 18px Arial, sans-serif';
    ctx.fillText('Audit: All OK', 100, 118);

    const items = [['Basmati Rice', '24 bags', '#34d399'], ['Cooking Oil', '3 left', '#fbbf24']];
    let sy = 148;
    for (const [name, stock, color] of items) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '600 17px Arial, sans-serif';
      ctx.fillText(name, 30, sy);
      ctx.textAlign = 'right';
      ctx.fillStyle = color;
      ctx.fillText(stock, 530, sy);
      ctx.textAlign = 'left';
      sy += 28;
    }
  });
}

function profitTexture() {
  return makeTexture(560, 340, (ctx) => {
    roundRect(ctx, 0, 0, 560, 340, 24);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.fillStyle = 'rgba(8,58,45,0.06)';
    ctx.fillRect(0, 0, 560, 60);

    ctx.fillStyle = '#4e635c';
    ctx.font = '600 18px Arial, sans-serif';
    ctx.fillText('MONTHLY PROFIT', 24, 36);
    ctx.fillStyle = '#083a2d';
    ctx.font = 'bold 46px Arial, sans-serif';
    ctx.fillText('Rs 1,84,300', 24, 104);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText('+18% vs last month', 24, 136);

    // Bar chart
    const bars = [34, 46, 40, 62, 56, 78, 72, 96, 88, 112];
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
    const bw = 40;
    const base = 290;
    bars.forEach((v, i) => {
      const h = v * 1.4;
      const isLast = i === bars.length - 1;
      const bxPos = 24 + i * (bw + 14);

      if (isLast) {
        roundRect(ctx, bxPos, base - h, bw, h, 8);
        const barGrad = ctx.createLinearGradient(0, base - h, 0, base);
        barGrad.addColorStop(0, '#f59e0b');
        barGrad.addColorStop(1, '#fbbf24');
        ctx.fillStyle = barGrad;
        ctx.fill();
      } else {
        roundRect(ctx, bxPos, base - h, bw, h, 8);
        const barGrad = ctx.createLinearGradient(0, base - h, 0, base);
        barGrad.addColorStop(0, '#10b981');
        barGrad.addColorStop(1, '#dcf5ec');
        ctx.fillStyle = barGrad;
        ctx.fill();
      }

      ctx.fillStyle = isLast ? '#d97706' : '#7b9189';
      ctx.font = `${isLast ? '700' : '500'} 13px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(months[i], bxPos + bw / 2, base + 20);
      ctx.textAlign = 'left';
    });
  });
}

function clockTexture() {
  return makeTexture(380, 200, (ctx) => {
    const bg = ctx.createLinearGradient(0, 0, 380, 200);
    bg.addColorStop(0, '#041c15');
    bg.addColorStop(1, '#0e5f49');
    roundRect(ctx, 0, 0, 380, 200, 24);
    ctx.fillStyle = bg;
    ctx.fill();

    ctx.fillStyle = '#34d399';
    ctx.fillRect(24, 0, 60, 4);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '600 17px Arial, sans-serif';
    ctx.fillText('MORNING SHIFT', 24, 42);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px Arial, sans-serif';
    ctx.fillText('10:42 AM', 24, 104);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('Cash: Rs 14,200', 24, 138);

    // Progress bar
    roundRect(ctx, 24, 158, 332, 14, 7);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fill();
    roundRect(ctx, 24, 158, 220, 14, 7);
    const progGrad = ctx.createLinearGradient(24, 0, 356, 0);
    progGrad.addColorStop(0, '#10b981');
    progGrad.addColorStop(1, '#34d399');
    ctx.fillStyle = progGrad;
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '600 15px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('66% shift done', 356, 190);
    ctx.textAlign = 'left';
  });
}

/* ================================================================
   3D COMPONENTS
   ================================================================ */

function GlowOrb({ position, color, size = 0.6 }: { position: [number, number, number]; color: string; size?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.position.y = (position[1]) + Math.sin(clock.elapsedTime * 1.2) * 0.15;
    (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
      0.8 + Math.sin(clock.elapsedTime * 2.5) * 0.3;
  });
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.7} />
    </mesh>
  );
}

function FloatingCard({
  position,
  texture,
  rotation,
  size,
  speed = 1.5,
}: {
  position: [number, number, number];
  texture: THREE.Texture;
  rotation?: [number, number, number];
  size: [number, number];
  speed?: number;
}) {
  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1.2}>
      <group position={position} rotation={rotation}>
        {/* Card shadow/depth */}
        <mesh position={[0.05, -0.05, -0.02]}>
          <planeGeometry args={[size[0] + 0.1, size[1] + 0.1]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.25} />
        </mesh>
        {/* Card background */}
        <RoundedBox args={[size[0] + 0.12, size[1] + 0.12, 0.05]} radius={0.08} position={[0, 0, -0.01]}>
          <meshStandardMaterial color="#0a1a12" metalness={0.3} roughness={0.5} />
        </RoundedBox>
        {/* Texture face */}
        <mesh position={[0, 0, 0.04]}>
          <planeGeometry args={size} />
          <meshBasicMaterial map={texture} transparent />
        </mesh>
        {/* Emerald border glow */}
        <mesh position={[0, 0, -0.03]}>
          <planeGeometry args={[size[0] + 0.22, size[1] + 0.22]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.12} />
        </mesh>
      </group>
    </Float>
  );
}

function Terminal() {
  const screen = useMemo(() => salesTexture(), []);
  const group = useRef<THREE.Group>(null);
  const innerGroup = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.18) * 0.18 + state.pointer.x * 0.1;
    group.current.rotation.x = Math.sin(t * 0.13) * 0.04 - state.pointer.y * 0.05;

    if (innerGroup.current) {
      innerGroup.current.position.y = Math.sin(t * 0.5) * 0.04;
    }
  });

  return (
    <group ref={group}>
      {/* Monitor body */}
      <RoundedBox args={[9.2, 5.9, 0.22]} radius={0.22} position={[0, 0.2, 0]}>
        <meshStandardMaterial color="#060f0c" metalness={0.6} roughness={0.3} />
      </RoundedBox>

      {/* Bezel inner frame */}
      <RoundedBox args={[8.7, 5.4, 0.18]} radius={0.18} position={[0, 0.2, 0.02]}>
        <meshStandardMaterial color="#0a1a12" metalness={0.3} roughness={0.5} />
      </RoundedBox>

      {/* Screen */}
      <mesh position={[0, 0.2, 0.14]}>
        <planeGeometry args={[8.3, 5.08]} />
        <meshBasicMaterial map={screen} />
      </mesh>

      {/* Screen reflection overlay */}
      <mesh position={[0, 0.2, 0.15]}>
        <planeGeometry args={[8.3, 5.08]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.03} />
      </mesh>

      {/* Emerald rim glow */}
      <mesh position={[0, 0.2, -0.02]}>
        <planeGeometry args={[9.6, 6.3]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.18} />
      </mesh>

      {/* Gold corner accents */}
      {[[-4.3, 2.75], [4.3, 2.75], [-4.3, -2.35], [4.3, -2.35]].map(([cx, cy], i) => (
        <mesh key={i} position={[cx, cy + 0.2, 0.16]}>
          <circleGeometry args={[0.12, 16]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.8} />
        </mesh>
      ))}

      {/* Monitor neck */}
      <group ref={innerGroup}>
        <RoundedBox args={[0.55, 1.5, 0.45]} radius={0.08} position={[0, -3.25, -0.25]}>
          <meshStandardMaterial color="#0c1a15" metalness={0.5} roughness={0.4} />
        </RoundedBox>

        {/* Base */}
        <RoundedBox args={[4.2, 0.4, 2.8]} radius={0.15} position={[0, -4.05, -0.5]}>
          <meshStandardMaterial color="#080f0c" metalness={0.65} roughness={0.3} />
        </RoundedBox>

        {/* Base gold accent strip */}
        <mesh position={[0, -3.85, 0.9]}>
          <planeGeometry args={[3.8, 0.04]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.6} />
        </mesh>

        {/* Ground glow ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.28, -0.5]}>
          <ringGeometry args={[2.1, 3.2, 64]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.35} />
        </mesh>

        {/* Inner glow disc */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.26, -0.5]}>
          <circleGeometry args={[2.0, 64]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.08} />
        </mesh>
      </group>

      {/* Floating keyboard */}
      <RoundedBox args={[3.2, 0.12, 1.2]} radius={0.05} position={[0, -2.0, 2.0]} rotation={[-0.2, 0, 0]}>
        <meshStandardMaterial color="#0a1a12" roughness={0.25} metalness={0.5} />
      </RoundedBox>
      {/* Keyboard key rows */}
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((col) => (
          <mesh
            key={`${row}-${col}`}
            position={[-1.4 + col * 0.32, -1.93, 1.65 + row * 0.26]}
            rotation={[-0.2, 0, 0]}
          >
            <boxGeometry args={[0.26, 0.04, 0.2]} />
            <meshStandardMaterial color="#0d201a" roughness={0.3} metalness={0.3} />
          </mesh>
        )),
      )}

      {/* Thermal printer */}
      <group position={[3.2, -2.6, 1.5]}>
        <RoundedBox args={[1.8, 0.7, 1.2]} radius={0.08} position={[0, 0, 0]}>
          <meshStandardMaterial color="#0a1a12" metalness={0.4} roughness={0.4} />
        </RoundedBox>
        {/* Paper slot */}
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[1.2, 0.06, 0.06]} />
          <meshBasicMaterial color="#f0f0e8" />
        </mesh>
        {/* Green LED */}
        <GlowOrb position={[0.6, 0.3, 0.5]} color="#10b981" size={0.07} />
      </group>

      {/* Barcode scanner */}
      <group position={[-3.4, -2.8, 1.3]} rotation={[0.3, 0.4, 0]}>
        <RoundedBox args={[0.35, 1.4, 0.35]} radius={0.1} position={[0, 0, 0]}>
          <meshStandardMaterial color="#111c17" metalness={0.3} roughness={0.5} />
        </RoundedBox>
        <RoundedBox args={[0.6, 0.5, 0.6]} radius={0.08} position={[0, -1.0, 0]}>
          <meshStandardMaterial color="#0c1a15" metalness={0.3} roughness={0.5} />
        </RoundedBox>
        <mesh position={[0, 0.55, 0.16]}>
          <planeGeometry args={[0.25, 0.06]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.9} />
        </mesh>
      </group>
    </group>
  );
}

/* ================================================================
   SCROLL PARALLAX RIG
   ================================================================ */

function Rig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!group.current) return;
    const y = typeof window !== 'undefined' ? window.scrollY : 0;
    const p = Math.min(1, y / (window.innerHeight || 1));
    group.current.position.y = p * -0.8;
    group.current.rotation.z = p * 0.04;
  });
  return <group ref={group}>{children}</group>;
}

/* ================================================================
   ENVIRONMENT PARTICLES
   ================================================================ */

function FloatingParticles() {
  const points = useRef<THREE.Points>(null);
  const particleCount = 80;

  const positions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 22;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!points.current) return;
    points.current.rotation.y = clock.elapsedTime * 0.015;
    points.current.rotation.x = Math.sin(clock.elapsedTime * 0.01) * 0.05;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#10b981" size={0.04} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/* ================================================================
   MAIN SCENE
   ================================================================ */

function Scene() {
  const khata = useMemo(() => khataTexture(), []);
  const stock = useMemo(() => stockTexture(), []);
  const profit = useMemo(() => profitTexture(), []);
  const clock = useMemo(() => clockTexture(), []);

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0.4, 9.5], fov: 38 }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[6, 10, 6]} intensity={1.4} castShadow />
      <directionalLight position={[-8, -2, 4]} intensity={0.5} color="#f59e0b" />
      <pointLight position={[-5, 4, -2]} intensity={18} color="#10b981" />
      <pointLight position={[5, -3, 3]} intensity={12} color="#f59e0b" />
      <pointLight position={[0, 0, 5]} intensity={8} color="#34d399" />

      {/* Stars background */}
      <Stars radius={60} depth={50} count={800} factor={2} saturation={0} fade speed={0.5} />

      {/* Gold sparkles */}
      <Sparkles count={140} scale={[20, 14, 10]} size={2.8} speed={0.28} color="#fbbf24" opacity={0.55} />
      {/* Emerald sparkles */}
      <Sparkles count={60} scale={[16, 10, 6]} size={1.6} speed={0.4} color="#34d399" opacity={0.4} />

      <FloatingParticles />

      <Rig>
        {/* Main terminal */}
        <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.4}>
          <Terminal />
        </Float>

        {/* Floating data cards */}
        <FloatingCard
          position={[-6.2, 2.0, -0.5]}
          texture={profit}
          size={[4.4, 2.6]}
          rotation={[0, 0.52, -0.08]}
          speed={1.2}
        />
        <FloatingCard
          position={[6.4, 1.8, -0.6]}
          texture={khata}
          size={[4.4, 1.56]}
          rotation={[0, -0.48, 0.07]}
          speed={1.6}
        />
        <FloatingCard
          position={[-5.0, -2.4, -1.2]}
          texture={stock}
          size={[4.4, 1.56]}
          rotation={[0, 0.42, 0.06]}
          speed={1.8}
        />
        <FloatingCard
          position={[5.2, -2.2, -1.0]}
          texture={clock}
          size={[3.0, 1.56]}
          rotation={[0, -0.36, 0]}
          speed={1.4}
        />

        {/* Ambient glow orbs */}
        <GlowOrb position={[-3.0, 3.5, -3]} color="#10b981" size={0.5} />
        <GlowOrb position={[3.5, 3.2, -4]} color="#f59e0b" size={0.35} />
        <GlowOrb position={[-4.0, -3.5, -3]} color="#34d399" size={0.3} />
        <GlowOrb position={[4.5, -2.8, -3.5]} color="#fbbf24" size={0.28} />

        <ContactShadows
          position={[0, -4.6, 0]}
          opacity={0.6}
          scale={20}
          blur={3.5}
          far={5.5}
          color="#041c15"
        />
      </Rig>
    </Canvas>
  );
}

/* ================================================================
   STATIC FALLBACK (mobile / reduced motion)
   ================================================================ */

function StaticTerminal() {
  return (
    <svg viewBox="0 0 680 480" className="hero-static" aria-hidden="true">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#041c15" />
          <stop offset="1" stopColor="#083a2d" />
        </linearGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Glow halo */}
      <ellipse cx="340" cy="440" rx="280" ry="40" fill="#10b981" opacity="0.2" filter="url(#glow)" />

      {/* Monitor body */}
      <rect x="30" y="20" width="620" height="390" rx="22" fill="url(#sg)" />
      {/* Emerald rim */}
      <rect x="26" y="16" width="628" height="398" rx="24" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.4" />

      {/* Screen */}
      <rect x="54" y="42" width="572" height="344" rx="12" fill="#F9F7F2" />

      {/* Header */}
      <rect x="54" y="42" width="572" height="52" rx="12" fill="#041c15" />
      <rect x="54" y="82" width="572" height="12" fill="#041c15" />
      <text x="80" y="76" fill="white" fontFamily="Arial" fontWeight="800" fontSize="22">ROKAR POS</text>
      <text x="560" y="72" fill="rgba(255,255,255,0.5)" fontFamily="Arial" fontSize="14" textAnchor="end">Bill #0042 | 10:42 AM</text>

      {/* Tabs */}
      <rect x="68" y="102" width="110" height="32" rx="8" fill="#f59e0b" />
      <text x="123" y="122" fill="#041c15" fontFamily="Arial" fontWeight="700" fontSize="15" textAnchor="middle">Billing</text>
      <rect x="190" y="102" width="110" height="32" rx="8" fill="rgba(8,58,45,0.15)" />
      <text x="245" y="122" fill="#4e635c" fontFamily="Arial" fontSize="15" textAnchor="middle">Stock</text>
      <rect x="312" y="102" width="110" height="32" rx="8" fill="rgba(8,58,45,0.15)" />
      <text x="367" y="122" fill="#4e635c" fontFamily="Arial" fontSize="15" textAnchor="middle">Udhaar</text>

      {/* Item list */}
      <g fill="#091e17" fontFamily="Arial" fontSize="16">
        <text x="74" y="162">Basmati Rice 5kg</text>
        <text x="340" y="162" textAnchor="end" fill="#4e635c">x1</text>
        <text x="410" y="162" textAnchor="end">Rs 1,150</text>
        <text x="74" y="194">Cooking Oil 2L</text>
        <text x="340" y="194" textAnchor="end" fill="#4e635c">x1</text>
        <text x="410" y="194" textAnchor="end">Rs 890</text>
        <text x="74" y="226">Cheeni / Sugar 1kg</text>
        <text x="340" y="226" textAnchor="end" fill="#d97706">x2</text>
        <rect x="62" y="210" width="362" height="28" rx="6" fill="rgba(245,158,11,0.12)" />
        <text x="410" y="226" textAnchor="end">Rs 320</text>
      </g>

      <line x1="70" y1="244" x2="420" y2="244" stroke="#D9CDB4" strokeWidth="1.5" />
      <text x="74" y="272" fill="#091e17" fontFamily="Arial" fontWeight="800" fontSize="18">TOTAL: Rs 2,360</text>
      <text x="74" y="296" fill="#10b981" fontFamily="Arial" fontWeight="700" fontSize="15">Change: Rs 640</text>

      {/* Right summary panel */}
      <rect x="442" y="148" width="172" height="220" rx="16" fill="#041c15" />
      <text x="452" y="176" fill="rgba(255,255,255,0.4)" fontFamily="Arial" fontSize="13">TODAY</text>
      <text x="452" y="210" fill="white" fontFamily="Arial" fontWeight="800" fontSize="26">Rs 42,150</text>
      <text x="452" y="234" fill="#10b981" fontFamily="Arial" fontWeight="700" fontSize="14">+18% profit</text>
      <rect x="454" y="252" width="148" height="50" rx="12" fill="url(#gold)" />
      <text x="528" y="283" fill="#041c15" fontFamily="Arial" fontWeight="800" fontSize="16" textAnchor="middle">PAY & PRINT</text>
      <rect x="454" y="316" width="148" height="38" rx="12" fill="#083a2d" />
      <text x="528" y="340" fill="#34d399" fontFamily="Arial" fontWeight="700" fontSize="14" textAnchor="middle">WhatsApp Bill</text>

      {/* Bottom action row */}
      <rect x="54" y="336" width="186" height="46" rx="23" fill="url(#gold)" />
      <text x="147" y="365" fill="#041c15" fontFamily="Arial" fontWeight="700" fontSize="16" textAnchor="middle">Barcode Scan</text>
      <rect x="254" y="336" width="176" height="46" rx="23" fill="rgba(8,58,45,0.15)" />
      <text x="342" y="365" fill="#083a2d" fontFamily="Arial" fontWeight="700" fontSize="16" textAnchor="middle">Udhaar Khata</text>

      {/* Stand */}
      <rect x="305" y="412" width="70" height="22" rx="6" fill="#083a2d" />
      <rect x="245" y="432" width="190" height="18" rx="9" fill="#041c15" />
      {/* Stand glow */}
      <ellipse cx="340" cy="446" rx="100" ry="10" fill="#10b981" opacity="0.3" />
    </svg>
  );
}

/* ================================================================
   DEFAULT EXPORT
   ================================================================ */

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