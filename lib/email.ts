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

export function paymentSuccessEmail(orderId: string, customerName: string, totalAmount: number, services: string[]): string {
  return `
    <h2>Payment Successful</h2>
    <p>Dear ${customerName},</p>
    <p>Your payment of ₹${totalAmount.toLocaleString()} for Order <strong>${orderId}</strong> has been received.</p>
    <p><strong>Services:</strong></p>
    <ul>${services.map((s) => `<li>${s}</li>`).join('')}</ul>
    <p>Please upload your documents at the link provided in your order confirmation.</p>
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
