import { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon';
import ThermalReceiptModal from './ThermalReceiptModal';

interface DemoItem {
  id: string;
  name: string;
  category: string;
  price: number;
  barcode: string;
}

const CATALOG: DemoItem[] = [
  { id: '1', name: 'Basmati Rice 5kg', category: 'Grocery', price: 1150, barcode: '89640012301' },
  { id: '2', name: 'Habib Canola Oil 2L', category: 'Oil & Ghee', price: 890, barcode: '89640012302' },
  { id: '3', name: 'Cheeni / Sugar 1kg', category: 'Grocery', price: 160, barcode: '89640012303' },
  { id: '4', name: 'Olpers Milk 1L Tetra', category: 'Dairy', price: 280, barcode: '89640012304' },
  { id: '5', name: 'Tapal Danedar Tea 450g', category: 'Beverages', price: 680, barcode: '89640012305' },
  { id: '6', name: 'Atta Flour Chakki 10kg', category: 'Grocery', price: 1350, barcode: '89640012306' },
  { id: '7', name: 'Surf Excel 1kg Pouch', category: 'Household', price: 540, barcode: '89640012307' },
  { id: '8', name: 'Lipton Yellow Label 200g', category: 'Beverages', price: 390, barcode: '89640012308' },
];

export default function LiveBillingDemo() {
  const [cart, setCart] = useState<Array<{ item: DemoItem; qty: number }>>([
    { item: CATALOG[0], qty: 1 },
    { item: CATALOG[2], qty: 2 },
    { item: CATALOG[3], qty: 1 },
  ]);
  const [cashTendered, setCashTendered] = useState<number>(2000);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [barcodeScannedMsg, setBarcodeScannedMsg] = useState<string | null>(null);

  const addItem = (item: DemoItem) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.item.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { item, qty: 1 }];
    });

    setBarcodeScannedMsg(`Scanned: ${item.name}`);
    setTimeout(() => setBarcodeScannedMsg(null), 1800);
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((p) => {
          if (p.item.id === id) {
            const nextQty = p.qty + delta;
            return nextQty > 0 ? { ...p, qty: nextQty } : null;
          }
          return p;
        })
        .filter(Boolean) as Array<{ item: DemoItem; qty: number }>,
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((acc, c) => acc + c.item.price * c.qty, 0);
  const totalItems = cart.reduce((acc, c) => acc + c.qty, 0);
  const changeDue = Math.max(0, cashTendered - subtotal);

  const receiptModalItems = cart.map((c) => ({
    name: c.item.name,
    qty: c.qty,
    price: c.item.price * c.qty,
  }));

  const quickScanRandom = () => {
    const unadded = CATALOG.filter((ci) => !cart.some((p) => p.item.id === ci.id));
    const toAdd = unadded.length > 0 ? unadded[0] : CATALOG[Math.floor(Math.random() * CATALOG.length)];
    addItem(toAdd);
  };

  return (
    <div className="live-demo-card">
      {/* Demo Header */}
      <div className="demo-header">
        <div className="demo-badge-wrap">
          <span className="demo-live-dot" />
          <span className="demo-title">INTERACTIVE POS TERMINAL</span>
        </div>
        <div className="demo-hint">
          <span>Click any product below to simulate a real barcode scan</span>
        </div>
      </div>

      <div className="demo-layout">
        {/* Left Side: Product Selector Catalog */}
        <div className="demo-catalog">
          <div className="catalog-toolbar">
            <span className="catalog-label">Quick Scan Shelf:</span>
            <button className="btn-scan-sim" onClick={quickScanRandom}>
              <Icon name="zap" size={14} /> Barcode Scan Test
            </button>
          </div>

          <div className="catalog-grid">
            {CATALOG.map((item) => {
              const inCart = cart.find((c) => c.item.id === item.id);
              return (
                <button
                  key={item.id}
                  className={`catalog-item-btn ${inCart ? 'is-selected' : ''}`}
                  onClick={() => addItem(item)}
                >
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-cat">{item.category}</span>
                  </div>
                  <div className="item-price-tag">
                    <span>Rs {item.price.toLocaleString()}</span>
                    {inCart && <span className="item-qty-badge">x{inCart.qty}</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {barcodeScannedMsg && (
            <motion.div
              className="barcode-toast"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Icon name="check" size={16} /> {barcodeScannedMsg}
            </motion.div>
          )}
        </div>

        {/* Right Side: Active Bill Terminal */}
        <div className="demo-terminal">
          <div className="terminal-header">
            <div className="terminal-store">
              <b>ROKAR POS · v2.8</b>
              <span>Bill #1048 · Walk-in Counter</span>
            </div>
            <button className="terminal-clear" onClick={clearCart} title="Clear cart">
              Clear
            </button>
          </div>

          <div className="terminal-cart-list">
            {cart.length === 0 ? (
              <div className="terminal-empty">
                <Icon name="box" size={32} />
                <p>Cart khali hai. Bayein taraf se koi item select karein.</p>
              </div>
            ) : (
              <ul>
                {cart.map(({ item, qty }) => (
                  <li key={item.id} className="cart-row">
                    <div className="cart-row-main">
                      <span className="cart-item-name">{item.name}</span>
                      <span className="cart-item-rate">@ Rs {item.price.toLocaleString()}</span>
                    </div>

                    <div className="cart-qty-ctrl">
                      <button onClick={() => updateQty(item.id, -1)} aria-label="Decrease">
                        -
                      </button>
                      <span>{qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} aria-label="Increase">
                        +
                      </button>
                    </div>

                    <span className="cart-row-total">Rs {(item.price * qty).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Calculations footer */}
          <div className="terminal-calc">
            <div className="calc-row">
              <span>Items Total ({totalItems}):</span>
              <b>Rs {subtotal.toLocaleString()}</b>
            </div>

            <div className="calc-cash-row">
              <label>Cash Tendered:</label>
              <div className="cash-input-wrap">
                <span>Rs</span>
                <input
                  type="number"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(Number(e.target.value) || 0)}
                  step="500"
                />
              </div>
            </div>

            <div className="calc-row change-row">
              <span>Baqi Change:</span>
              <b className={changeDue > 0 ? 'text-accent' : ''}>Rs {changeDue.toLocaleString()}</b>
            </div>

            <div className="terminal-actions">
              <button
                className="btn btn-primary btn-block"
                onClick={() => setShowReceipt(true)}
                disabled={cart.length === 0}
              >
                <Icon name="printer" size={18} /> View & Print Receipt
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Thermal Receipt Modal */}
      <ThermalReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        items={receiptModalItems}
        total={subtotal}
        cashReceived={cashTendered}
        change={changeDue}
      />
    </div>
  );
}
