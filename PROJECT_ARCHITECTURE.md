# Easy Approval - Compliance Automation Platform

## Project Architecture

### Stack
- **Framework:** Next.js 14 (App Router)
- **Database:** MongoDB with Mongoose
- **Deployment:** Vercel
- **File Storage:** Firebase Storage
- **Payments:** Razorpay
- **Auth:** JWT (Admin panel)

---

### Folder Structure

```
easyapproval/
├── app/
│   ├── api/                    # API Routes
│   │   ├── admin/             # Admin APIs (JWT protected)
│   │   │   ├── dashboard/
│   │   │   ├── login/
│   │   │   ├── orders/
│   │   │   ├── documents/review/
│   │   │   ├── services/
│   │   │   └── categories/
│   │   ├── categories/        # Public: list categories
│   │   ├── services/          # Public: list/get services
│   │   │   ├── [id]/
│   │   │   └── by-slug/[slug]/
│   │   ├── orders/            # Order CRUD
│   │   │   ├── create-payment/
│   │   │   ├── verify-payment/
│   │   │   ├── track/
│   │   │   └── [orderId]/
│   │   │       ├── invoice/
│   │   │       └── route
│   │   ├── upload/            # File upload to Cloudinary
│   │   └── webhooks/razorpay/  # Razorpay webhook
│   ├── admin/                 # Admin panel
│   │   ├── login/
│   │   ├── orders/
│   │   │   └── [id]/
│   │   ├── services/
│   │   └── categories/
│   ├── order/                 # Order flow
│   │   ├── page.tsx           # Service selection + cart
│   │   └── [id]/
│   │       ├── payment/
│   │       ├── documents/
│   │       └── upload/
│   ├── services/              # Service catalog
│   │   ├── page.tsx
│   │   └── [slug]/
│   ├── track/                 # Order tracking
│   └── ...
├── models/                    # Mongoose schemas
│   ├── Category.ts
│   ├── Service.ts
│   ├── Order.ts
│   ├── UploadedDocument.ts
│   ├── OrderActivityLog.ts
│   ├── Firm.ts
│   └── Admin.ts
├── lib/
│   ├── mongodb.ts
│   ├── jwt.ts
│   ├── order-utils.ts
│   ├── sanitize.ts
│   ├── validators.ts
│   ├── invoice-pdf.ts
│   └── utils.ts
├── scripts/
│   └── seed.ts
└── components/
```

---

### Database Collections

| Collection | Purpose |
|------------|---------|
| **categories** | Service categories (Startup, GST, Trademark, etc.) |
| **services** | Services with required documents schema |
| **orders** | Orders with payment/order status |
| **uploadeddocuments** | User-uploaded files per order |
| **orderactivitylogs** | Audit trail |
| **firms** | Multi-firm support (Phase 12) |
| **admins** | Admin users (JWT auth) |

---

### Order Flow

1. **Service Selection** (`/order`) → Cart in localStorage → Generate Order
2. **Payment** (`/order/[id]/payment`) → Razorpay checkout → Verify via webhook
3. **Documents** (`/order/[id]/documents`) → Upload per required document
4. **Admin Review** → Accept/Reject documents → Order approved

---

### Environment Variables

See `.env.example` for required variables:
- `MONGODB_URI`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- `FIREBASE_*` (Storage)
- `RESEND_API_KEY` (Email)
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`

---

### Setup

1. Copy `.env.example` to `.env.local`
2. Run `npm run seed` to populate categories and services
3. Default admin: `admin@easyapproval.com` / `Admin@123`
