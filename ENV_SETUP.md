# Environment Setup Checklist

Add these to `.env.local` (local) or **Vercel Project Settings → Environment Variables** (production).

## Required for App to Work (fixes 500 errors)

```bash
# MongoDB (required - services/categories APIs fail without this)
MONGODB_URI=mongodb+srv://your-connection-string

# NextAuth (fixes session 500 / CLIENT_FETCH_ERROR)
NEXTAUTH_URL=https://your-domain.vercel.app   # Use your production URL, NOT localhost
NEXTAUTH_SECRET=any-random-string-at-least-32-characters-long

# App URL (for production)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Documents email - customers send documents here after payment
DOCUMENTS_EMAIL=aideveloperindia@gmail.com
```

**Production (Vercel):** Set NEXTAUTH_URL to your live URL (e.g. https://easyapprovals.vercel.app). If you use localhost, the session API will fail.

## Required for Payment (Razorpay)

```bash
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

## Optional (Google Login)

```bash
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
```

## Optional (Email - payment success, contact form)

```bash
RESEND_API_KEY=re_xxxx
EMAIL_FROM=Easy Approval <onboarding@resend.dev>
```

**After updating .env.local, restart the dev server** (`npm run dev`).

---

## Document flow after payment

1. Customer pays → payment success email sent with instructions
2. Email tells customer to **send documents to** `DOCUMENTS_EMAIL` (aideveloperindia@gmail.com)
3. Customer emails documents from their Gmail/email with subject: `Documents - Order {orderId}`
4. You receive documents in your Gmail inbox

---

## CA assignment (Admin)

- Go to **Admin → Orders** → click an order
- Use **Assign to CA** field: enter CA name or email
- Click **Assign to CA** to save
- CA subscription / CA user accounts: **Not built yet** (future feature)
