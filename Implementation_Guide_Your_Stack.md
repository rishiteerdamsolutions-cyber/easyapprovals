# Implementation Guide - Your Stack (Cursor + GitHub + MongoDB + Vercel)

## 🎯 Quick Answer: YES, Your Stack Works! ✅

Your stack is **perfectly feasible** for building this platform. Here's how to make it work optimally.

---

## 📦 Your Stack Components

| Component | Status | Notes |
|-----------|--------|-------|
| **Cursor** | ✅ Perfect | Best IDE for this project |
| **GitHub** | ✅ Perfect | Standard version control |
| **MongoDB** | ✅ Works Great | Use MongoDB Atlas (cloud) |
| **Vercel** | ⚠️ Needs Add-ons | Perfect for frontend, needs external services for files/emails |

---

## 🏗️ Recommended Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (Next.js)              │
│         Hosted on Vercel                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    API Routes (Next.js Serverless)      │
│    Hosted on Vercel                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         MongoDB Atlas                   │
│         (Cloud Database)                │
└─────────────────────────────────────────┘

External Services Needed:
├── AWS S3 / Cloudinary (File Storage)
├── SendGrid / Resend (Email)
├── Twilio / MSG91 (SMS)
├── Razorpay (Payments)
└── Railway / Render (Background Jobs - Optional)
```

---

## 🚀 Step-by-Step Setup Guide

### Step 1: Initialize Next.js Project

```bash
# Create Next.js app with TypeScript
npx create-next-app@latest ca-compliance-platform --typescript --tailwind --app

# Navigate to project
cd ca-compliance-platform

# Install core dependencies
npm install mongoose zod react-hook-form @hookform/resolvers
npm install next-auth @auth/mongodb-adapter
npm install razorpay
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install nodemailer
npm install twilio

# Development dependencies
npm install -D @types/node @types/react @types/react-dom
```

### Step 2: Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create free cluster (M0 - 512MB free)

2. **Configure Database**
   ```javascript
   // lib/mongodb.ts
   import mongoose from 'mongoose';

   const MONGODB_URI = process.env.MONGODB_URI!;

   if (!MONGODB_URI) {
     throw new Error('Please define MONGODB_URI in .env.local');
   }

   interface MongooseCache {
     conn: typeof mongoose | null;
     promise: Promise<typeof mongoose> | null;
   }

   let cached: MongooseCache = (global as any).mongoose || { conn: null, promise: null };

   if (!(global as any).mongoose) {
     (global as any).mongoose = cached;
   }

   async function connectDB() {
     if (cached.conn) {
       return cached.conn;
     }

     if (!cached.promise) {
       const opts = {
         bufferCommands: false,
       };

       cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
         return mongoose;
       });
     }

     try {
       cached.conn = await cached.promise;
     } catch (e) {
       cached.promise = null;
       throw e;
     }

     return cached.conn;
   }

   export default connectDB;
   ```

3. **Create Models**
   ```javascript
   // models/User.ts
   import mongoose from 'mongoose';

   const UserSchema = new mongoose.Schema({
     email: { type: String, required: true, unique: true },
     phone: { type: String, required: true },
     passwordHash: { type: String, required: true },
     name: { type: String, required: true },
     role: { type: String, enum: ['user', 'ca', 'admin'], default: 'user' },
     createdAt: { type: Date, default: Date.now },
     updatedAt: { type: Date, default: Date.now },
   });

   export default mongoose.models.User || mongoose.model('User', UserSchema);
   ```

   ```javascript
   // models/Order.ts
   import mongoose from 'mongoose';

   const OrderSchema = new mongoose.Schema({
     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
     serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
     status: { 
       type: String, 
       enum: ['pending', 'processing', 'completed', 'cancelled'],
       default: 'pending'
     },
     totalAmount: { type: Number, required: true },
     serviceFee: { type: Number, required: true },
     governmentFee: { type: Number, required: true },
     gst: { type: Number, required: true },
     paymentStatus: { 
       type: String, 
       enum: ['pending', 'paid', 'failed'],
       default: 'pending'
     },
     paymentId: String,
     documents: [{
       type: { type: String, required: true },
       url: { type: String, required: true },
       uploadedAt: { type: Date, default: Date.now },
       verifiedAt: Date,
     }],
     formData: { type: mongoose.Schema.Types.Mixed },
     createdAt: { type: Date, default: Date.now },
     updatedAt: { type: Date, default: Date.now },
   });

   export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
   ```

### Step 3: Configure Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Create vercel.json**
   ```json
   {
     "functions": {
       "app/api/**/*.ts": {
         "maxDuration": 10
       }
     },
     "env": {
       "MONGODB_URI": "@mongodb_uri",
       "NEXTAUTH_SECRET": "@nextauth_secret",
       "NEXTAUTH_URL": "@nextauth_url"
     }
   }
   ```

3. **Environment Variables in Vercel**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add:
     - `MONGODB_URI`
     - `NEXTAUTH_SECRET`
     - `NEXTAUTH_URL`
     - `RAZORPAY_KEY_ID`
     - `RAZORPAY_KEY_SECRET`
     - `AWS_ACCESS_KEY_ID`
     - `AWS_SECRET_ACCESS_KEY`
     - `AWS_S3_BUCKET_NAME`
     - `SENDGRID_API_KEY`
     - `TWILIO_ACCOUNT_SID`
     - `TWILIO_AUTH_TOKEN`

### Step 4: Set Up File Upload (AWS S3)

```javascript
// lib/s3.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadFile(file: File, key: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  });

  await s3Client.send(command);
  
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

// API Route: app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const key = `documents/${Date.now()}-${file.name}`;
    const url = await uploadFile(file, key);

    return NextResponse.json({ url, key });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
