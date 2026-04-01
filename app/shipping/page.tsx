import Link from 'next/link';
import LegalPageLayout, {
  LegalH2,
  LegalH3,
  LegalLi,
  LegalNote,
  LegalUl,
} from '@/components/legal/LegalPageLayout';
import { POLICIES_EFFECTIVE_DATE, SITE_LEGAL } from '@/lib/site-legal';

export const metadata = {
  title: 'Shipping & Delivery Policy | Easy Approval',
  description:
    'How Easy Approval delivers professional and digital services—no physical shipping for standard compliance services; payment delivery via Razorpay and Cashfree.',
};

export default function ShippingPolicyPage() {
  const { brandName, legalEntityName, supportEmail, websiteUrl } = SITE_LEGAL;

  return (
    <LegalPageLayout
      title="Shipping & Delivery Policy"
      effectiveDate={POLICIES_EFFECTIVE_DATE}
    >
      <LegalNote>
        Payment gateways such as <strong>Razorpay</strong> and <strong>Cashfree</strong> often
        require merchants to publish a shipping or delivery policy. {brandName} primarily delivers{' '}
        <strong>professional services and digital outcomes</strong> (filings, documents, portal
        access)—not physical products—unless a specific product page explicitly states otherwise.
      </LegalNote>

      <p>
        This Shipping & Delivery Policy describes how <strong>{legalEntityName}</strong> (“
        <strong>{brandName}</strong>”) delivers its Services ordered through {websiteUrl}.
      </p>

      <LegalH2>1. No physical shipping (default)</LegalH2>
      <p>
        Unless a particular service explicitly includes courier of physical goods (e.g. printed
        certificates where offered), <strong>we do not ship physical products</strong>. Standard
        orders do not have a “shipping address” for merchandise; any address we collect is for
        billing, KYC, or statutory forms as required by law or payment partners.
      </p>

      <LegalH2>2. How services are “delivered”</LegalH2>
      <LegalH3>2.1 Digital and professional delivery</LegalH3>
      <LegalUl>
        <LegalLi>
          <strong>Documents and outputs:</strong> Drafts, filed copies, acknowledgements, and reports
          are typically delivered by email, secure download, or your account on our platform, as
          applicable.
        </LegalLi>
        <LegalLi>
          <strong>Government and registry outcomes:</strong> Many services conclude with approval,
          registration, or reference numbers issued by government or regulatory systems. Delivery
          timelines depend on those authorities and are not guaranteed by us.
        </LegalLi>
        <LegalLi>
          <strong>Professional support:</strong> Consultations or reviews may be delivered by
          phone, video, email, or chat as arranged after payment.
        </LegalLi>
      </LegalUl>

      <LegalH2>3. Timelines</LegalH2>
      <p>
        Estimated processing times shown on service pages are indicative and depend on document
        completeness, government portal availability, and third-party processing. We are not
        liable for delays caused by authorities, banks, payment networks, or force majeure events.
      </p>

      <LegalH2>4. Payment confirmation (“delivery” of payment access)</LegalH2>
      <p>
        Access to pay via our checkout is immediate upon page load. Successful payment confirmation
        is shown by our payment partners (Razorpay, Cashfree, etc.) and communicated to us via
        webhooks or APIs. You should retain the transaction ID or receipt issued by the payment
        gateway for your records.
      </p>

      <LegalH2>5. Physical items (if ever applicable)</LegalH2>
      <p>
        If a future offering includes physical delivery, the product page will state estimated
        dispatch and delivery timelines, courier partners, and any shipping charges. Until such an
        offering is published, this section does not apply.
      </p>

      <LegalH2>6. Failed delivery of digital goods</LegalH2>
      <p>
        If you do not receive an expected email or document within the communicated timeframe,
        check spam folders and contact{' '}
        <a href={`mailto:${supportEmail}`} className="text-primary-600 hover:underline">
          {supportEmail}
        </a>{' '}
        with your order ID. We will resend or provide alternate access where appropriate.
      </p>

      <LegalH2>7. Contact</LegalH2>
      <p>
        Questions:{' '}
        <a href={`mailto:${supportEmail}`} className="text-primary-600 hover:underline">
          {supportEmail}
        </a>
        .{' '}
        <Link href="/contact" className="text-primary-600 hover:underline">
          Contact page
        </Link>
        .
      </p>
    </LegalPageLayout>
  );
}
