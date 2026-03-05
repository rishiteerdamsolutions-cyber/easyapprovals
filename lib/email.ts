import { Resend } from 'resend';

const FROM = process.env.EMAIL_FROM || 'Easy Approval <onboarding@resend.dev>';

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set, skipping email');
    return false;
  }
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to: [to],
      subject,
      html,
    });
    if (error) {
      console.error('Email error:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Email send failed:', e);
    return false;
  }
}

const DOCUMENTS_EMAIL = process.env.DOCUMENTS_EMAIL || 'documents@easyapproval.com';

export function paymentSuccessEmail(orderId: string, customerName: string, totalAmount: number, services: string[]): string {
  const mailto = `mailto:${DOCUMENTS_EMAIL}?subject=Documents - Order ${orderId}`;
  return `
    <h2>Payment Successful</h2>
    <p>Dear ${customerName},</p>
    <p>Your payment of ₹${totalAmount.toLocaleString()} for Order <strong>${orderId}</strong> has been received.</p>
    <p><strong>Services:</strong></p>
    <ul>${services.map((s) => `<li>${s}</li>`).join('')}</ul>
    <h3>Document Submission</h3>
    <p>To complete your order, please email your documents to us:</p>
    <ol>
      <li>Attach scanned copies of required documents (PAN, Aadhaar, address proof, etc.)</li>
      <li>Use the subject line: <strong>Documents - Order ${orderId}</strong></li>
      <li>Send to: <a href="${mailto}">${DOCUMENTS_EMAIL}</a></li>
    </ol>
    <p><a href="${mailto}" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;margin:8px 0;">Email Documents Now</a></p>
    <p>You can also track your order status at any time using your Order ID and email.</p>
    <p>Thank you for choosing Easy Approval.</p>
  `;
}

export function documentRejectedEmail(orderId: string, customerName: string, fieldName: string, reason: string): string {
  return `
    <h2>Document Rejected</h2>
    <p>Dear ${customerName},</p>
    <p>Your document "<strong>${fieldName}</strong>" for Order <strong>${orderId}</strong> has been rejected.</p>
    <p><strong>Reason:</strong> ${reason}</p>
    <p>Please re-upload the document with the required corrections.</p>
    <p>Thank you.</p>
  `;
}

export function orderApprovedEmail(orderId: string, customerName: string, services: string[]): string {
  return `
    <h2>Order Approved</h2>
    <p>Dear ${customerName},</p>
    <p>All documents for Order <strong>${orderId}</strong> have been approved.</p>
    <p><strong>Services:</strong></p>
    <ul>${services.map((s) => `<li>${s}</li>`).join('')}</ul>
    <p>We will process your application and keep you updated.</p>
    <p>Thank you for choosing Easy Approval.</p>
  `;
}

export function orderCompletedEmail(orderId: string, customerName: string, services: string[]): string {
  return `
    <h2>Order Completed</h2>
    <p>Dear ${customerName},</p>
    <p>Your Order <strong>${orderId}</strong> has been completed successfully.</p>
    <p><strong>Services:</strong></p>
    <ul>${services.map((s) => `<li>${s}</li>`).join('')}</ul>
    <p>Thank you for choosing Easy Approval.</p>
  `;
}
