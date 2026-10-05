export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  tags: string[];
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'udhaar-khata-management-guide',
    title: 'Udhaar Khata Kaise Manage Karein ??? Complete Guide for Pakistani Shopkeepers',
    excerpt: 'Learn how to properly manage customer credit (udhaar) using digital tools. Stop losing money to forgotten debts and streamline your collections.',
    category: 'Business Management',
    readTime: '8 min',
    publishedAt: '2026-09-15',
    updatedAt: '2026-09-15',
    author: 'Rokar POS Team',
    tags: ['udhaar', 'khata', 'credit management', 'collections', 'small business'],
    content: `
<h2>Introduction: The Udhaar Problem</h2>
<p>Every shopkeeper in Pakistan knows the pain of <strong>udhaar (credit/khata)</strong>. Customers promise to pay "next week" or "after Eid" ??? but weeks turn into months, and suddenly you're looking at lakhs in unpaid dues. Paper registers get lost, pages tear, and you can never quickly answer "kitna baqi hai?"</p>

<p>This guide shows you how to move from paper-based chaos to a digital system that <strong>never forgets</strong>, sends <strong>automatic WhatsApp reminders</strong>, and gives you the <strong>exact outstanding amount</strong> in one click.</p>

<h2>Why Paper Registers Fail</h2>
<ul>
  <li><strong>No search:</strong> Finding one customer's history means flipping through pages</li>
  <li><strong>No limits:</strong> You can't stop a customer at their credit limit</li>
  <li><strong>No reminders:</strong> You forget to follow up; customers forget to pay</li>
  <li><strong>No ageing:</strong> You don't know which debts are 30/60/90+ days old</li>
  <li><strong>Easy to lose:</strong> Fire, water, or just misplaced = all data gone</li>
</ul>

<h2>Digital Udhaar Management: What Changes</h2>

<h3>1. Set Credit Limits Per Customer</h3>
<p>In Rokar POS, every customer gets a <code>credit_limit</code>. When they hit it, the system <strong>blocks new credit sales</strong> automatically. No more "accidentally" giving Rs 50,000 credit to someone who already owes Rs 80,000.</p>

<h3>2. One-Click WhatsApp Reminders</h3>
<p>From the customer ledger, tap the WhatsApp icon. The app generates a polite message with the exact amount, due date, and a payment link. Customer gets it instantly ??? no awkward calls needed.</p>

<h3>3. Ageing Report (30/60/90 Days)</h3>
<p>The dashboard shows a colour-coded ageing bucket:
<ul>
  <li><span style="color:green">Green (0-30 days)</span> ??? Current, just remind</li>
  <li><span style="color:orange">Orange (31-60 days)</span> ??? Follow up this week</li>
  <li><span style="color:red">Red (60+ days)</span> ??? Visit personally or escalate</li>
</ul>
</p>

<h3>4. Full History & Audit Trail</h3>
<p>Every credit limit change is logged: who changed it, when, old value, new value, and why. Perfect for resolving disputes with staff or family members.</p>

<h2>Step-by-Step: Setting Up Digital Udhaar in Rokar POS</h2>

<ol>
  <li><strong>Add Customer:</strong> Go to Customers ??? Add New ??? Enter name, phone, address</li>
  <li><strong>Set Credit Limit:</strong> Edit customer ??? Credit Limit ??? Enter max amount (e.g., 50,000)</li>
  <li><strong>Opening Balance:</strong> If migrating from paper, enter current outstanding as "Opening Balance"</li>
  <li><strong>Start Billing:</strong> When customer says "udhaar kar do", select "Credit" payment ??? System auto-checks limit</li>
  <li><strong>Collect Payment:</strong> Customer pays ??? Go to Customer ??? Receive Payment ??? WhatsApp receipt auto-sent</li>
  <li><strong>Weekly Review:</strong> Dashboard ??? Ageing Report ??? Filter by 60+ days ??? WhatsApp reminders or visit</li>
</ol>

<h2>Pro Tips from Pakistani Shopkeepers</h2>
<blockquote>
  "Main har haftay Friday ko ageing report check karta hoon. Jo 60+ days hain, unko Saturday visit karta hoon. 3 mahine mein Rs 2.3 lakh recover kiye." ??? Asif, Kirana Store, Lahore
</blockquote>

<blockquote>
  "WhatsApp reminder se 80% log khud pay kar dete hain. Call karne ki zarurat hi nahi padti." ??? Dr. Naveed, Medical Store, Faisalabad
</blockquote>

<h2>Common Mistakes to Avoid</h2>
<ul>
  <li><strong>No credit limit:</strong> "Unlimited trust" = unlimited losses</li>
  <li><strong>Not entering opening balances:</strong> Start clean or enter exact dues from day 1</li>
  <li><strong>Ignoring ageing report:</strong> The report is useless if you don't act on it</li>
  <li><strong>Accepting partial payments without recording:</strong> Every rupee must be in the system</li>
</ul>

<h2>Ready to Digitize Your Udhaar?</h2>
<p>Rokar POS gives you a <strong>15-day free trial</strong> with full udhaar features. No credit card. Setup takes 30 minutes. <a href="#download" style="color:var(--teal); font-weight:600">Download now ???</a></p>

<p><strong>Need help?</strong> WhatsApp us for free remote setup: <a href="https://wa.me/923001234567?text=Assalam%20o%20Alaikum%20Rokar%20POS%20team,%20mujhe%20udhaar%20khata%20setup%20chahiye" style="color:var(--teal); font-weight:600">Click to chat ???</a></p>
`
  },
  {
    slug: 'best-pos-software-pakistan-2026',
    title: 'Kirana Store Ke Liye Best Billing Software 2026 ??? Comparison & Buying Guide',
    excerpt: 'Confused between Rokar POS, cloud POS, and Excel? This guide compares all options for kirana stores, medical shops, and bakeries in Pakistan.',
    category: 'Buying Guide',
    readTime: '10 min',
    publishedAt: '2026-09-20',
    updatedAt: '2026-09-20',
    author: 'Rokar POS Team',
    tags: ['pos software', 'kirana', 'billing software', 'comparison', 'pakistan'],
    content: `
<h2>Choosing the Right POS for Your Kirana Store</h2>
<p>With dozens of options claiming to be "the best", how do you choose? This guide breaks down the <strong>real differences</strong> between Rokar POS, cloud-based POS, Excel, and manual registers ??? specifically for Pakistani kirana/medical/bakery shops.</</p>

<h2>Quick Comparison Table</h2>
<table>
  <thead>
    <tr><th>Factor</th><th>Rokar POS</th><th>Cloud POS</th><th>Excel</th><th>Manual Register</th></tr>
  </thead>
  <tbody>
    <tr><td>Internet Required</td><td>No (100% offline)</td><td>Yes (always)</td><td>No</td><td>No</td></tr>
    <tr><td>Udhaar/Khata</td><td>Built-in + limits + WhatsApp</td><td>Basic</td><td>Manual formulas</td><td>Paper</td></tr>
    <tr><td>Stock Audit</td><td>Real-time + barcode</td><td>Yes</td><td>Manual</td><td>Physical count</td></tr>
    <tr><td>Thermal Printing</td><td>58/80mm + A4</td><td>Yes (often extra)</td><td>???</td><td>???</td></tr>
    <tr><td>Monthly Cost</td><td>PKR 0 (one-time)</td><td>PKR 2,000-5,000/mo</td><td>Free</td><td>Free</td></tr>
    <tr><td>Data Privacy</td><td>Local only</td><td>Cloud server</td><td>Local file</td><td>Paper</td></tr>
    <tr><td>Load-shedding Proof</td><td>??? Full offline</td><td>??? Stops working</td><td>???</td><td>???</td></tr>
    <tr><td>Setup Time</td><td>30 min</td><td>Hours + training</td><td>Hours</td><td>Minutes</td></tr>
  </tbody>
</table>

<h2>Deep Dive: Why Rokar POS Wins for Pakistani Shops</h2>

<h3>1. True Offline-First Architecture</h3>
<p>Unlike cloud POS that becomes a "brick" during load-shedding or internet outages, Rokar POS runs entirely on your Windows PC. <strong>Billing, stock, reports, udhaar ??? everything works without a single byte of internet.</strong> Internet is only needed for cloud backup (optional) and licence verification.</p>

<h3>2. Built for Pakistan, Not Ported from Abroad</h3>
<ul>
  <li>Urdu + English interface (24 sidebar labels, 9 login strings in Urdu)</li>
  <li>Rupee formatting (lakhs/crores), Pakistani date formats</li>
  <li>Local thermal printer drivers (58mm/80mm) pre-configured</li>
  <li>WhatsApp integration with Pakistani number format</li>
  <li>BayLan weighing scale support</li>
</ul>

<h3>3. One-Time Payment, Not Rent</h3>
<p>Cloud POS charges PKR 2,000-5,000/month forever. That's PKR 24,000-60,000/year. Rokar POS is <strong>one-time purchase</strong> ??? pay once, use forever. Free updates included. No annual renewal.</p>

<h3>4. Real Udhaar Management (Not Just a Ledger)</h3>
<p>Most POS just show a balance. Rokar POS adds:
<ul>
  <li>Per-customer credit limits with hard blocks</li>
  <li>Ageing report (30/60/90 days) with colour coding</li>
  <li>WhatsApp payment reminders with 1 click</li>
  <li>Credit limit change audit trail</li>
</ul>
</p>

<h3>5. Free WhatsApp Setup Support</h3>
<p>We don't just sell software. Our team connects via AnyDesk/TeamViewer and sets up your products, printers, and udhaar limits ??? <strong>free</strong>. Most cloud POS charge PKR 5,000+ for setup.</p>

<h2>When to Choose What</h2>
<h3>Choose Rokar POS if:</h3>
<ul>
  <li>You want one-time payment, no monthly rent</li>
  <li>Load-shedding/internet issues are common in your area</li>
  <li>You need serious udhaar management with limits & reminders</li>
  <li>Data privacy matters (customer data stays on your PC)</li>
  <li>You use thermal printers (58mm/80mm) and barcode scanners</li>
</ul>

<h3>Choose Cloud POS if:</h3>
<ul>
  <li>You have multiple branches needing real-time central sync</li>
  <li>You have reliable 24/7 internet and backup power</li>
  <li>You're okay with monthly subscription forever</li>
</ul>

<h3>Stick with Excel/Register if:</h3>
<ul>
  <li>You have < 50 products and < 10 bills/day</li>
  <li>You don't do udhaar/credit sales</li>
  <li>You're not ready to invest in a PC + printer yet</li>
</ul>

<h2>Real Numbers from Pakistani Shopkeepers</h2>
<table>
  <thead><tr><th>Metric</th><th>Before Rokar</th><th>After Rokar</th></tr>
  </thead>
  <tbody>
    <tr><td>Avg billing time</td><td>45-60 seconds</td><td>3 seconds</td></tr>
    <tr><td>Udhaar recovery rate</td><td>~40%</td><td>~85%</td></tr>
    <tr><td>Monthly profit visibility</td><td>Guesswork</td><td>Daily net profit</td></tr>
    <tr><td>Stock audit time</td><td>4-6 hours</td><td>30 minutes</td></tr>
  </tbody>
</table>

<h2>Final Recommendation</h2>
<p>For 90% of Pakistani kirana, medical, and bakery shops: <strong>Rokar POS is the clear winner.</strong> One-time payment, true offline, built for Pakistan, free setup support.</p>

<p><strong>Try it free for 15 days:</strong> <a href="#download" style="color:var(--teal); font-weight:600">Download Rokar POS ???</a></p>
`
  },
  {
    slug: 'offline-vs-online-pos-pakistan',
    title: 'Offline POS vs Online POS ??? Pakistan Ke Liye Kya Behtar Hai?',
    excerpt: 'Load-shedding, internet outages, and data privacy ??? we break down the real trade-offs between offline and cloud POS for Pakistani businesses.',
    category: 'Technology',
    readTime: '7 min',
    publishedAt: '2026-09-25',
    updatedAt: '2026-09-25',
    author: 'Rokar POS Team',
    tags: ['offline pos', 'cloud pos', 'internet', 'load shedding', 'data privacy'],
    content: `
<h2>The Core Question</h2>
<p>"Should I get a cloud POS that needs internet, or an offline POS that runs on my PC?"</p>
<p>For Pakistani businesses, this isn't theoretical ??? it's about <strong>whether you can bill customers during load-shedding</strong>.</p>

<h2>What "Offline" Actually Means</h2>
<p><strong>True offline POS (Rokar POS):</strong> The database, billing engine, reports, udhaar, inventory ??? everything runs on your PC's SQLite database. Zero internet required for daily operations.</p>
<p><strong>Cloud POS with "offline mode":</strong> Usually means you can bill for a few hours, but data syncs later. If internet is down for hours (common in Pakistan), you hit limits: can't verify stock, can't process payments, can't access reports.</p>

<h2>Load-Shedding Reality in Pakistan</h2>
<table>
  <thead><tr><th>Scenario</th><th>Rokar POS (Offline)</th><th>Cloud POS</th></tr>
  </thead>
  <tbody>
    <tr><td>2-4 hour load-shedding</td><td>??? Full billing</td><td>?????? Limited/Offline mode</td></tr>
    <tr><td>8+ hour outage (storms/floods)</td><td>??? Full billing</td><td>??? Cannot bill</td></tr>
    <tr><td>Internet fluctuations</td><td>??? Unaffected</td><td>?????? Sync issues, errors</td></tr>
    <tr><td>Mobile data backup</td><td>Not needed</td><td>Required (extra cost)</td></tr>
  </tbody>
</table>

<h2>Data Privacy: Who Owns Your Customer Data?</h2>
<p><strong>Offline (Rokar POS):</strong> Your database file (<code>pos.db</code>) sits on your PC. Only you have it. No company, no cloud provider, no third party can access your customer names, phone numbers, udhaar amounts, or profit margins.</p>
<p><strong>Cloud POS:</strong> All data lives on their servers. You're trusting them with your entire business intelligence. If they get hacked, go bankrupt, or change terms ??? your data is at risk.</p>

<h2>Cost Over 3 Years</h2>
<table>
  <thead><tr><th>Cost</th><th>Rokar POS</th><th>Cloud POS (PKR 3,000/mo)</th></tr>
  </thead>
  <tbody>
    <tr><td>Year 1</td><td>One-time payment</td><td>PKR 36,000</td></tr>
    <tr><td>Year 2</td><td>Free updates</td><td>PKR 36,000</td></tr>
    <tr><td>Year 3</td><td>Free updates</td><td>PKR 36,000</td></tr>
    <tr><td><strong>Total</strong></td><td><strong>One-time</strong></td><td><strong>PKR 108,000+</strong></td></tr>
  </tbody>
</table>

<h2>When Cloud POS Makes Sense</h2>
<p>Only if you have <strong>multiple branches needing real-time central inventory sync</strong> AND <strong>reliable 24/7 internet with UPS/generator backup</strong>. Even then, hybrid (offline + periodic sync) is safer.</p>

<h2>Verdict for Pakistan</h2>
<p><strong>For 95% of Pakistani shops: Offline POS (Rokar POS) is the right choice.</strong></p>
<ul>
  <li>Load-shedding is a fact of life</li>
  <li>Internet reliability varies wildly</li>
  <li>Data privacy is critical for business secrets</li>
  <li>Monthly rent (cloud) vs one-time ownership (offline)</li>
</ul>

<p><strong>Try Rokar POS free for 15 days ??? no internet needed after install:</strong> <a href="#download" style="color:var(--teal); font-weight:600">Download ???</a></p>
`
  },
  {
    slug: 'barcode-scanner-setup-pos',
    title: 'Barcode Scanner Kaise Connect Karein POS Software Se ??? Step by Step',
    excerpt: 'Complete guide to connecting USB/Bluetooth barcode scanners to Rokar POS. Covers keyboard-wedge, serial, and wireless scanners.',
    category: 'Hardware',
    readTime: '6 min',
    publishedAt: '2026-10-01',
    updatedAt: '2026-10-01',
    author: 'Rokar POS Team',
    tags: ['barcode scanner', 'hardware', 'setup', 'usb', 'bluetooth'],
    content: `
<h2>Barcode Scanner Setup in 3 Steps</h2>
<p>Most barcode scanners work instantly with Rokar POS ??? no drivers, no config. Here's how to verify and troubleshoot.</p>

<h2>Step 1: Identify Your Scanner Type</h2>
<table>
  <thead><tr><th>Type</th><th>How It Works</th><th>Setup</th></tr>
  <tbody>
    <tr><td><strong>USB Keyboard-Wedge</strong> (Most common)</td><td>Acts like a keyboard ??? scans type into any text field</td><td>Plug in ??? Works instantly</td></tr>
    <tr><td><strong>Bluetooth Wireless</strong></td><td>Pairs with Windows ??? acts like keyboard</td><td>Pair in Windows Settings ??? Works</td></tr>
    <tr><td><strong>Serial (RS-232)</strong></td><td>Needs COM port driver</td><td>Install driver ??? Set COM port in POS</td></tr>
    <tr><td><strong>2D Imager / Camera</strong></td><td>Reads QR, DataMatrix, damaged codes</td><td>Usually keyboard-wedge USB</td></tr>
  </tbody>
</table>

<h2>Step 2: Test in Windows First</h2>
<ol>
  <li>Open Notepad</li>
  <li>Scan any barcode (product box, book ISBN)</li>
  <li>If numbers appear in Notepad ??? <strong>Scanner works!</strong></li>
  <li>If nothing appears ??? Check connection, drivers, or pair via Bluetooth</li>
</ol>

<h2>Step 3: Test in Rokar POS</h2>
<ol>
  <li>Open Rokar POS ??? Billing screen</li>
  <li>Click in the search/barcode field (or just start scanning ??? field auto-focuses)</li>
  <li>Scan a product barcode</li>
  <li>Product should appear in the bill instantly</li>
</ol>

<h2>Common Issues & Fixes</h2>
<h3>Scanner beeps but nothing appears</h3>
<ul>
  <li>Check if the billing search field is focused (press Tab or click it)</li>
  <li>Some scanners need "Enter" suffix ??? check scanner manual for "Add CR/LF"</li>
  <li>Try scanning into Notepad first to verify</li>
</ul>

<h3>Wrong numbers / extra characters</h3>
<ul>
  <li>Scanner may be sending prefix/suffix (e.g., "STX...ETX")</li>
  <li>Use scanner's config sheet to disable prefixes/suffixes</li>
  <li>Or set "Keyboard Wedge" mode only</li>
</ul>

<h3>Bluetooth scanner disconnects</h3>
<ul>
  <li>Windows Bluetooth power management turns it off to save battery</li>
  <li>Fix: Device Manager ??? Bluetooth ??? Properties ??? Power Management ??? Uncheck "Allow computer to turn off this device"</li>
</ul>

<h2>Recommended Scanners for Pakistan (2026)</h2>
<table>
  <thead><tr><th>Model</th><th>Type</th><th>Approx Price (PKR)</th><th>Best For</th></tr>
  </thead>
  <tbody>
    <tr><td>Honeywell Voyager 1450g</td><td>USB 1D</td><td>8,000-10,000</td><td>General retail, kirana</td></tr>
    <tr><td>Zebra DS2208</td><td>USB 1D/2D</td><td>12,000-15,000</td><td>Pharmacy (reads 2D codes)</td></tr>
    <tr><td>Netum NT-1228BW</td><td>Bluetooth 1D</td><td>4,500-6,000</td><td>Budget wireless</td></tr>
    <tr><td>Tera HW0002</td><td>Bluetooth 2D</td><td>7,000-9,000</td><td>Pharmacy wireless</td></tr>
    <tr><td>Syble XB-1800</td><td>USB 1D</td><td>3,500-4,500</td><td>Entry level</td></tr>
  </tbody>
</table>

<h2>BayLan Weighing Scale Integration</h2>
<p>For kirana/bakery shops using BayLan digital scales:
<ol>
  <li>Connect scale via RS-232 serial cable to PC</li>
  <li>In Rokar POS ??? Settings ??? Hardware ??? Enable "BayLan Scale"</li>
  <li>Set COM port (usually COM1-COM4)</li>
  <li>Test: Place weight on scale ??? PLU code auto-enters in billing</li>
</ol>
</p>

<h2>Need Help?</h2>
<p>Our team does <strong>free remote setup</strong> via AnyDesk. We'll configure your scanner, printer, and scale together.</p>
<p><a href="https://wa.me/923001234567?text=Assalam%20o%20Alaikum%20Rokar%20POS%20team,%20mujhe%20barcode%20scanner%20setup%20chahiye" style="color:var(--teal); font-weight:600">WhatsApp for Free Setup ???</a></p>
`
  },
  {
    slug: 'free-pos-software-pakistan-small-business',
    title: 'Small Business Ke Liye Free POS Software Pakistan ??? Reality Check',
    excerpt: 'Is "free POS" really free? We expose the hidden costs of free tiers, trials, and open-source POS for Pakistani small businesses.',
    category: 'Buying Guide',
    readTime: '8 min',
    publishedAt: '2026-10-05',
    updatedAt: '2026-10-05',
    author: 'Rokar POS Team',
    tags: ['free pos', 'small business', 'hidden costs', 'trials', 'pakistan'],
    content: `
<h2>"Free POS" ??? Too Good to Be True?</h2>
<p>Search "free POS software Pakistan" and you'll find dozens of options. But <strong>free usually means one of three things:</strong></p>

<h2>The Three Types of "Free"</h2>

<h3>1. Freemium Cloud POS (e.g., basic tier free, pay for features)</h3>
<ul>
  <li><strong>What's free:</strong> Basic billing, maybe 50 products</li>
  <li><strong>What costs:</strong> Udhaar, stock audit, multiple users, thermal printing, reports, API access</li>
  <li><strong>Real cost:</strong> PKR 2,000-5,000/month once you need real features</li>
  <li><strong>Trap:</strong> Your data is locked in their cloud ??? exporting is hard/impossible</li>
</ul>

<h3>2. Open Source POS (e.g., Odoo Community, UniCenta)</h3>
<ul>
  <li><strong>What's free:</strong> The code</li>
  <li><strong>Real cost:</strong> Server (PKR 5,000+/mo), developer (PKR 50,000+ setup), maintenance, security updates</li>
  <li><strong>Reality:</strong> You need a dedicated IT person. Not for small shops.</li>
</ul>

<h3>3. Genuine Free Trial (Rokar POS Model)</h3>
<ul>
  <li><strong>What's free:</strong> <strong>Everything</strong> ??? all features, unlimited products, udhaar, reports, printing</li>
  <li><strong>Duration:</strong> 15 days full access</li>
  <li><strong>After trial:</strong> One-time payment for lifetime licence</li>
  <li><strong>No lock-in:</strong> Your data stays in SQLite on your PC. Export to Excel anytime.</li>
</ul>

<h2>Hidden Costs of "Free" Cloud POS</h2>
<table>
  <thead><tr><th>Hidden Cost</th><th>Typical Price</th></tr>
  </thead>
  <tbody>
    <tr><td>Udhaar/Khata module</td><td>PKR 1,000-2,000/mo extra</td></tr>
    <tr><td>Thermal printer driver</td><td>PKR 500-1,000/mo extra</td></tr>
    <tr><td>Barcode label printing</td><td>PKR 1,000/mo extra</td></tr>
    <tr><td>Excel/PDF export</td><td>PKR 500-1,000/mo extra</td></tr>
    <tr><td>Multi-user/cashier</td><td>PKR 1,000-2,000/mo per user</td></tr>
    <tr><td>Data export/backup</td><td>Often blocked or paid</td></tr>
    <tr><td>SMS/WhatsApp integration</td><td>PKR 1,000-2,000/mo extra</td></tr>
  </tbody>
</table>

<h2>What You Actually Need (Checklist)</h2>
<p>A small shop in Pakistan needs:</p>
<ul>
  <li>??? Offline billing (load-shedding proof)</li>
  <li>??? Udhaar/khata with limits & WhatsApp reminders</li>
  <li>??? Thermal receipt printing (58mm/80mm)</li>
  <li>??? Barcode scanning</li>
  <li>??? Stock audit & low-stock alerts</li>
  <li>??? Daily profit report</li>
  <li>??? Excel export for accountant</li>
  <li>??? Data stays on YOUR PC</li>
  <li>??? No monthly rent</li>
</ul>

<h2>Rokar POS: The Honest "Free" Option</h2>
<p><strong>15-day free trial with EVERYTHING unlocked.</strong> No feature gates. No credit card. After trial, one-time payment for lifetime licence. Your data stays on your PC forever.</p>

<p><strong>Compare yourself:</strong></p>
<ul>
  <li>Download Rokar POS free trial ??? Use all features for 15 days</li>
  <li>Try a cloud POS free tier ??? Hit feature walls in 30 minutes</li>
  <li>Decide based on reality, not marketing</li>
</ul>

<p><strong>Start your honest free trial:</strong> <a href="#download" style="color:var(--teal); font-weight:600">Download Rokar POS ???</a></p>
`
  },
];

export const blogCategories = ['All', 'Business Management', 'Buying Guide', 'Technology', 'Hardware'];
