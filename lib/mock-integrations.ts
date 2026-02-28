// Mock integrations - Ready for real API integration

// Mock Email Service (SendGrid/Resend)
export async function sendEmail(to: string, subject: string, html: string) {
  // Mock implementation
  console.log('📧 Mock Email Sent:', { to, subject });
  
  // In production, replace with:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({ to, from: 'noreply@easyapproval.com', subject, html });
  
  return { success: true, messageId: 'mock-' + Date.now() };
}

// Mock SMS Service (Twilio/MSG91)
export async function sendSMS(to: string, message: string) {
  // Mock implementation
  console.log('📱 Mock SMS Sent:', { to, message });
  
  // In production, replace with:
  // const twilio = require('twilio');
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({ body: message, to, from: process.env.TWILIO_PHONE_NUMBER });
  
  return { success: true, messageId: 'mock-' + Date.now() };
}

// Mock OTP Generation
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Mock Razorpay Payment
export async function createRazorpayOrder(amount: number, orderId: string) {
  // Mock implementation
  console.log('💳 Mock Razorpay Order Created:', { amount, orderId });
  
  // In production, replace with:
  // const Razorpay = require('razorpay');
  // const razorpay = new Razorpay({
  //   key_id: process.env.RAZORPAY_KEY_ID,
  //   key_secret: process.env.RAZORPAY_KEY_SECRET,
  // });
  // const order = await razorpay.orders.create({
  //   amount: amount * 100, // Convert to paise
  //   currency: 'INR',
  //   receipt: orderId,
  // });
  // return order;
  
  return {
    id: 'order_mock_' + Date.now(),
    amount: amount * 100,
    currency: 'INR',
    receipt: orderId,
    status: 'created',
  };
}

// Mock File Upload (AWS S3)
export async function uploadFile(file: File, key: string): Promise<string> {
  // Mock implementation
  console.log('📁 Mock File Uploaded:', { fileName: file.name, key });
  
  // In production, replace with:
  // const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
  // const s3Client = new S3Client({ region: process.env.AWS_REGION });
  // await s3Client.send(new PutObjectCommand({
  //   Bucket: process.env.AWS_S3_BUCKET_NAME,
  //   Key: key,
  //   Body: file,
  // }));
  // return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  
  return `https://mock-s3-url.com/${key}`;
}

// Email Templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to Easy Approval!',
    html: `
      <h1>Welcome ${name}!</h1>
      <p>Thank you for joining Easy Approval. We're here to help you with all your compliance needs.</p>
    `,
  }),
  orderConfirmation: (orderId: string, serviceName: string, amount: number) => ({
    subject: `Order Confirmation - ${orderId}`,
    html: `
      <h1>Order Confirmed!</h1>
      <p>Your order for ${serviceName} has been confirmed.</p>
      <p>Order ID: ${orderId}</p>
      <p>Amount: ₹${amount.toLocaleString()}</p>
    `,
  }),
  paymentSuccess: (orderId: string, amount: number) => ({
    subject: `Payment Successful - ${orderId}`,
    html: `
      <h1>Payment Successful!</h1>
      <p>Your payment of ₹${amount.toLocaleString()} has been processed successfully.</p>
      <p>Order ID: ${orderId}</p>
    `,
  }),
  statusUpdate: (orderId: string, status: string) => ({
    subject: `Order Status Update - ${orderId}`,
    html: `
      <h1>Order Status Updated</h1>
      <p>Your order ${orderId} status has been updated to: ${status}</p>
    `,
  }),
};

// SMS Templates
export const smsTemplates = {
  otp: (otp: string) => `Your Easy Approval OTP is ${otp}. Valid for 10 minutes.`,
  orderConfirmation: (orderId: string) => `Your order ${orderId} has been confirmed. Thank you for choosing Easy Approval!`,
  paymentSuccess: (orderId: string, amount: number) => `Payment of ₹${amount} successful for order ${orderId}. Thank you!`,
  statusUpdate: (orderId: string, status: string) => `Your order ${orderId} status: ${status}. Check dashboard for details.`,
};



