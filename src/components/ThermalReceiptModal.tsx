import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  items?: Array<{ name: string; qty: number; price: number }>;
  total?: number;
  cashReceived?: number;
  change?: number;
  billNo?: string;
}

export default function ThermalReceiptModal({
  isOpen,
  onClose,
  items = [
    { name: 'Basmati Rice Super Karnal 5kg', qty: 1, price: 1150 },
    { name: 'Habib Cooking Oil 2L Can', qty: 1, price: 890 },
    { name: 'Cheeni / Sugar Fine 2kg', qty: 2, price: 320 },
    { name: 'Olpers Milk 1 Litre Tetra', qty: 2, price: 560 },
    { name: 'Tapal Danedar Tea 450g', qty: 1, price: 680 },
  ],
  total = 3600,
  cashReceived = 4000,
  change = 400,
  billNo = 'RKR-004289',
}: ThermalReceiptModalProps) {
  if (!isOpen) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <AnimatePresence>
      <div className="receipt-overlay" onClick={onClose}>
        <motion.div
          className="receipt-modal-wrapper"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {/* Header Controls */}
          <div className="receipt-modal-bar">
            <div className="receipt-modal-title">
              <span className="receipt-live-badge">
                <span className="pulse-dot" /> LIVE THERMAL PREVIEW
              </span>
              <span>80mm Thermal Slip</span>
            </div>
            <button className="receipt-close-btn" onClick={onClose} aria-label="Close receipt">
              ✕
            </button>
          </div>

          {/* Thermal Paper Slip */}
          <div className="thermal-slip">
            <div className="receipt-zigzag top" />

            <div className="receipt-body">
              {/* Shop Header */}
              <div className="receipt-center">
                <h3 className="receipt-shop-name">AL-MADINA CASH & CARRY</h3>
                <p className="receipt-shop-urdu urdu">المدینہ کیش اینڈ کیری</p>
                <p className="receipt-shop-address">Main Market, Gulberg III, Lahore</p>
                <p className="receipt-shop-phone">Tel: 0300-1234567 / 042-3578912</p>
                <div className="receipt-divider-dashed" />
              </div>

              {/* Meta details */}
              <div className="receipt-meta-grid">
                <div>
                  <b>Bill No:</b> {billNo}
                </div>
                <div className="text-right">
                  <b>Date:</b> {dateStr}
                </div>
                <div>
                  <b>Cashier:</b> Hamza (Shift 1)
                </div>
                <div className="text-right">
                  <b>Time:</b> {timeStr}
                </div>
              </div>

              <div className="receipt-divider-solid" />

              {/* Items Table */}
              <table className="receipt-table">
                <thead>
                  <tr>
                    <th align="left">ITEM</th>
                    <th align="center">QTY</th>
                    <th align="right">RATE</th>
                    <th align="right">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="item-name">{it.name}</td>
                      <td align="center">{it.qty}</td>
                      <td align="right">{Math.round(it.price / it.qty).toLocaleString()}</td>
                      <td align="right" className="font-bold">
                        {it.price.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="receipt-divider-dashed" />

              {/* Totals */}
              <div className="receipt-totals">
                <div className="total-row">
                  <span>Gross Items ({items.reduce((acc, i) => acc + i.qty, 0)}):</span>
                  <span>Rs {total.toLocaleString()}</span>
                </div>
                <div className="total-row">
                  <span>Discount (0%):</span>
                  <span>Rs 0</span>
                </div>
                <div className="receipt-divider-solid" />
                <div className="total-row net-total">
                  <span>NET TOTAL:</span>
                  <b>Rs {total.toLocaleString()}</b>
                </div>
                <div className="receipt-divider-solid" />
                <div className="total-row">
                  <span>Cash Tendered:</span>
                  <b>Rs {cashReceived.toLocaleString()}</b>
                </div>
                <div className="total-row">
                  <span>Change Return:</span>
                  <b>Rs {change.toLocaleString()}</b>
                </div>
              </div>

              {/* Barcode & Footer */}
              <div className="receipt-footer">
                <div className="barcode-sim">
                  <div className="barcode-lines" />
                  <span className="barcode-num">*{billNo}*</span>
                </div>

                <p className="receipt-thanks urdu">آپ کی تشریف آوری کا بہت شکریہ!</p>
                <p className="receipt-terms">Exchange within 3 days with this bill.</p>
                <div className="receipt-rokar-tag">
                  <span>⚡ Powered by <strong>Rokar POS</strong> — Offline System</span>
                </div>
              </div>
            </div>

            <div className="receipt-zigzag bottom" />
          </div>

          {/* Action Footer */}
          <div className="receipt-actions">
            <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
              <Icon name="printer" size={16} /> Print Test Slip
            </button>
            <button className="btn btn-ghost-dark btn-sm" onClick={onClose}>
              Done Viewing
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
