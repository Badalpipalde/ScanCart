# ScanCart 🛒 — Smart Scan-and-Pay Self-Checkout

ScanCart is a production-quality, mobile-first scan-and-pay retail self-checkout MERN application. It eliminates queue friction in physical grocery and retail stores by empowering customers to scan barcodes directly using their smartphone cameras, manage a persistent shopping cart with live recalculated totals, check out via Razorpay (test/mock mode), and present a cryptographically signed QR receipt at the store exit gate for staff validation.

---

## 🌟 Key Architecture & Security Invariants

1. **Zero-Trust Calculations**:
   Client subtotals, tax rates, and prices are strictly untrusted. The backend recalculates item subtotals, taxes, and final totals from active database records during cart updates, order creation, and payment verification.
2. **Atomic Inventory Reservation**:
   When payment is verified, product stock is decremented atomically inside the order creation step using MongoDB conditional updates (`{ stock: { $gte: qty } }, { $inc: { stock: -qty } }`).
3. **Idempotent Payment Verification**:
   Payment verification prevents duplicate orders on retry or race conditions between client verification and gateway webhooks.
4. **Cryptographic Exit Receipt**:
   The QR receipt encodes an HMAC-SHA256 signature calculated from a server secret. The staff exit scanner validates the cryptographic signature against the backend and enforces a strict single-use exit policy (`exitStatus: 'verified'`). Duplicate presentation immediately returns an `ALREADY_VERIFIED` security alert.
5. **Anti-Slop Senior UI Design**:
   Crafted following high-contrast typography, warm neutral surfaces (`#FAF8F5` / `#121212`), deep forest green accent (`#1F6F54`), 44px+ mobile touch targets, non-blocking slide-up scan sheets, and high-contrast pure white receipt cards.

---

## 🏗️ Project Structure

```text
scancart/
├── client/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Button, Input, Badge, Skeleton, ToastContainer
│   │   │   ├── layout/           # AppLayout, MobileBottomNav, ProtectedRoute
│   │   │   ├── scanner/          # BarcodeScanner, ScanResultSheet
│   │   │   ├── cart/             # CartItemRow, CartOrderSummary
│   │   │   └── receipt/          # QRReceiptCard
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── api.ts            # Axios with auth & interceptors
│   │   │   └── formatters.ts     # Currency (₹ INR / $ USD) and dates
│   │   ├── pages/
│   │   │   ├── auth/             # LoginPage, RegisterPage
│   │   │   ├── customer/         # HomePage, ScannerPage, CartPage, ReceiptPage, OrdersPage
│   │   │   ├── staff/            # ExitVerificationPage (Exit Gate Scanner)
│   │   │   └── admin/            # ProductsAdminPage (Catalog Management)
│   │   ├── store/                # authStore, cartStore, uiStore (Zustand)
│   │   ├── styles/               # index.css (tokens, scan laser animation)
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── routes.tsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/               # db.ts (with auto in-memory fallback), env.ts, razorpay.ts
│   │   ├── controllers/          # auth, products, cart, payments, orders
│   │   ├── middleware/           # auth, role, validate, rateLimiter, errorHandler
│   │   ├── models/               # User, Product, Cart, Order
│   │   ├── routes/               # REST API endpoints (/api/v1)
│   │   ├── services/             # payment.service.ts, receipt.service.ts
│   │   ├── utils/                # calculatePricing.ts, apiError.ts, response.ts
│   │   ├── validators/           # Zod validation schemas
│   │   ├── seeds/                # seedProducts.ts (20 realistic supermarket products)
│   │   ├── tests/                # pricing.test.ts, receiptToken.test.ts, paymentVerify.test.ts
│   │   └── app.ts
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
├── package.json
└── README.md
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js `v18+` (tested on Node `v24.17.0`)
- npm `v9+`
- (Optional) MongoDB local or Atlas. If MongoDB is not installed locally, the server **automatically starts a built-in in-memory MongoDB server** out of the box!

### 2. Environment Setup
The server `.env` is pre-configured with default development secrets:

```bash
cd server
cp .env.example .env
```

### 3. Install Dependencies
```bash
# In the scancart/ directory:
npm run install:all
```

### 4. Seed the Database
Populates 20 realistic retail products with real barcodes and 3 default role accounts:

```bash
npm run seed
```

### 5. Run Unit Tests
```bash
npm run test:server
```
Runs 9 comprehensive unit tests covering zero-trust financial math, HMAC-SHA256 receipt token cryptography, and payment verification.

### 6. Start Development Servers
Open two terminal tabs:

**Terminal 1 (Backend API):**
```bash
npm run dev:server
# Server running at: http://localhost:5000 (Health check: http://localhost:5000/api/health)
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev:client
# Vite client running at: http://localhost:5173
```

---

## 👥 Default Test Accounts

The seeder creates 3 pre-configured accounts (Password for all: `Password123!`):

| Role | Email | Password | Primary Access |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@scancart.store` | `Password123!` | Store Catalog, Barcode Scanner, Cart, Razorpay Checkout, My Receipts |
| **Store Staff** | `staff@scancart.store` | `Password123!` | Exit Verification Gate (`/staff/exit-gate`) |
| **Admin** | `admin@scancart.store` | `Password123!` | Store Catalog Management (`/admin/products`), Exit Gate |

