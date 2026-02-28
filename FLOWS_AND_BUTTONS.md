# Easy Approval – Flows & Button Reference

## Prerequisite: Seed the Database

**If categories/services appear empty**, run:
```bash
npm run seed
```
Requires `MONGODB_URI` in `.env.local`.

---

## 1. HOMEPAGE (`/`)

| Button/Link | Action | Flow |
|-------------|--------|------|
| **Order Services** | Navigate | → `/order` |
| **Browse Catalog** | Navigate | → `/services` |
| **Key Services** (category cards) | Navigate | → `/order?category={slug}` |
| **Popular Services** (service cards) | Navigate | → `/services/{slug}` |
| **Order Services** (bottom CTA) | Navigate | → `/order` |

---

## 2. NAVBAR (all pages)

| Button/Link | Action | Flow |
|-------------|--------|------|
| **Services** (dropdown) | Hover | Shows categories + Browse Catalog + Order Services |
| **Order** | Navigate | → `/order` |
| **Track** | Navigate | → `/track` |
| **About** | Navigate | → `/about` |
| **Contact** | Navigate | → `/contact` |
| **Login** | Navigate | → `/login` |
| **Sign Up** | Navigate | → `/register` |

---

## 3. ORDER FLOW (`/order`)

| Button/Link | Action | Flow |
|-------------|--------|------|
| **Category buttons** (left sidebar) | Select category | Filters services on the right |
| **Checkbox** (per service) | Add/remove from cart | Toggles service in cart |
| **-** / **+** (qty) | Change quantity | Updates cart item qty |
| **Generate Order** | Open modal | Shows customer details form |
| **Create Order** (in modal) | Submit | Creates order → `/order/{id}/payment` |
| **Cancel** (in modal) | Close | Closes modal |

---

## 4. PAYMENT (`/order/[id]/payment`)

| Button | Action | Flow |
|--------|--------|------|
| **Pay with Razorpay** | Open Razorpay | Checkout → on success → `/order/{id}/documents` |

---

## 5. DOCUMENTS (`/order/[id]/documents`)

| Button/Link | Action | Flow |
|-------------|--------|------|
| **Upload** (per document) | Navigate | → `/order/{id}/upload?serviceId=...&field=...` |
| **Replace** | Navigate | Same upload page |
| **View** | Open | Opens file URL in new tab |
| **Download Invoice** | Download | → `/api/orders/{id}/invoice` (PDF) |
| **Track Order** | Navigate | → `/track` |

---

## 6. UPLOAD (`/order/[id]/upload`)

| Button | Action | Flow |
|--------|--------|------|
| **Upload** | Submit file | Uploads → redirects to `/order/{id}/documents` |
| **Remove** | Clear file | Clears selection |
| **Cancel** | Navigate | → `/order/{id}/documents` |

---

## 7. TRACK (`/track`)

| Button | Action | Flow |
|--------|--------|------|
| **Track** | Search | Fetches order by Order ID + Email/Phone, shows status |

---

## 8. LOGIN / REGISTER

| Button | Action | Flow |
|--------|--------|------|
| **Login** | Mock login | Stores user in localStorage → `/dashboard` |
| **Sign Up** | Mock register | Stores user → redirects to login |
| **Admin Login** (link) | Navigate | → `/admin/login` |

---

## 9. DASHBOARD (`/dashboard`)

| Button/Link | Action | Flow |
|-------------|--------|------|
| **Order Services** | Navigate | → `/order` |
| **Track Order** | Navigate | → `/track` |
| **Browse Services** | Navigate | → `/services` |
| **View Details** (per order) | Navigate | → `/order/{id}/documents` |

---

## 10. ADMIN (`/admin`)

| Button/Link | Action | Flow |
|-------------|--------|------|
| **Orders** | Navigate | → `/admin/orders` |
| **Services** | Navigate | → `/admin/services` |
| **Categories** | Navigate | → `/admin/categories` |
| **Logout** | Clear token | → `/admin/login` |
| **View orders** (In Review, Approved) | Navigate | → `/admin/orders?status=...` |

---

## 11. ADMIN ORDERS (`/admin/orders`)

| Button/Link | Action | Flow |
|-------------|--------|------|
| **All / Pending Upload / etc.** | Filter | Reloads list with status filter |
| **View** | Navigate | → `/admin/orders/{id}` |
| **Invoice** | Download | → `/api/orders/{id}/invoice` |

---

## 12. ADMIN ORDER DETAIL (`/admin/orders/[id]`)

| Button | Action | Flow |
|--------|--------|------|
| **Accept** (per document) | Approve | Updates document, may set order to approved |
| **Reject** (per document) | Reject | Prompts for reason, sends email to customer |
| **View** | Open | Opens file URL |
| **Download Invoice** | Download | PDF |

---

## Main User Journey

```
Home → Order → Select Services → Generate Order → Payment → Upload Documents → Track
         ↓           ↓                    ↓            ↓
      /order    Add to cart         Customer form   Razorpay
                Generate Order      Create order    → Documents
```

---

## If Buttons Look Empty

1. **Run seed**: `npm run seed` (needs MongoDB)
2. **Check `.env.local`**: `MONGODB_URI` must be set
3. **Restart dev server**: `npm run dev`
