# Easy Approval – Objective & Feature Analysis

---

## 1. OBJECTIVE

**Primary goal:** Build a **CA/CS compliance automation platform** for a group of Chartered Accountants in India, inspired by IndiaFilings. Enable businesses to:

- Browse and order corporate/compliance services (MCA, GST, Income Tax, Trademark, etc.)
- Pay online via Razorpay
- Upload required documents
- Track order status
- Have CA/admin review documents and complete the workflow

**Target:** First 10 clients, then scale.

**Reference model:** IndiaFilings (150+ services, transparent pricing, end-to-end workflow).

---

## 2. EXPECTED FEATURES (From MVP / Vision)

| Category | Expected | Notes |
|----------|----------|-------|
| **User auth** | Register, login, OTP, email verify, password reset | MVP lists these |
| **Service catalog** | Browse categories, services, pricing | Core |
| **Order flow** | Create order, customer form, status tracking | Core |
| **Document upload** | Upload, validate, preview, crop | Core |
| **Payment** | Razorpay (card, UPI, netbanking) | Core |
| **Admin** | Order management, document review, reports | Core |
| **Communication** | Email, SMS, in-app notifications | Expected |
| **Compliance calendar** | Deadlines, reminders | Phase 2 |
| **AI / automation** | Where possible | Future |

---

## 3. FEATURES OUT OF SCOPE (Not Planned)

| Feature | Reason |
|---------|--------|
| **Government portal integration** | Not required – CA handles gov portals manually |
| **Automated form filling** (Gov portals) | Not required |
| **AI compliance co-pilot** | Not required |
| **Mobile app** | Not required – web responsive is sufficient |
| **Multi-CA assignment** | Not required for initial scope |
| **Real-time chat** | Not required for MVP |
| **Advanced analytics** | Not required for MVP |

## 3b. FEATURES PLANNED (In Scope)

| Feature | Difficulty | Notes |
|---------|------------|-------|
| **Blur detection** (auto quality check) | Medium | Client or server – Laplacian variance, OpenCV/sharp |
| **OTP/SMS verification** | Medium | MSG91, Twilio, or similar; cost per SMS |

---

## 4. FEATURES DEVIATING FROM OBJECTIVE

| Feature | Status | Deviation |
|---------|--------|-----------|
| **User login/register** | Mock (localStorage) | Should be real auth; no OTP, no verification |
| **Dashboard** | Loads by email from localStorage | Not tied to real user account; email lookup only |
| **Compliance calendar** | Not built | Expected in MVP docs |
| **Service search / filter** | Limited | MVP expects search and filtering |
| **Assign to CA** | Not built | MVP expects CA assignment |
| **Refund processing** | Not built | MVP expects admin refunds |
| **SMS / OTP** | Not built | Expected for verification |
| **In-app notifications** | Not built | Expected |
| **Client management** | Not built | Admin should see clients, not just orders |
| **Advanced reporting** | Not built | Basic stats only |

**Deviations aligned with objective:**  
Focusing on order → payment → documents → admin review matches the core compliance workflow and keeps scope manageable.

---

## 5. REALTIME vs NOT REALTIME

### ❌ NOT Realtime (fetch once, no auto-update)

| Feature | Behavior |
|---------|----------|
| **Homepage** | Categories/services fetched at request (SSR), no client refresh |
| **Order page** | Services fetched on load |
| **User dashboard** | Orders fetched once on mount |
| **Admin dashboard** | Stats fetched once on mount |
| **Admin orders list** | Orders fetched once; filter triggers refetch |
| **Order tracking** | Fetches on submit; no auto-refresh |
| **Admin order detail** | Documents loaded once; accept/reject triggers refetch |

### ✅ Realtime / Near-realtime (updates without full page refresh)

| Feature | Behavior |
|---------|----------|
| **Cart** | Updates in realtime (localStorage + state) |
| **Payment flow** | Razorpay modal → success → redirect (event-driven) |
| **Document upload** | Upload → success → redirect |
| **Admin document review** | Accept/Reject → API call → refetch list |

### Summary

- No **automatic background updates** (polling, WebSocket, SSE).
- User must refresh or re-track to see new status.
- Admin must refresh or change filters to see new orders.
- Cart, payment, and upload flows feel “realtime” because they respond to user actions, but they do not auto-sync in the background.

---

## 6. FEATURE STATUS MATRIX

