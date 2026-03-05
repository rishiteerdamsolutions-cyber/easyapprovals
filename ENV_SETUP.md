# Environment Setup Checklist

Add these to `.env.local` to fix 500 errors and configure payments:

## Required for App to Work

```bash
# MongoDB (required - services/categories APIs fail without this)
MONGODB_URI=mongodb+srv://your-connection-string

# NextAuth (fixes session 500 error)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=any-random-string-at-least-32-characters-long

# Documents email - customers send documents here after payment
DOCUMENTS_EMAIL=aideveloperindia@gmail.com
```

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