> **Pro Tip**: The Sign In screen has 1-click login buttons that autofill credentials for instant testing!

---

## 🏷️ Test Barcodes for Scanner

When testing on phone camera or laptop webcam, point the camera at any of these EAN-13 barcodes, or use the 1-click test chips below the scanner:

| Product Name | Category | Barcode (EAN-13) | Price | Tax % |
| :--- | :--- | :--- | :--- | :--- |
| **Organic Hass Avocados (Pack of 3)** | Fresh Produce | `8901030864215` | ₹180.00 | 0% |
| **Artisanal Sourdough Bread Loaf** | Bakery | `8901030864222` | ₹140.00 | 5% |
| **Almond Breeze Unsweetened Milk 1L** | Dairy & Plant Milk | `8901030864239` | ₹240.00 | 5% |
| **Single Origin Arabica Beans 250g** | Beverages | `8901030864246` | ₹490.00 | 5% |
| **Extra Virgin Olive Oil 500ml** | Pantry | `8901030864253` | ₹750.00 | 5% |
| **Organic Rolled Oats 1kg** | Breakfast | `8901030864260` | ₹195.00 | 5% |
| **70% Dark Chocolate Sea Salt 85g** | Confectionery | `8901030864277` | ₹160.00 | 18% |
| **San Pellegrino Mineral Water 750ml**| Beverages | `8901030864284` | ₹190.00 | 18% |
| **Greek Yogurt Low Fat 400g** | Dairy | `8901030864291` | ₹135.00 | 5% |
| **Raw Wildflower Honey 350g** | Pantry | `8901030864307` | ₹360.00 | 5% |

---

## 💳 End-to-End Test Payment & Verification Flow

1. **Log in as Customer**: Click "Customer" quick-login on `/login`.
2. **Scan Items**:
   - Go to `/scan`.
   - Point camera at a barcode, or click one of the quick test chips (e.g. `Avocados`, `Sourdough`).
   - Notice the scan beep, haptic buzz, and non-blocking slide-up sheet.
   - Click "Keep Scanning" or "View Cart".
3. **Cart & Live Recalculations**:
   - Navigate to `/cart`.
   - Adjust quantities or remove items. Subtotal, GST, and total recalculate dynamically.
4. **Checkout & Payment**:
   - Tap "Proceed to Pay".
   - The backend initiates Razorpay order in paise (`/api/v1/payments/create-order`).
   - The Razorpay checkout dialog opens (in test mode).
   - Upon completion, the server verifies the HMAC signature, updates product inventory atomically, clears the cart, and signs the receipt.
5. **Hero Moment: Cryptographic QR Receipt**:
   - The customer is redirected to `/orders/:id/receipt`.
   - A high-contrast monochrome QR code is displayed on a pure white receipt card.
6. **Exit Gate Validation**:
   - Switch to Staff account (`staff@scancart.store`) or open `/staff/exit-gate`.
   - The guard scans the customer's QR pass.
   - Result:
     - **First scan**: Cleared with green banner, timestamp, guard name, and full physical item checklist to verify against bag contents.
     - **Second scan**: Immediate security alert: `PASS ALREADY VERIFIED & EXITED` with audit timestamp and previous verifier's identity.