```

### Step 5: Set Up Payment (Razorpay)

```javascript
// lib/razorpay.ts
import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// API Route: app/api/payments/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const { amount, orderId } = await request.json();

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: orderId,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Payment creation failed' }, { status: 500 });
  }
}
```

### Step 6: Set Up Authentication (NextAuth.js)

```javascript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await connectDB();
        const user = await User.findOne({ email: credentials?.email });
        
        if (user && await bcrypt.compare(credentials?.password!, user.passwordHash)) {
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Step 7: Project Structure

```
ca-compliance-platform/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── upload/
│   │   └── services/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   ├── services/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── forms/
│   └── dashboard/
├── lib/
│   ├── mongodb.ts
│   ├── s3.ts
│   ├── razorpay.ts
│   └── email.ts
├── models/
│   ├── User.ts
│   ├── Order.ts
│   ├── Service.ts
│   └── Payment.ts
├── public/
├── .env.local
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 🔧 Required External Services Setup

### 1. AWS S3 (File Storage)

**Setup:**
1. Create AWS account
2. Create S3 bucket
3. Set up IAM user with S3 permissions
4. Add credentials to Vercel env variables

**Cost:** Free tier (5GB), then ~₹2,000-5,000/month

### 2. SendGrid (Email)

**Setup:**
1. Create SendGrid account
2. Verify sender email
3. Get API key
4. Add to Vercel env variables

**Cost:** Free tier (100 emails/day), then paid

### 3. Twilio (SMS)

**Setup:**
1. Create Twilio account
2. Get Account SID and Auth Token
3. Add to Vercel env variables

**Cost:** Pay per SMS (~₹0.50-1 per SMS)

### 4. Razorpay (Payments)

**Setup:**
1. Create Razorpay account
2. Get API keys (Test mode for development)
3. Add to Vercel env variables
4. Set up webhook endpoint

**Cost:** 2% transaction fee

---

## 📝 MongoDB Schema Examples

### User Schema
```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  phone: "+919876543210",
  passwordHash: "$2a$10$...",
  name: "John Doe",
  role: "user",
  createdAt: ISODate("2025-01-04T..."),
  updatedAt: ISODate("2025-01-04T...")
}
```

### Order Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId("..."),
  serviceId: ObjectId("..."),
  status: "processing",
  totalAmount: 6899,
  serviceFee: 5000,
  governmentFee: 1500,
  gst: 399,
  paymentStatus: "paid",
  paymentId: "pay_...",
  documents: [
    {
      type: "aadhaar",
      url: "https://s3.../doc.pdf",
      uploadedAt: ISODate("..."),
      verifiedAt: ISODate("...")
    }
  ],
  formData: {
    companyName: "ABC Pvt Ltd",
    directors: [...],
    // Flexible schema for different services
  },
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Set up MongoDB Atlas cluster
- [ ] Create AWS S3 bucket
- [ ] Set up SendGrid account
- [ ] Set up Twilio account
- [ ] Set up Razorpay account
- [ ] Add all environment variables to Vercel
- [ ] Test all API routes locally
- [ ] Set up GitHub repository

### Deployment Steps
1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/ca-compliance-platform.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Import GitHub repository
   - Vercel will auto-detect Next.js
   - Add environment variables
   - Deploy!

3. **Configure Domain** (Optional)
   - Add custom domain in Vercel
   - Update DNS records

---

## 💡 Pro Tips for Your Stack

### MongoDB Best Practices
1. **Use Indexes**: Create indexes on frequently queried fields
   ```javascript
   UserSchema.index({ email: 1 });
   OrderSchema.index({ userId: 1, createdAt: -1 });
   ```

2. **Connection Pooling**: Reuse connections in serverless
   ```javascript
   // Already handled in lib/mongodb.ts
   ```

3. **Transactions**: Use for payment processing
   ```javascript
   const session = await mongoose.startSession();
   session.startTransaction();
   // ... operations
   await session.commitTransaction();
   ```

### Vercel Best Practices
1. **Keep Functions Fast**: Optimize API routes
2. **Use Edge Functions**: For fast responses
3. **Environment Variables**: Use Vercel's env management
4. **Caching**: Implement proper caching
5. **File Uploads**: Use presigned URLs for direct S3 uploads

### Cost Optimization
1. **Free Tiers**: Use free tiers initially
2. **MongoDB Atlas**: Start with M0 (free)
3. **Vercel**: Use Hobby plan initially
4. **AWS S3**: Use S3 Intelligent-Tiering
5. **Monitor Usage**: Set up billing alerts

---

## ✅ Final Checklist

**Your Stack Works! Here's what you need:**

- ✅ **Cursor**: Ready to use
- ✅ **GitHub**: Ready to use
- ✅ **MongoDB**: Set up MongoDB Atlas
- ✅ **Vercel**: Ready to deploy
- ⚠️ **Add**: AWS S3 (file storage)
- ⚠️ **Add**: SendGrid (email)
- ⚠️ **Add**: Twilio (SMS)
- ⚠️ **Add**: Razorpay (payments)

**Estimated Setup Time:** 1-2 days
**Estimated Monthly Cost (MVP):** ₹5,000-10,000/month
**Development Time:** 3-4 months for MVP

---

## 🎯 Next Steps

1. **Initialize Project**: Run the setup commands above
2. **Set Up MongoDB Atlas**: Create free cluster
3. **Set Up External Services**: AWS S3, SendGrid, Twilio, Razorpay
4. **Start Development**: Build core features
5. **Deploy to Vercel**: Connect GitHub and deploy

**Your stack is modern, cost-effective, and perfect for this project!** 🚀

