# Easy Approval – Feature Status & Flows

## Summary

| Category | Working | Not Working |
|----------|---------|-------------|
| Order & Payment | ✅ | — |
| Document Upload | ✅ | — |
| Document Cropping | ✅ | — |
| Image Compression | ✅ | — |
| Quality Check (manual) | ✅ | — |
| Quality Check (auto/blur) | — | ❌ |
| QR / UPI Payment | — | ❌ |
| Realtime Updates | — | ❌ |
| User Auth | — | ❌ (mock only) |

---

## 1. WORKING FEATURES

### 1.1 Order Flow
| Feature | Flow | Status |
|---------|------|--------|
| Browse categories | Home → Services dropdown → Category | ✅ |
| Browse services | `/services` or `/order` | ✅ |
| Add to cart | Checkbox + qty controls | ✅ |
| Generate order | Modal → customer form → create order | ✅ |
| Payment | Razorpay Checkout (card/UPI in Razorpay modal) | ✅ |
| Invoice PDF | Download from documents page | ✅ |

### 1.2 Document Upload
| Feature | Flow | Status |
|---------|------|--------|
| Upload documents | `/order/[id]/documents` → Upload per field | ✅ |
| File types | jpg, png, pdf (max 5MB) | ✅ |
| Storage | MongoDB (StoredFile collection) | ✅ |
| Preview | Image preview before upload | ✅ |

### 1.3 Document Cropping
| Feature | Flow | Status |
|---------|------|--------|
| Crop for specific docs | When `cropRequired=true` (e.g. Aadhaar, PAN) | ✅ |
| Crop UI | `react-image-crop` – drag to select area | ✅ |
| Aspect ratio | 3:4 for crop-required docs | ✅ |
| Cropped upload | Cropped image sent to server | ✅ |

### 1.4 Image Compression
| Feature | Flow | Status |
|---------|------|--------|
| Compress before upload | `browser-image-compression` (max 1MB, 1920px) | ✅ |
| Applies to | Images only (not PDF) | ✅ |

### 1.5 Quality Check (Manual – Admin)
| Feature | Flow | Status |
|---------|------|--------|
| Admin review | `/admin/orders/[id]` → View document | ✅ |
| Accept | Sets `qualityStatus: accepted` | ✅ |
| Reject | Prompts reason → sets `rejected` → email to customer | ✅ |
| Order approved | When all docs accepted → order status = approved | ✅ |

### 1.6 Other Working
| Feature | Status |
|---------|--------|
| Order tracking | ✅ (Order ID + Email/Phone) |
| Admin dashboard | ✅ |
| Admin login (JWT) | ✅ |
| Contact form | ✅ |
| Email (Resend) | ✅ (payment success, rejection, approval) |
| Rate limiting | ✅ (60 req/min on public APIs) |

---

## 2. NOT WORKING / NOT IMPLEMENTED

### 2.1 QR Generation / UPI QR Payment
| Feature | Status | Notes |
|---------|--------|-------|
| UPI QR for payment | ❌ | Razorpay Checkout opens modal – UPI is inside Razorpay’s UI, not a custom QR |
| Custom payment QR | ❌ | No `qrcode` or similar lib used in app code |
| Standalone UPI QR | ❌ | Would need Razorpay Payment Links or custom integration |

### 2.2 Automated Quality Check
| Feature | Status | Notes |
|---------|--------|-------|
| Blur detection | ❌ | No blur/quality analysis on upload |
| Auto-reject blurry docs | ❌ | Admin manually accepts/rejects |
| Resolution check | ❌ | `minResolutionWidth` in seed exists but not enforced in upload |

### 2.3 Realtime Updates
| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard auto-refresh | ❌ | Fetches once on load |
| Admin orders auto-refresh | ❌ | Fetches once on load |
| Live order status | ❌ | User must refresh or re-track |
| Polling | ❌ | Not implemented |
| WebSocket / SSE | ❌ | Not implemented |

### 2.4 User Authentication
| Feature | Status | Notes |
|---------|--------|-------|
| Real login/register | ❌ | Mock – stores user in localStorage |
| Password reset | ❌ | Not implemented |
| Email verification | ❌ | Not implemented |
| Session persistence | ❌ | localStorage only |

---

## 3. FLOWS (Step-by-Step)

### User: Place Order
```
Home → Order → Select category → Add services to cart → Generate Order
  → Fill customer details → Create Order → Payment (Razorpay)
  → Upload documents (with crop if required) → Track order
```

### User: Upload Document (with crop)
```
/order/[id]/documents → Click Upload for a crop-required doc (e.g. Aadhaar)
  → /order/[id]/upload?crop=true
  → Select image → Adjust crop area (3:4) → Upload
  → File compressed → Sent to /api/upload → Stored in MongoDB
  → Redirect to documents page
```

### Admin: Review Documents
```
/admin/login → Dashboard → Orders → View order
  → See each document → Accept or Reject (with reason)
  → On reject: email sent to customer
  → On all accepted: order approved, email sent
```

---

## 4. WHAT WOULD BE NEEDED TO ADD

| Feature | Effort | Approach |
|---------|--------|----------|
| **UPI QR** | Medium | Razorpay Payment Links API or custom QR with UPI intent URL |
| **Blur detection** | Medium | Client: canvas + Laplacian variance; or server: sharp/opencv |
| **Realtime** | Low–Medium | Polling every 10–30s on dashboard/admin; or SSE |
| **Real user auth** | High | NextAuth + MongoDB adapter, or custom JWT + bcrypt |
