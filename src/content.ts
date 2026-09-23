export const DOWNLOAD_URL =
  'https://github.com/hamzarazadomain3-code/pos-releases/releases/latest/download/RokarPOS-Setup-2.8.0.exe';

export const LATEST_VERSION = '2.8.0';

export const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#download', label: 'Download' },
];

export type Feature = {
  icon: string;
  title: string;
  desc: string;
  tag?: string;
};

export const FEATURES: Feature[] = [
  {
    icon: 'zap',
    title: 'Fast offline billing',
    desc: 'Bill a whole customer in seconds — barcode scan or 3-key search. No internet? No problem. Rokar works fully offline, always.',
    tag: 'Core',
  },
  {
    icon: 'book',
    title: 'Udhaar / Khata',
    desc: 'Credit sales, balance tracking, "kitna baqi hai" at a glance. Daily reminders keep your hisaab moving.',
  },
  {
    icon: 'box',
    title: 'Inventory & Stock Audit',
    desc: 'Real-time stock levels, low-stock warnings, and a full Stock Audit to match bin stock with the ledger.',
    tag: 'Core',
  },
  {
    icon: 'truck',
    title: 'Purchases & Suppliers',
    desc: 'Record purchase bills, supplier balances, and see agar koi dast mal ya items wapis — sab recorded.',
  },
  {
    icon: 'chart',
    title: 'Reports & Dashboard',
    desc: 'Today\u2019s sales, best-selling products, hourly trends, monthly P&L, target vs actual — exportable to Excel.',
  },
  {
    icon: 'clock',
    title: 'Multi-shift cash',
    desc: 'Separate shifts and cash management for morning and evening. Know exactly kis shift ne kitna banaya.',
  },
  {
    icon: 'users',
    title: 'Users & Roles',
    desc: 'Owner, Manager, Cashier — each with their own access. Cashier bills, owner sees everything.',
  },
  {
    icon: 'tag',
    title: 'Promotions & discounts',
    desc: 'Buy-one-get-one, percentage or flat discounts, and auto-discount rules applied at billing.',
  },
  {
    icon: 'cloud',
    title: 'Cloud backup',
    desc: 'Automatic daily backups to your own OneDrive or Google Drive. Your data, your copies.',
  },
  {
    icon: 'printer',
    title: 'Receipt + A4 invoices',
    desc: 'Thermal receipt printing for fast checkout and professional A4 invoices — fully customizable.',
    tag: 'Popular',
  },
  {
    icon: 'whatsapp',
    title: 'WhatsApp receipts',
    desc: 'Send the receipt straight to the customer\u2019s WhatsApp — no printer required.',
  },
  {
    icon: 'scale',
    title: 'Wholesale & Retail modes',
    desc: 'Retail price for walk-ins, wholesale rates for thok buyers — switch in one tap.',
  },
];

export type Step = {
  num: string;
  title: string;
  desc: string;
  urdu: string;
};

export const STEPS: Step[] = [
  {
    num: '01',
    title: 'Download & install',
    desc: 'Install Rokar on any Windows PC or laptop in under two minutes.',
    urdu: 'ڈاؤن لوڈ کریں اور انسٹال کریں',
  },
  {
    num: '02',
    title: 'Activate your license',
    desc: 'Enter your activation key once. No monthly logins, no internet needed to keep working.',
    urdu: 'لائسنس چالو کریں',
  },
  {
    num: '03',
    title: 'Add your products',
    desc: 'Add items with name, price, and barcode. Print your own barcode labels from Rokar.',
    urdu: 'اپنے پراڈکٹس شامل کریں',
  },
  {
    num: '04',
    title: 'Start billing',
    desc: 'Scan, bill, print the receipt. Track udhaar, stock, and profit from day one.',
    urdu: 'بلنگ شروع کریں',
  },
];

export const PRICING_INCLUDES = [
  'All features — billing, inventory, reports',
  'Thermal receipt & A4 invoice printing',
  'Udhaar/khata management',
  'Wholesale & retail pricing modes',
  'Automatic daily cloud backup',
  'WhatsApp receipt alerts',
  'Free updates & installer re-downloads',
  'Support in Urdu & English',
];

export const SYS_REQS = [
  'Windows 10 or 11 (64-bit)',
  '4 GB RAM',
  '3 GB free disk space',
  'Optional: USB or Bluetooth barcode scanner',
  'Optional: thermal receipt printer',
];

export const FAQ = [
  {
    q: 'Mujhe internet ki zaroorat hai?',
    a: 'Nahi — Rokar fully offline chalta hai. Billing, inventory aur reports sab local computer par save hote hain. Internet sirf optional cheezon ke liye hai, jaise WhatsApp receipt ya cloud backup.',
  },
  {
    q: 'Mera data safe hai?',
    a: 'Bilkul. Data aapke computer par rehta hai aur roz khud-ba-khud aapke OneDrive/Google Drive par backup hota hai.',
  },
  {
    q: 'Kya QR/thermal printer ya weighing scale ke saath chalta hai?',
    a: 'Haan — USB/BT barcode scanner, thermal receipt printer, A4 printer aur BayLan weighing scale sab supported hain.',
  },
  {
    q: 'Is PC par ek se zyada cashiers kaam kar sakte hain?',
    a: 'Haan, Owner / Manager / Cashier roles ke saath alag users aur shifts bana sakte hain.',
  },
];