| Feature | Expected | Built | Realtime | Hard? | Deviates? |
|---------|----------|-------|----------|-------|-----------|
| Service catalog | ✅ | ✅ | N/A | No | No |
| Order creation | ✅ | ✅ | N/A | No | No |
| Payment (Razorpay) | ✅ | ✅ | Event | No | No |
| Document upload | ✅ | ✅ | Event | No | No |
| Document crop | ✅ | ✅ | Event | No | No |
| Admin document review | ✅ | ✅ | Manual refetch | No | No |
| Order tracking | ✅ | ✅ | Manual refetch | No | No |
| Email notifications | ✅ | ✅ | N/A | No | No |
| Invoice PDF | ✅ | ✅ | N/A | No | No |
| User login/register | ✅ | ❌ Mock | N/A | No | **Yes** |
| OTP/SMS | ✅ | ❌ | N/A | Medium | Yes |
| Compliance calendar | ✅ | ❌ | N/A | Medium | Yes |
| Realtime status updates | Phase 2 | ❌ | ❌ | Low | No |
| UPI QR (custom) | Optional | ❌ | N/A | Medium | No |
| Blur detection | Optional | ❌ | N/A | Medium | No |
| CA assignment | ✅ | ❌ | N/A | Medium | Yes |
| Client management | ✅ | ❌ | N/A | Medium | Yes |

---

## 7. SIMPLIFIED OBJECTIVES & ALTERNATE METHODS

### Simplified Core Objective (Minimal Viable)

> **"Enable clients to order CA services, pay, upload documents, and let admin review — without complex integrations."**

Everything else is enhancement.

---

### Blur Detection — Alternate Methods

| Method | Effort | How | Trade-off |
|--------|--------|-----|-----------|
| **1. Min resolution check** | Low | Reject if width/height &lt; 800px (already in Service model) | Catches very low-res; misses blurry but high-res |
| **2. Client-side Laplacian** | Low | JavaScript on canvas — compute variance before upload | No server cost; runs in browser; lightweight |
| **3. Server-side (sharp)** | Medium | Node `sharp` — measure blur via Laplacian | Reliable; adds ~100ms per image |
| **4. Third-party API** | Medium | Cloud vision API (e.g. Google, AWS) | Cost per image; overkill for this use case |
| **5. Admin + better UX** | Low | Keep manual review; add "Poor quality" rejection reason | Simplest; no code change for detection |

**Recommended path:** Start with **#2 (client-side Laplacian)** — free, instant feedback, no backend change. Add **#3** later if needed.

---

### OTP / Verification — Alternate Methods

| Method | Effort | How | Cost |
|--------|--------|-----|------|
| **1. Email OTP** | Low | 6-digit code via Resend (already integrated) | Free tier ~3k emails/month |
| **2. Email magic link** | Low | "Click to verify" — no OTP to type | Same as above |
| **3. SMS via MSG91** | Medium | India-focused; simple API | ~₹0.15–0.25/SMS |
| **4. SMS via Twilio** | Medium | Global; well-documented | ~$0.0075/SMS |
| **5. WhatsApp (Business API)** | High | Popular in India; requires business verification | Per conversation |
| **6. Password-only (no OTP)** | Low | Email + password, optional email verify link | Zero extra cost |

**Recommended path:** Use **#1 (Email OTP)** first — Resend already in place. Add SMS later with MSG91 if clients demand it.

---

### User Auth — Simplified Path

| Phase | What | Effort |
|-------|------|--------|
| **Phase A** | Email + password, store in MongoDB, JWT session | Low |
| **Phase B** | Add email OTP or magic link for signup | Low |
| **Phase C** | Add SMS OTP (optional) | Medium |
| **Phase D** | Password reset, email verify | Low |

**Skip for now:** NextAuth, OAuth (Google/Facebook), role-based access beyond admin.

---

### Other Features — Simplified Approaches

| Feature | Simplified Approach |
|---------|---------------------|
| **Realtime updates** | Poll every 30s on dashboard/admin; no WebSocket |
| **Compliance calendar** | Spreadsheet or external tool; not in app |
| **Client management** | Admin sees orders; "clients" = distinct emails in orders |
| **Refunds** | Process via Razorpay dashboard; no in-app refund UI |
| **CA assignment** | Single admin/team; no assignment logic |
| **Search/filter** | Basic category filter (exists); skip full-text search |

---

### Priority Order (Simplified Roadmap)

1. **Now (core is done):** Polish UX, fix bugs, ensure production stability.
2. **Next:** Real user auth (email + password + JWT).
3. **Then:** Email OTP or magic link for signup.
4. **Then:** Client-side blur check before upload.
5. **Later:** SMS OTP (if needed), server-side blur (if client-side insufficient).
6. **Optional:** Simple polling for dashboard/admin.

---

## 8. RECOMMENDATIONS

1. **Align with objective:** Core flow is correct. Polish first, then add enhancements.
2. **Auth:** Start with email + password + JWT; add Email OTP before SMS.
3. **Blur:** Implement client-side Laplacian check; add server-side only if needed.
4. **Realtime:** Optional — add simple polling (30s) on dashboard/admin.
5. **Out of scope:** Government integration, AI, mobile app — not planned.
6. **Keep scope tight:** Skip compliance calendar, CA assignment, advanced reporting until validated.
